import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {readFile} from 'node:fs/promises';
import Catway from '../src/models/Catway.js';
import Reservation from '../src/models/Reservation.js';
import User from '../src/models/User.js';
if(!process.env.MONGODB_URI)throw Error('MONGODB_URI manquant');
await mongoose.connect(process.env.MONGODB_URI);
const data=async name=>JSON.parse(await readFile(new URL(`../data/${name}.json`,import.meta.url),'utf8'));
for(const c of await data('catways'))await Catway.updateOne({catwayNumber:c.catwayNumber},{$set:c},{upsert:true});
for(const r of await data('reservations'))await Reservation.updateOne({catwayNumber:r.catwayNumber,clientName:r.clientName,checkIn:new Date(r.checkIn)},{$set:r},{upsert:true});
if(process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){if(!await User.exists({email:process.env.ADMIN_EMAIL}))await User.create({name:process.env.ADMIN_NAME||'Admin',email:process.env.ADMIN_EMAIL,password:await bcrypt.hash(process.env.ADMIN_PASSWORD,12)});}
console.log('Données importées');await mongoose.disconnect();
