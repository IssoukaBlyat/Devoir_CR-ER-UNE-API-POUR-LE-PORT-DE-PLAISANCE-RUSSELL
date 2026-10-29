import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import User from './models/User.js';
import * as catways from './services/catways.js';
import * as reservations from './services/reservations.js';
import {asyncHandler as wrap} from './services/errors.js';
import {requireAuth} from './middleware/auth.js';
import api from './routes/api.js';
const dir=path.dirname(fileURLToPath(import.meta.url));
export function createApp({mongoUri=process.env.MONGODB_URI,sessionStore}={}){
 const app=express();app.disable('x-powered-by');app.set('view engine','ejs');app.set('views',path.join(dir,'views'));app.use(helmet({contentSecurityPolicy:false}));app.use(express.json());app.use(express.urlencoded({extended:false}));app.use(express.static(path.join(dir,'public')));
 app.use(session({name:'russell.sid',secret:process.env.SESSION_SECRET||'dev-only-change-me',resave:false,saveUninitialized:false,store:sessionStore||MongoStore.create({mongoUrl:mongoUri}),cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:86400000}}));
 app.get('/',(req,res)=>res.render('login',{error:null}));
 app.post('/login',wrap(async(req,res)=>{const user=await User.findOne({email:req.body.email}).select('+password');if(!user||!await bcrypt.compare(req.body.password||'',user.password))return res.status(401).render('login',{error:'Identifiants incorrects'});req.session.regenerate(err=>{if(err)return res.status(500).send('Erreur session');req.session.userId=user.id;req.session.userName=user.name;res.redirect('/dashboard');});}));
 app.post('/logout',(req,res)=>req.session.destroy(()=>res.redirect('/')));
 app.get('/dashboard',requireAuth,(req,res)=>res.render('dashboard',{name:req.session.userName}));
 app.get('/catways',requireAuth,wrap(async(req,res)=>res.render('list',{title:'Catways',items:await catways.list(),kind:'catways'})));
 app.get('/reservations',requireAuth,wrap(async(req,res)=>res.render('list',{title:'Réservations',items:await reservations.all(),kind:'reservations'})));
 app.get('/catways/:id',requireAuth,wrap(async(req,res)=>res.render('detail',{title:'Détail du catway',item:await catways.get(req.params.id)})));
 app.get('/reservations/:id',requireAuth,wrap(async(req,res)=>{const r=await (await import('./models/Reservation.js')).default.findById(req.params.id);if(!r)return res.status(404).send('Introuvable');res.render('detail',{title:'Détail de la réservation',item:r});}));
 app.get('/docs',(req,res)=>res.render('docs'));
 app.use('/api',api);
 app.use((err,req,res,next)=>{const status=err.status||(err.name==='CastError'?400:err.code===11000?409:500);const message=status===500?'Erreur interne':err.message;if(req.path.startsWith('/api'))return res.status(status).json({error:message});res.status(status).render('error',{message});});return app;
}
