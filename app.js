const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// Importing campground and review routes.
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

// Connecting to the database and then printing if the connection is successful or if we get an error.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log('Database connected!');
})
.catch((err)=>{
    console.log('Oh no Mongo Connection Error!');
    console.log(err);
})

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // 1000 milliseconds * 60 seconds * 60 minutes * 24 hours * 7 days a week
        maxAge: Date.now() + 1000 * 60 * 60 * 24 * 7
    } 
}

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig))



app.get('/', (req, res)=>{
    res.render('home')
})

// Including all the campgrounds Routes.
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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