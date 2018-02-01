const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const _ = require('lodash');



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

router.post('/', (req, res) => {

    const userBody = _.pick(req.body, ['email', 'password']);
    const clientBody = _.pick(req.body.client, ['first_name', 'last_name']);

    const newUser = new User(userBody);
    const client = new Client(clientBody);

    newUser.client = client;

    Promise.all([newUser.save(), client.save()]).then((user) => {
        res.status(200).json(user);
    })
    .catch(err => {
        res.status(400).json(err);
    });


})

module.exports = router;