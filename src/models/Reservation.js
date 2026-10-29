import mongoose from 'mongoose';
const schema = new mongoose.Schema({catwayNumber:{type:Number,required:true},clientName:{type:String,required:true,trim:true},boatName:{type:String,required:true,trim:true},checkIn:{type:Date,required:true},checkOut:{type:Date,required:true}},{timestamps:true});
schema.index({catwayNumber:1,checkIn:1,checkOut:1});
export default mongoose.model('Reservation',schema);
