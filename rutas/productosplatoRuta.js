import express from 'express';
import {eliminarproductoPlato,crearingredientesconsuplato,obtenerplatosdeproductos,obtenerproductosplato,obtenerproductosplatos_PorPlato,obtenerDescripcionPlatoproductos} from '../controladores/productosplato.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();
rotuer.post('/crearingredientesconsuplato', crearingredientesconsuplato);
rotuer.get('/obtenerproductosplato', obtenerproductosplato);
rotuer.get('/obtenerplatosdeproductos', obtenerplatosdeproductos);


rotuer.get('/obtenerproductosplatos_PorPlato/:descripcion_plato', obtenerproductosplatos_PorPlato);
rotuer.get('/obtenerDescripcionPlatoproductos/:descripcion_plato', obtenerDescripcionPlatoproductos);

rotuer.delete('/eliminarproductoPlato/:id',  eliminarproductoPlato);

export default rotuer;