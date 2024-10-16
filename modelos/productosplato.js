import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";

export const productosplatoModelo = sequelize.define("productosplato",{
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidadPersonaCome: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidadPersonaGramo: {
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
  preciounidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  costeo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
    },
    {
      timestamps: false,
    }
  );
  



// ... (resto del código)

platoModelo.hasMany(productosplatoModelo, { foreignKey: "id_plato" , onDelete: 'CASCADE'});
productosplatoModelo.belongsTo(platoModelo, { foreignKey: "id_plato" , onDelete: 'CASCADE'});

alimentoModelo.hasMany(productosplatoModelo, { foreignKey: "id_alimento" , onDelete: 'CASCADE'});
productosplatoModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento" , onDelete: 'CASCADE'});

unidadMedidaModelo.hasMany(productosplatoModelo, { foreignKey: "id_unidadMedida"  , onDelete: 'CASCADE'});
productosplatoModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida" , onDelete: 'CASCADE'});

