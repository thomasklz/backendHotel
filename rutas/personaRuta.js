import { Router } from 'express';
import multer from 'multer';
import path from 'path';


import {  editardatos,  uploadImagen,  obtenerPersona,  buscarPersona,  crearPersona,
  editarpersona,  eliminarPersona,  editNombre,  editEmail,  editTelefono,  editFoto,
  crearImagen , crearPersonaCliente
} from '../controladores/personaControlador.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/imagenes/usuario'); // Folder where the images will be stored
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const nombreArchivo = Date.now() + extname; // File name
    cb(null, nombreArchivo);
  },
});

const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const router = Router();  // Cambiado de rotuer a router

router.get('/mostrarpersona', obtenerPersona);
router.post('/persona/imagen/:id', upload.single('image'), uploadImagen);
router.post('/crearPersona', crearPersona);
router.post('/crearPersonaCliente', crearPersonaCliente);


router.put('/editarpersona/:id', editarpersona);
router.delete('/eliminarPersona/:id', eliminarPersona);
router.get('/persona/:id', buscarPersona);
router.put('/editNombre/:id', editNombre);
router.put('/editEmail/:id', editEmail);
router.put('/editTelefono/:id', editTelefono);
router.put('/editFoto/:id', editFoto);
router.put('/editardatos/:id', editardatos);






router.post('/personas/imagen/crearImagen', upload.single('image'), crearImagen);

export default router;  // Cambiado de rotuer a router
