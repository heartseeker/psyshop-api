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
    },
    qualifications: [{ type: Schema.Types.ObjectId, ref: 'Qualification' }]
});

// module.exports = mongoose.model('Doctor', DoctorSchema);

module.exports = DoctorSchema;