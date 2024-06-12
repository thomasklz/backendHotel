import express from 'express';
import { obtenertipo_usuario,creartipo_usuario,editartipo_usuario,eliminartipo_usuario} from '../controladores/tipo_usuarioControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/mostrartipo_usuario',obtenertipo_usuario);
rotuer.post('/creartipo_usuario', creartipo_usuario);
rotuer.put('/editartipo_usuario/:id',editartipo_usuario);
rotuer.delete('/eliminartipo_usuario/:id',  eliminartipo_usuario);


export default rotuer;