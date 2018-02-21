const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;
const QuestionSchema = require('./subdoc/question');

const AppointmentSchema = new Schema({
    start_time: {
        type: Date,
    },
    end_time: {
        type: Date,
    },
    appointment_taken_date: {
        type: Date,
    },
    questions: [QuestionSchema],
    _creator: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

AppointmentSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = mongoose.model('Appointment', AppointmentSchema);