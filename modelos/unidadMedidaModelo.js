import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";

export const unidadMedidaModelo = sequelize.define("unidadMedida",{
    id:{
        autoIncrement:true,
        primaryKey:true,
        type: DataTypes.INTEGER,
    },
    unidadMedida:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    valorMedida: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
},
{
    timestamps:false
}

);
   