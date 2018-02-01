const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Client', ClientSchema);