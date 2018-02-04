const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const _ = require('lodash');

const authenticate = require('../middleware/authenticate');


// load models
// ==============================================
const Client = require('../../models/client');
const User = require('../../models/user');


router.get('/', (req, res) => {
    Client.find().populate().then((data) => {
        res.status(200).json(data);
    }, (err) => {
        res.status(400).json(err);
    })
})



// create a client
// ==============================================
router.post('/', (req, res) => {

    const userBody = _.pick(req.body, ['email', 'password']);
    const clientBody = _.pick(req.body.client, ['first_name', 'last_name']);

    const user = new User(userBody);
    user.client = clientBody;

    user.save()
        .then(() => {
            return user.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth', token).json(user);
        })
        .catch(err => {
            res.status(400).json(err);
        });

});


// API client self route
// ==============================================
router.get('/me', authenticate,  (req, res) => {
    res.send(req.user);
});

// update a client
// ==============================================
router.put('/me', authenticate , (req, res) => {
    
    User.findTokenAndUpdate(req).then((user) => {
        res.send(user);
    })
    .catch((err) => {
        res.status(400).json(err);
    })

});

module.exports = router;