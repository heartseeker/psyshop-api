const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Qualification = new Schema({
    qualification_name: {
        type: String,
        required: true
    },
    institute_name: {
        type: String,
        required: true
    },
    procurement_year: {
        type: Date,
    }
});

module.exports = Qualification;