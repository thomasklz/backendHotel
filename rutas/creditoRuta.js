import express from 'express';
import { ingresos,obtenercredito,crearcredito,editarcredito,eliminarcreditosss,obtenerreporteporusuario} from '../controladores/creditoControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/mostrarcredito', obtenercredito);
rotuer.get('/obtenerreporteporusuario/:id', obtenerreporteporusuario);


rotuer.post('/crearcredito', crearcredito);
rotuer.put('/editarcredito/:id_persona', editarcredito);
rotuer.delete('/eliminarcreditosss/:id',  eliminarcreditosss);


rotuer.get('/ingresos/:fecha/:id_plato', ingresos);

export default rotuer;