const mongoose = require('../db/mongoose');
const Schema = mongoose.Schema;
const Client_InfoSchema = require('./subdoc/client-info');

const ClientSchema = new Schema({
    info: Client_InfoSchema,
    spouse: Client_InfoSchema,
});

module.exports = ClientSchema;