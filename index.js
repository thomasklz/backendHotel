import express from "express";
import cors from "cors";
import { PORT } from "./config/config.js";

import rutausuario from "./rutas/usuarioRuta.js";
import rutapersona from "./rutas/personaRuta.js";
import rutaplato from "./rutas/platoRuta.js";
import rutatipo_menu from "./rutas/tipo_menuRuta.js";
import rutamenu from "./rutas/menuRuta.js";
import rutacredito from "./rutas/creditoRuta.js";
import rutaalimento from "./rutas/alimentoRuta.js";
import rutaingredientes from "./rutas/ingredientesRuta.js";
import rutatipo_usuario from "./rutas/tipo_usuarioRuta.js";
import rutaproductosplato from "./rutas/productosplatoRuta.js";
import rutareporteIngresos from "./rutas/reporteIngresosRuta.js";
import rutaunidadMedida from "./rutas/unidadMedidaRuta.js";
import rutacompra from "./rutas/compraRuta.js";
import rutarecetario from "./rutas/recetarioRuta.js";
import rutaplatoconIngrediente from "./rutas/platoconIngredienteRuta.js";

import { sequelize } from "./base_de_datos/conexion.js";

const _PORT = PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", rutausuario);
app.use("/api", rutapersona);
app.use("/api", rutaplato);
app.use("/api", rutatipo_menu);
app.use("/api", rutamenu);
app.use("/api", rutacredito);
app.use("/api", rutaalimento);
app.use("/api", rutaingredientes);
app.use("/api", rutatipo_usuario);
app.use("/api", rutaproductosplato);
app.use("/api", rutareporteIngresos);
app.use("/api", rutaunidadMedida);
app.use("/api", rutacompra);
app.use("/api", rutarecetario);
app.use("/api", rutaplatoconIngrediente);


 



import { fileURLToPath } from 'url';
import path  from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para servir archivos estáticos desde la carpeta "uploads/imagenes/usuario"

const staticRoute = path.join(__dirname, 'uploads/imagenes/usuario');
app.use('/imagenes', express.static(staticRoute));

 

// Ruta para servir la imagen por defecto
const rutaImagenEstatica = path.join(__dirname, 'uploads', 'imagenes', 'usuario', 'fotoIconoUsuario.jpeg');
app.use('/imagenes/usuario', express.static(rutaImagenEstatica));





const main = async () => {
  try {
    await sequelize.authenticate();
    console.log("la Base de datos esta correctamente conectada.");
    await sequelize.sync({ force: false });
    app.listen(_PORT, () => {
      console.log(`Servidor corriendo en el puerto => ${_PORT}`);
    });
  } catch (error) {
    console.log(`Error ${error}`);
  }
};
main();
