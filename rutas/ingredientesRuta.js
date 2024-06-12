import express from 'express';
import {eliminaringredientescreados,obtenerfiltropormes,obtenerfiltroporsemanas,obtenerfiltropordias,buscarPorFecha, obtenerplatosdeingredientes,obteneringredientes,obtenerDescripcionPlatoyprecio,crearingredientes,editaringredientes,eliminaringredientes,obtenerIngredientesPorPlato,obtenerPlatos,obtenerDescripcionPlato} from '../controladores/ingredientesControlador.js';
import  {verifyToken}  from '../software_intermedio/autenticacion.js';
const router = express.Router();

router.get('/mostraringredientes', obteneringredientes);
router.get('/obtenerplatosdeingredientes', obtenerplatosdeingredientes);


router.post('/crearingredientes', crearingredientes);
router.put('/editaringredientes/:id', editaringredientes);

// Rutas de ingredientes
router.get('/obtenerIngredientesPorPlato/:descripcion_plato', obtenerIngredientesPorPlato);
router.get('/obtenerDescripcionPlato/:descripcion_plato', obtenerDescripcionPlato);
router.get('/obtenerDescripcionPlatoyprecio/:descripcion_plato', obtenerDescripcionPlatoyprecio);



router.get('/mostraringredientesdescripcion', obtenerPlatos);
router.get('/obtenerfiltropordias/:fecha/:idAlimento', obtenerfiltropordias);

router.get('/obtenerfiltroporsemanas/:idAlimento/:fechaInicio/:fechaFin', obtenerfiltroporsemanas);

router.get('/obtenerfiltropormes/:id_alimento/:mes', obtenerfiltropormes);



router.delete('/eliminaringredientes/:id',  eliminaringredientes);

router.delete('/eliminaringredientescreados/:id',  eliminaringredientescreados);



router.get('/buscarPorFecha/:id_plato/:fecha', buscarPorFecha);

export default router;