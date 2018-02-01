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

// create Model method
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
    .populate('doctor');
}

// show only specific fields on response
// =======================================
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['email', 'doctor', 'client']);
}

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