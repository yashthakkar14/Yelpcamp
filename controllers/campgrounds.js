const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken })

module.exports.index = async (req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.newCampgroundForm = (req, res)=>{
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // we are doing an implicit return of dictionary so we need to wrap round brackets around the dictionary
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
        path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.updateCampgroundForm = async (req, res)=>{
    const id = req.params.id;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    console.log(campground);
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res)=>{
    const {id} = req.params;
    console.log(req.body);
    const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    // The images is already an array, so we won't be pushing array into array and rather spread the array and then push it into the array. 
    campground.images.push(...imgs); 
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({"$pull":{images:{filename:{"$in":req.body.deleteImages}}}})
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground');
    res.redirect('/campgrounds')
}