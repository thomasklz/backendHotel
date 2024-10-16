import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";

export const platoconIngredienteModelo = sequelize.define("platoconIngrediente", {
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
  mes: { // Campo para el mes
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  timestamps: false,
});

// Relaciones entre platoconIngredienteModelo y otros modelos

// Relación con platoModelo
platoModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_plato", onDelete: 'CASCADE' });
platoconIngredienteModelo.belongsTo(platoModelo, { foreignKey: "id_plato", onDelete: 'CASCADE' });

// Relación con alimentoModelo
alimentoModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_alimento", onDelete: 'CASCADE' });
platoconIngredienteModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento", onDelete: 'CASCADE' });

// Relación con unidadMedidaModelo
unidadMedidaModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_unidadMedida", onDelete: 'CASCADE' });
platoconIngredienteModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida", onDelete: 'CASCADE' });
