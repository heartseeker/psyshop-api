const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    question: {
        type: Schema.Types.ObjectId,
        answer: {
            type: String
        }
    }
});

module.exports =  QuestionSchema;