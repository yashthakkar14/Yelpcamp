const mongoose = require('mongoose');
const Review = require('./review');
// We are storing this in a separate variable just to shorten it up as we will need to make use of mongoose.Schema multiple times later on.
const Schema = mongoose.Schema;

// We don't need to do mongoose.Schema here as we have it stored in a variable named Schema
const CampgroundSchema = new Schema({
    title: String,
    image : String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            // The 'Review' here is the name of the model
            ref: 'Review'
        }
    ]
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


