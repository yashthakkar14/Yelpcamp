const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/makeCampground', async (req, res)=>{
    const camp = new Campground({title : 'My Backyard', description: 'Cheap Camping'});
    await camp.save();
    res.send(camp)
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000')
})