const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const QualificationSchema = new Schema({
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
    },
    _creator: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

QualificationSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = mongoose.model('Qualification', QualificationSchema);