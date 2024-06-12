import express from 'express';
import { obtenertipo_menu,creartipo_menu,editartipo_menu,eliminartipo_menu} from '../controladores/tipo_menuControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/mostrartipo_menu',obtenertipo_menu);
rotuer.post('/creartipo_menu', creartipo_menu);
rotuer.put('/editartipo_menu/:id',editartipo_menu);
rotuer.delete('/eliminartipo_menu/:id',  eliminartipo_menu);


export default rotuer;