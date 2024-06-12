import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";

export const platoconIngredienteModelo = sequelize.define("platoconIngrediente",{
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
 
    },
    {
      timestamps: false,
    }
  );
  



// ... (resto del código)

platoModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_plato" });
platoconIngredienteModelo.belongsTo(platoModelo, { foreignKey: "id_plato" });

alimentoModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_alimento" });
platoconIngredienteModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento" });

unidadMedidaModelo.hasMany(platoconIngredienteModelo, { foreignKey: "id_unidadMedida"});
platoconIngredienteModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida" });

