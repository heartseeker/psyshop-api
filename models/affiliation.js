const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const AffiliationSchema = new Schema({
    name: {
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
    start_date: {
        type: Date,
    },
    end_date: {
        type: Date,
    },
    offices: [{ type: Schema.Types.ObjectId, ref: 'Office' }],
    _creator: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

AffiliationSchema.plugin(mongooseDelete, { deletedAt : true, overrideMethods: true });
module.exports = mongoose.model('Affiliation', AffiliationSchema);