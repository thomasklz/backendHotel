import express from 'express';
import {mostraralimentomenuIngredient,crearalimento, mostraralimentoss,editaralimento,eliminaralimento} from '../controladores/alimentoControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();
/* 
rotuer.get('/mostraralimento',obteneralimento);
rotuer.get('/mostraralimentoss',mostraralimentoss);

 */
rotuer.post('/crearalimento',crearalimento);
rotuer.get('/mostraralimentoss',mostraralimentoss);
rotuer.put('/editaralimento/:id',editaralimento);
 rotuer.delete('/eliminaralimento/:id',  eliminaralimento);

 rotuer.get('/mostraralimentomenuIngredient',mostraralimentomenuIngredient);



export default rotuer;