import Catway from '../models/Catway.js';
import Reservation from '../models/Reservation.js';
import {AppError} from './errors.js';
const fields=['catwayNumber','type','catwayState'];
const validate=(data,full=false)=>{if(Object.keys(data).some(k=>!fields.includes(k)))throw new AppError('Champ non autorisé');if(full&&fields.some(k=>data[k]===undefined))throw new AppError('Tous les champs sont obligatoires');};
/** Liste des catways, triés par numéro. */
export const list=()=>Catway.find().sort({catwayNumber:1});
export async function get(id){const item=await Catway.findById(id);if(!item)throw new AppError('Catway introuvable',404);return item;}
export async function create(data){validate(data,true);return Catway.create(data);}
export async function replace(id,data){validate(data,true);const item=await Catway.findByIdAndUpdate(id,data,{new:true,runValidators:true,overwrite:true});if(!item)throw new AppError('Catway introuvable',404);return item;}
export async function patch(id,data){validate(data);if(!Object.keys(data).length)throw new AppError('Aucun champ à modifier');const item=await Catway.findByIdAndUpdate(id,{$set:data},{new:true,runValidators:true});if(!item)throw new AppError('Catway introuvable',404);return item;}
export async function remove(id){const item=await get(id);if(await Reservation.exists({catwayNumber:item.catwayNumber}))throw new AppError('Supprimez les réservations associées avant ce catway',409);await item.deleteOne();return item;}
