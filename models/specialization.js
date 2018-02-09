const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const SpecializationSchema = new Schema({
    specialization_name: {
        type: String,
        required: true
    }
});

SpecializationSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = mongoose.model('Specialization', SpecializationSchema);