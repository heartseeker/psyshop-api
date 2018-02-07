const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;
const DoctorSchema = require('./doctor');
const ClientSchema = require('./client');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const mongooseDelete = require('mongoose-delete');

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
    doctor: DoctorSchema,
    client: ClientSchema
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
    .populate('doctor.qualifications');
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


    if(path[2] === 'clients') {
        return User.findOneAndUpdate({ _id: decoded._id}, { $set: { 'client': req.body.client } }, { new: true, runValidators: true });
    }
    
    return User.findOneAndUpdate({ _id: decoded._id}, { $set: { 'doctor': req.body.doctor } }, { new: true, runValidators: true });
};

// create Model method for doctor qualification
// =======================================
UserSchema.statics.findTokenAndUpdateQualification = function (req) {
    const User = this;
    let decoded;

    
    try {
        decoded = jwt.verify(req.token, 'abc123');
    } catch (e) {
        return Promise.reject(e);
    }

    var path = req.originalUrl.split('/');


    if(path[2] === 'clients') {
        return User.findOneAndUpdate({ _id: decoded._id}, { $set: { 'client': req.body.client } }, { new: true, runValidators: true });
    }
    
    return User.findOneAndUpdate({ _id: decoded._id}, { $set: { 'doctor': req.body.doctor } }, { new: true, runValidators: true });
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

UserSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });

module.exports = mongoose.model('User', UserSchema);