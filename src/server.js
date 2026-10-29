import 'dotenv/config';
import mongoose from 'mongoose';
import {createApp} from './app.js';
if(!process.env.MONGODB_URI||!process.env.SESSION_SECRET)throw Error('Configurer MONGODB_URI et SESSION_SECRET dans .env');
await mongoose.connect(process.env.MONGODB_URI);
const port=process.env.PORT||3000;createApp().listen(port,()=>console.log(`Russell disponible sur http://localhost:${port}`));
