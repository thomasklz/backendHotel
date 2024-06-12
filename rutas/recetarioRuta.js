import express from 'express';
 
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
import { buscarPlatoRecetario,mostrarplatoRecetario,crearRecetario,obtenerrecetario_PorPlato ,obtenerplatosdeproductosRecetario,eliminarRecetario} from '../controladores/recetarioControlador.js';
const rotuer = express.Router();
rotuer.post('/crearRecetario', crearRecetario);
rotuer.get('/obtenerrecetario_PorPlato/:descripcion_plato', obtenerrecetario_PorPlato);
rotuer.get('/obtenerplatosdeproductosRecetario', obtenerplatosdeproductosRecetario);
rotuer.delete('/eliminarRecetario/:id',  eliminarRecetario);
rotuer.get('/mostrarplatoRecetario', mostrarplatoRecetario);

rotuer.get('/buscarPlatoRecetario/:descripcion', buscarPlatoRecetario);




/* rotuer.get('/obtenerproductosplato', obtenerproductosplato);
rotuer.get('/obtenerplatosdeproductos', obtenerplatosdeproductos);


rotuer.get('/obtenerDescripcionPlatoproductos/:descripcion_plato', obtenerDescripcionPlatoproductos);

 */

export default rotuer;