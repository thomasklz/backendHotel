import express from 'express';
import {mostrarparalaweb,  mostrarmenu,mostrarfechamenuregistro,mostrarfechamenu,crearmenu,editarmenu,eliminarmenu,mostrardesayuno,mostraralmuerzo,mostrarmerienda, obtenerMenuPorFecha} from '../controladores/menuControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/mostrarmenu',mostrarmenu);
rotuer.get('/mostrarfechamenu',mostrarfechamenu);
rotuer.get('/mostrarfechamenuregistro',mostrarfechamenuregistro);

rotuer.get('/mostrarparalaweb',mostrarparalaweb);


rotuer.get('/mostrardesayuno',mostrardesayuno);
rotuer.get('/mostraralmuerzo',mostraralmuerzo);
rotuer.get('/mostrarmerienda',mostrarmerienda);
rotuer.get('/obtenerMenuPorFecha/:fecha',obtenerMenuPorFecha);


rotuer.post('/crearmenu', crearmenu);
rotuer.put('/editarmenu/:id',editarmenu);
rotuer.delete('/eliminarmenu/:id',  eliminarmenu);


export default rotuer;