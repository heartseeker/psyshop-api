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
    is_guest: {
        type: Boolean,
        default: false
    },
    practicing_from: {
        type: Date,
        default: null
    },
    qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }],
    affiliations: [{ type: Schema.Types.ObjectId, ref: 'Affiliation' }],
    specializations: [{ type: Schema.Types.ObjectId, ref: 'Specialization' }]
});

module.exports = DoctorSchema;