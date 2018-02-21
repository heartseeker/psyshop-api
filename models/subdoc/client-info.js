const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Client_InfoSchema = new Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    phone: {
        type: String,
    },
    dob: {
        type: Date,
    },
    marital_status: {
        type: String,
    },
    education: {
        type: String,
    },
    occupation: {
        type: String,
    },
    employer: {
        type: String,
    },
    is_refer: {
        type: Boolean,
        default: false
    }
});

module.exports = Client_InfoSchema;