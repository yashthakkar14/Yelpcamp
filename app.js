const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

app.post('/campgrounds', catchAsync(async(req, res, next)=>{
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id/edit', catchAsync(async (req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}));


app.get('/campgrounds/:id', catchAsync(async(req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
}));

app.put('/campgrounds/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true});
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async(req, res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));


// This will only run if nothing else is matched first and we didn't respond from any of them.
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found'), 404);
})

// Error handling middleware
app.use((err, req, res, next)=>{
    const {statusCode=500, message='Something went wrong!'} = err;
    res.status(statusCode).send(message);
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})