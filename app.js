const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
// The below schemas are the Joi schema for the purpose of validation
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

// Importing campground routes.
const campgrounds = require('./routes/campgrounds');

// Connecting to the database and then printing if the connection is successful or if we get an error.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log('Database connected!');
})
.catch((err)=>{
    console.log('Oh no Mongo Connection Error!');
    console.log(err);
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        // We need to do the below as details is basically an array of objects.
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}

app.use('/campgrounds', campgrounds)

app.get('/', (req, res)=>{
    res.render('home')
})



app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {"$pull":{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


// This will only run if nothing else is matched first and we didn't respond from any of them.
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found'), 404);
})

// Error handling middleware
app.use((err, req, res, next)=>{
    const {statusCode=500, message='Something went wrong!'} = err;
    if(!err.message) err.message = 'Oh No, something went wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})