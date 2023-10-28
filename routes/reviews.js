const express = require('express');
const router = express.Router({ mergeParams:true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const Review= require('../models/review');
const reviewController = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))

module.exports = router;