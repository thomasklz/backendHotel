import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { platoModelo } from "./platoModelo.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";



export const recetarioModelo = sequelize.define("recetario",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
  

        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
          },
    },
    {
      timestamps: false,
    }
  );
  

alimentoModelo.hasMany(recetarioModelo, { foreignKey: "id_alimento" });
recetarioModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento" });

platoModelo.hasMany(recetarioModelo, { foreignKey: "id_plato" });
recetarioModelo.belongsTo(platoModelo, { foreignKey: "id_plato" });


unidadMedidaModelo.hasMany(recetarioModelo, { foreignKey: "id_unidadMedida" });
recetarioModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida" });

  
