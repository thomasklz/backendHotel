import express from 'express';
import {listados,listadoaCajero,obtenerusuarioestado,cambiarestadousuario,listadoadministradores, obtenerNombrePorUsuario,obtenerusuario,obtenerusuariocedula,obtusuario,editarusuario,eliminarusuario,iniciarSesion,buscarUsuario, editUsuario,editContrasena } from '../controladores/usuarioControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();

rotuer.get('/obtusuario', obtusuario);
rotuer.get('/mostrarusuario', obtenerusuario);
rotuer.get('/obtenerusuarioestado', obtenerusuarioestado);


rotuer.get('/obtenerusuariocedula', obtenerusuariocedula);
rotuer.get('/listadoadministradores', listadoadministradores);
rotuer.get('/listadoaCajero', listadoaCajero);
rotuer.get('/listados', listados);






 rotuer.put('/editarusuario/:id', editarusuario);
rotuer.delete('/eliminarusuario/:id',  eliminarusuario);
rotuer.put('/cambiarestadousuario/:id',  cambiarestadousuario);




rotuer.post('/iniciarSesion', iniciarSesion);
rotuer.get('/buscarUsuario/:id', buscarUsuario);
rotuer.put('/editUsuario/:id', editUsuario);
rotuer.put('/editContrasena/:id', editContrasena);

rotuer.get('/obtenerNombrePorUsuario/:nombreUsuario', obtenerNombrePorUsuario);



export default rotuer;