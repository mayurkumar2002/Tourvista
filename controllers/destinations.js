const Destination=require('../models/destination');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req,res)=>{
    const destinations=await Destination.find({});
    res.render('destinations/index',{destinations});
}

module.exports.renderNewForm = (req,res)=>{
    res.render('destinations/new');
}

module.exports.createDestination = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.destination.location,
        limit: 1
    }).send()
    const destination=new Destination(req.body.destination);
    destination.geometry=geoData.body.features[0].geometry;
    destination.images =req.files.map(f=> ({url: f.path, filename: f.filename}));
    destination.author=req.user._id;
    await destination.save();
    // console.log(destination);
    req.flash('success','Successfully made a new Destination');
    res.redirect(`/destinations/${destination._id}`);
}

module.exports.showDestination = async (req,res)=>{
    const destination=await Destination.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(destination);
    if(!destination){
        req.flash('error','Cannot find that destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/show',{destination});
}

module.exports.renderEditForm = async (req,res)=>{
    const {id}=req.params;
    const destination=await Destination.findById(id);
    if(!destination){
        req.flash('error','Cannot find that destination');
        return res.redirect('/destinations');
    }
    res.render('destinations/edit',{destination});
}

module.exports.updateDestination = async (req,res)=>{
    const {id}=req.params;
    // console.log(req.body);
    const destination=await Destination.findByIdAndUpdate(id,{...req.body.destination});
    const imgs=req.files.map(f=> ({url: f.path, filename: f.filename}));
    destination.images.push(...imgs);
    await destination.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await destination.updateOne({$pull : {images: {filename: {$in : req.body.deleteImages}}}});
    }
    req.flash('success','Successfully Updated Destination');
    res.redirect(`/destinations/${destination._id}`);
}

module.exports.delete = async(req,res)=>{
    const {id}=req.params;
    await Destination.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted Destination!');
    res.redirect('/destinations');
}