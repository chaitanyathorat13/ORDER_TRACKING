const express = require('express');
const router = express.Router();

const userController = require('../controller/user')


router.post('/sign-up', userController.createUser);
router.post('/sign-in', userController.checkUser)

module.exports = router;