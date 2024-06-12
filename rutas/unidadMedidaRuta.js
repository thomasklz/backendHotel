import express from 'express';
import { crearunidadMedida,obtenerUnidadMedida} from '../controladores/unidadMedidaControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';

const rotuer = express.Router();


rotuer.get('/obtenerUnidadMedida',obtenerUnidadMedida);
rotuer.post('/crearunidadMedida', crearunidadMedida);
export default rotuer;