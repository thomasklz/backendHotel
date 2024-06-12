import express from 'express';
import {obtenerDescripcionplatoconIngrediente,obtenerListaplatosconIngrediente,crearplatoconIngrediente, obtenerproductosplatos_PorPlato_platoconIngrediente} from '../controladores/platoconIngredienteControlador.js';

import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();


rotuer.post('/crearplatoconIngrediente', crearplatoconIngrediente);
rotuer.get('/obtenerproductosplatos_PorPlato_platoconIngrediente/:descripcion_plato', obtenerproductosplatos_PorPlato_platoconIngrediente);

rotuer.get('/obtenerListaplatosconIngrediente', obtenerListaplatosconIngrediente);

rotuer.get('/obtenerDescripcionplatoconIngrediente/:descripcion_plato', obtenerDescripcionplatoconIngrediente);

/* 
rotuer.get('/obtenerproductosplato', obtenerproductosplato);
rotuer.get('/obtenerplatosdeproductos', obtenerplatosdeproductos);



rotuer.delete('/eliminarproductoPlato/:id',  eliminarproductoPlato);
 */
export default rotuer;