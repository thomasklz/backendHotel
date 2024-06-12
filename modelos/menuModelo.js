import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";

import { platoModelo } from "./platoModelo.js";
export const menuModelo = sequelize.define("menus",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
     
      habilitado: {
          type: DataTypes.BOOLEAN,
        
        },
        cantidad: {
          type: DataTypes.INTEGER,
        },
        
        cantidadfija: {
          type: DataTypes.INTEGER,
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
 //relacion entre la tabla tipo menu y menu
 platoModelo.hasMany(menuModelo, { foreignKey: "id_plato" });
  menuModelo.belongsTo(platoModelo, { foreignKey: "id_plato" });
// En tu modelo de menu
menuModelo.belongsTo(platoModelo, { foreignKey: "id_plato", onDelete: 'CASCADE' });



