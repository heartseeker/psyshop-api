const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;
const Doctor = require('./doctor');
const Client = require('./client');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value)
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        }
    }],
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client'
    }
});

// create instance method
// =======================================
UserSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
}

// show only specific fields on response
// =======================================
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['email', 'doctor', 'client']);
}


// delete token
// =======================================
UserSchema.methods.removeToken = function(token) {
    const user = this;
    
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
}


// create Model method for finding user by token
// =======================================
UserSchema.statics.findByToken = function(token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        return Promise.reject(e);
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
    .populate('doctor')
    .populate('client');
}


// create Model method for logging n
// =======================================
UserSchema.statics.findByCredentials = function (email, password) {
    const User = this;
  
    return User.findOne({email}).then((user) => {
      if (!user) {
        return Promise.reject();
      }
  
      return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
              console.log('in!');
            resolve(user);
          } else {
            reject();
          }
        });
      });
    });
  };


// create Model method for updating user
// =======================================
UserSchema.statics.findTokenAndUpdate = function (req) {
    const User = this;
    let decoded;

    
    try {
        decoded = jwt.verify(req.token, 'abc123');
    } catch (e) {
        return Promise.reject(e);
    }

    var path = req.originalUrl.split('/');

    return User.findOne({_id: decoded._id}).then((user) => {
        if(!user) {
            return Promise.reject();
        }

        if(path[2] === 'clients') {
            if (!user.client) {
                return Promise.reject();
            }
            return Client.findOneAndUpdate({ _id: user.client }, { $set: req.body.client }, { new: true });
        }
        
        if (!user.doctor) {
            return Promise.reject();
        }
        return Doctor.findOneAndUpdate({ _id: user.doctor}, { $set: req.body.doctor }, { new: true });
    })

};

// hash password before save
// =======================================
UserSchema.pre('save', function(next) {

    const user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});



module.exports = mongoose.model('User', UserSchema);