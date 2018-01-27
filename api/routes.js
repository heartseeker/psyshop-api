const express = require('express');

let router = express.Router();


// Doctors API endpoints
// ==============================================
router.use('/doctors', require('./doctors/doctors'));

// Clients API endpoints 
// ==============================================
router.use('/clients', require('./clients/clients'));


module.exports = router;