import express from 'express';
import { crearreporteIngresos,buscarReportePorIdYFecha,buscarReportePorRangoFechaYPlato,buscarReportePorMesYPlato} from '../controladores/reporteIngresosControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const rotuer = express.Router();


rotuer.post('/crearreporteIngresos', crearreporteIngresos);

 rotuer.get('/buscarReportePorIdYFecha/:id_plato/:fecha', buscarReportePorIdYFecha);
 rotuer.get('/buscarReportePorRangoFechaYPlato/:id_plato/:fechaInicio/:fechaFin', buscarReportePorRangoFechaYPlato);
 rotuer.get('/buscarReportePorMesYPlato/:id_plato/:mes', buscarReportePorMesYPlato);


/* 

rotuer.get('/mostrarcredito', obtenercredito);
rotuer.get('/obtenerreporteporusuario/:id', obtenerreporteporusuario);


rotuer.put('/editarcredito/:id', editarcredito);
rotuer.delete('/eliminarcreditosss/:id',  eliminarcreditosss);


rotuer.get('/ingresos/:fecha/:id_plato', ingresos); */

export default rotuer;