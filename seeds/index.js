// We will run this file on its own, separately from our node app, anytime we want to seed our database.

const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');

// Connecting to the database and then printing if the connection is successful or if we get an error.
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(()=>{
    console.log('Database connected!');
})
.catch((err)=>{
    console.log('Oh no Mongo Connection Error!');
    console.log(err);
})

// This will return a random element from an array, the array index will range from 0 to the length of the array.
const sample = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async() =>{
    // First, delete everything in the collection.
    await Campground.deleteMany({})
    // const c = new Campground({title : 'purple field'})
    // await c.save();
    for(let i=0; i<50; i++){
        // There are 1000 cities in the cities array
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: "653a73443faf413977298f19",
            location : `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  "url": "https://res.cloudinary.com/devonxjm9/image/upload/v1698511791/YelpCamp/xnhgxn6j5xes7q36y6bn.jpg",
                  "filename": "YelpCamp/xnhgxn6j5xes7q36y6bn",
                },
                {
                  "url": "https://res.cloudinary.com/devonxjm9/image/upload/v1698511792/YelpCamp/ielmrzebclqzryzctyim.jpg",
                  "filename": "YelpCamp/ielmrzebclqzryzctyim",
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur atque sapiente est quos provident labore aliquid repellendus ea magni, aut tempora fugit dolore praesentium odio ipsam ab porro distinctio impedit!',
            // The below line is equivalent to price:price
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [ -113.133115, 47.020078 ] 
            }
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});