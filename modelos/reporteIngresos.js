import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { menuModelo } from "./menuModelo.js"; // Asegúrate de importar el modelo de menú
import { ingresosModelo } from "./ingresos.js";

export const reporteIngresosModelo = sequelize.define(
  "reporteIngresos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
 
    cantidadPlato: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mes: { // Agregar el campo "mes"
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    }, 
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }, 
    
   
  },
  {
    timestamps: false,
  }
);

// ... (resto del código)

platoModelo.hasMany(reporteIngresosModelo, { foreignKey: "id_plato", onDelete: "CASCADE", onUpdate: "CASCADE" });
reporteIngresosModelo.belongsTo(platoModelo, { foreignKey: "id_plato", onDelete: "CASCADE", onUpdate: "CASCADE" });

ingresosModelo.hasMany(reporteIngresosModelo, { foreignKey: "id_ingreso", onDelete: "CASCADE", onUpdate: "CASCADE" });
reporteIngresosModelo.belongsTo(ingresosModelo, { foreignKey: "id_ingreso", onDelete: "CASCADE", onUpdate: "CASCADE" });


