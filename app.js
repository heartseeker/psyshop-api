const express = require('express');

const app = express();

const port = process.env.PORT || 8000;

const bodyParser = require('body-parser');

const routes = require('./api/routes');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// api route
// ==============================================
app.use('/api', routes);


app.listen(port, () => {
    console.log('listening on port: ' + port);
});