import express from 'express';
import {mostrartodoslosplatosMenu,mostrarplatomenu, mostrarplato,mostrarplatocredito,mostrartodoslosplatos,crearplatos,editarplatos,eliminarplatos,obtenerplato} from '../controladores/platoControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/mostrarplato',mostrarplato);
rotuer.get('/mostrartodoslosplatos',mostrartodoslosplatos);

rotuer.get('/obtenerplato',obtenerplato);
rotuer.post('/crearplato', crearplatos);
rotuer.put('/editarplato/:id',editarplatos);
rotuer.delete('/eliminarplato/:id',  eliminarplatos);
rotuer.get('/mostrartodoslosplatosMenu',mostrartodoslosplatosMenu);


rotuer.get('/mostrarplatocredito',mostrarplatocredito);


rotuer.get('/mostrarplatomenu',mostrarplatomenu);


export default rotuer;