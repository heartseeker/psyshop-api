const mongoose = require('mongoose');

// connect to mongoose
// ==============================================
mongoose.connect('mongodb://localhost/psyshop')
.then(() => {
    console.log('Connect to mongodb success!');
})
.catch((err) => {
    console.log('err: ', err);
});


module.exports = mongoose;