const mongoose = require('mongoose');
const Review = require('./review');
// We are storing this in a separate variable just to shorten it up as we will need to make use of mongoose.Schema multiple times later on.
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/h_500,w_800');
})

const opts = {toJSON: {virtuals: true}}

const CampgroundSchema = new Schema({
    title: String,
    images : [
        ImageSchema
    ],
    geometry: {
        type: {
          type: String, 
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            // The 'Review' here is the name of the model
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popupMarkup').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.description.substring(0,20)}...`
})

// The below middleware will run after we delete the campground
CampgroundSchema.post('findOneAndDelete', async function(document) {
    // The below document is the document that was just deleted.
    // console.log(document);
    if(document){
        // We will be removing all the reviews present in the document reviews array.
        await Review.deleteMany({
            _id:{
                $in: document.reviews
            }
        })
    }
})

// Obviously, we can also store the below result in a variable and then export it
module.exports = mongoose.model('Campground', CampgroundSchema);


