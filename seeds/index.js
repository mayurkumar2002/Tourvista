const mongoose=require('mongoose');
mongoose.set('strictQuery', true);
const cities=require('./cities');
const Destination=require('../models/destination');
const {places,descriptors}=require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/Tourvista');
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample=(array)=>array[Math.floor(Math.random()*array.length)];

const seedDB=async ()=>{
    await Destination.deleteMany({});
    for(let i=0;i<300;i++){
        const random1000=Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const dest=new Destination({
            author: '63fe4404f8bbb199018bf605',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Experience the mesmerizing beauty of pristine beaches, lush rainforests, and vibrant coral reefs in our tropical paradise. Indulge in thrilling water sports, savor exquisite cuisine, and immerse yourself in the rich cultural heritage of our enchanting destination.',
            price,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude] },
            images: [
                {
                  url: 'https://res.cloudinary.com/dtfecgjng/image/upload/v1686138839/Tourvista/sdwassqngulkm7en4zkh.jpg',
                  filename: 'Tourvista/sdwassqngulkm7en4zkh'
                },
                {
                  url: 'https://res.cloudinary.com/dtfecgjng/image/upload/v1686138930/Tourvista/hj168fhyzpuwj1royiee.jpg',
                  filename: 'Tourvista/hj168fhyzpuwj1royiee'
                }
              ]
        })
        await dest.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})

