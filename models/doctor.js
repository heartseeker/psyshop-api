const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;

// Create Doctors Schema
const DoctorSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    professional_statement: {
        type: String,
        required: true
    },
    practicing_from: {
        type: Date,
        default: null
    }
});

const doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = doctor;