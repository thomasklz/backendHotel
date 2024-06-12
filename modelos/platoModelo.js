import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { tipo_menuModelo } from "./tipo_menuModelo.js";

export const platoModelo = sequelize.define("platos",{
    id:{
        autoIncrement:true,
        primaryKey:true,
        type: DataTypes.INTEGER,
    },
    descripcion:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
},
{
    timestamps:false
}
);
   //relacion entre la tabla tipo menu y plato 
 

tipo_menuModelo.hasMany(platoModelo, { foreignKey: "id_tipomenu", onDelete: "CASCADE", onUpdate: "CASCADE" });
platoModelo.belongsTo(tipo_menuModelo, { foreignKey: "id_tipomenu", onDelete: "CASCADE", onUpdate: "CASCADE" });
