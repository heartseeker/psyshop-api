const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const AvailabilitySchema = new Schema({
    day_of_week: {
        type: String,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    is_available: {
        type: Boolean,
    },
    reason_of_unavailability: {
        type: String,
    },
    _creator: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

AvailabilitySchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = AvailabilitySchema;