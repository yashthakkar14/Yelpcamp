const express = require('express');
const router = express.Router();
const campgroundController = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


router.get('/', catchAsync(campgroundController.index));

router.get('/new', isLoggedIn, campgroundController.newCampgroundForm);

router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground))

router.get('/:id', catchAsync(campgroundController.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.updateCampgroundForm));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

module.exports = router;