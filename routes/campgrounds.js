const express = require('express');
const router = express.Router();
const campgroundController = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgroundController.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground))
    .post(upload.array('image'), (req, res)=>{
        console.log(req.body, req.files);
        res.send('It worked!');
    })
    
router.get('/new', isLoggedIn, campgroundController.newCampgroundForm);
    
router.route('/:id')
    .get(catchAsync(campgroundController.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.updateCampgroundForm));

module.exports = router;