const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const {campgroundSchema} = require('../schemas.js')

const { isLoggedIn } = require('../middleware')

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');



const validateCampground = (req, res, next) => {
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        // We need to do the below as details is basically an array of objects.
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}


router.get('/', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/new', isLoggedIn, (req, res)=>{
    res.render('campgrounds/new');
})

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    res.render('campgrounds/edit', {campground});
}));


router.get('/:id', catchAsync(async(req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that');
        res.redirect(`/campgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground');
    res.redirect('/campgrounds')
}));

module.exports = router;