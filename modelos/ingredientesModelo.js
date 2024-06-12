import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { menuModelo } from "./menuModelo.js"; // Asegúrate de importar el modelo de menú
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";

export const ingredientesModelo = sequelize.define(
  "ingredientes",
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
    cantidadPersonaCome: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cantidadPersonaGramo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
   
    costeo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    
    costeounaPersona: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    preciounidad: {
      type: DataTypes.FLOAT,
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
    porcion: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    
  },
  {
    timestamps: false,
  }
);

// ... (resto del código)

platoModelo.hasMany(ingredientesModelo, { foreignKey: "id_plato", onDelete: "CASCADE" });
ingredientesModelo.belongsTo(platoModelo, { foreignKey: "id_plato", onDelete: "CASCADE"});

alimentoModelo.hasMany(ingredientesModelo, { foreignKey: "id_alimento", onDelete: "CASCADE"});
ingredientesModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento", onDelete: "CASCADE"});


unidadMedidaModelo.hasMany(ingredientesModelo, { foreignKey: "id_unidadMedida", onDelete: "CASCADE" });
ingredientesModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida", onDelete: "CASCADE" });


