import Reservation from '../models/Reservation.js';
import Catway from '../models/Catway.js';
import {AppError} from './errors.js';
async function catway(id){const c=await Catway.findById(id);if(!c)throw new AppError('Catway introuvable',404);return c;}
export async function list(id){const c=await catway(id);return Reservation.find({catwayNumber:c.catwayNumber}).sort({checkIn:1});}
export async function get(id,rid){const c=await catway(id);const r=await Reservation.findOne({_id:rid,catwayNumber:c.catwayNumber});if(!r)throw new AppError('Réservation introuvable',404);return r;}
/** Refuse les dates invalides et les réservations qui se chevauchent. */
export async function create(id,data){const c=await catway(id);const {clientName,boatName,checkIn,checkOut}=data;const start=new Date(checkIn),end=new Date(checkOut);if(!clientName||!boatName||!Number.isFinite(+start)||!Number.isFinite(+end)||start>=end)throw new AppError('Données de réservation invalides');if(await Reservation.exists({catwayNumber:c.catwayNumber,checkIn:{$lt:end},checkOut:{$gt:start}}))throw new AppError('Catway déjà réservé sur cette période',409);return Reservation.create({catwayNumber:c.catwayNumber,clientName,boatName,checkIn:start,checkOut:end});}
export async function remove(id,rid){const r=await get(id,rid);await r.deleteOne();return r;}
export const all=()=>Reservation.find().sort({checkIn:-1});
