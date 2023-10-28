const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const userController = require('../controllers/users')

router.get('/register', userController.registerForm)
router.post('/register', catchAsync(userController.register));
router.get('/login', userController.loginForm);
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), userController.login);

router.get('/logout', userController.logout);

module.exports = router;