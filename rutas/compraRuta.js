import express from 'express';
import {buscarFechaCompra,mostrarCompraAlimmentosReportes,mostrarCompraNoExistente,mostrarCompraExistente,mostrarCompra,gestionarAlimento,mostraralimentoss,getalimentos, mostraralimentomenu, obteneralimento,crearalimento,editaralimento,eliminaralimentoCompra} from '../controladores/compraControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();


rotuer.get('/mostrarCompra',mostrarCompra);
rotuer.get('/mostrarCompraExistente',mostrarCompraExistente);
rotuer.get('/mostrarCompraNoExistente',mostrarCompraNoExistente);
rotuer.get('/mostrarCompraAlimmentosReportes',mostrarCompraAlimmentosReportes);
rotuer.get('/buscarFechaCompra/:fecha',buscarFechaCompra);




rotuer.get('/mostraralimento',obteneralimento);
rotuer.get('/mostraralimentoss',mostraralimentoss);

rotuer.get('/getalimentos',getalimentos);

rotuer.post('/crearalimento',crearalimento);
rotuer.put('/editaralimento/:id',editaralimento);
rotuer.delete('/eliminaralimentoCompra/:id',  eliminaralimentoCompra);

rotuer.get('/mostraralimentomenu',mostraralimentomenu);




rotuer.post('/gestionarAlimento',gestionarAlimento);



export default rotuer;