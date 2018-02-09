const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const OfficeSchema = new Schema({
    time_slot_per_client_in_min: {
        type: Number,
        required: true
    },
    first_consultation_fee: {
        type: Number,
        required: true
    },
    followup_consultation_fee: {
        type: String,
        required: true
    },
    street_address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    _creator: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

OfficeSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = mongoose.model('Office', OfficeSchema);