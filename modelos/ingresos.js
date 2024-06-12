import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";

export const ingresosModelo = sequelize.define("ingresos",{
    id:{
        autoIncrement:true,
        primaryKey:true,
        type: DataTypes.INTEGER,
    },
    tipo:{
        type:DataTypes.STRING,
        allowNull:false,
    },
},
{
    timestamps:false
}

);
