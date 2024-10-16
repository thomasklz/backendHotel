// rutas/reporteIngresosRuta.js
import express from 'express';
import {buscarPorSemana, buscarPorMes, buscarReportePorFecha, crearreporteIngresos, buscarReportePorIdYFecha, buscarReportePorRangoFechaYPlato, buscarReportePorMesYPlato } from '../controladores/reporteIngresosControlador.js';

const router = express.Router();

router.post('/crearreporteIngresos', crearreporteIngresos);
router.get('/buscarReportePorIdYFecha/:id_plato/:fecha', buscarReportePorIdYFecha);
router.get('/buscarReportePorRangoFechaYPlato/:id_plato/:fechaInicio/:fechaFin', buscarReportePorRangoFechaYPlato);
router.get('/buscarReportePorMesYPlato/:id_plato/:mes', buscarReportePorMesYPlato);
router.get('/buscarReportePorFecha/:fecha', buscarReportePorFecha);
router.get('/buscarPorMes/:mes', buscarPorMes); // Ruta para buscar por mes
router.get('/buscarPorSemana/:fechaInicio/:fechaFin', buscarPorSemana);


export default router;
