import mongoose from 'mongoose';
const schema = new mongoose.Schema({catwayNumber:{type:Number,required:true,unique:true,min:1},type:{type:String,enum:['long','short'],required:true},catwayState:{type:String,required:true,trim:true}},{timestamps:true});
export default mongoose.model('Catway',schema);
