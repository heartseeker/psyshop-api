const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

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
    },
    qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }]
});

DoctorSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });

module.exports = mongoose.model('Doctor', DoctorSchema);