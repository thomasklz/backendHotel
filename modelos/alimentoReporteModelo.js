import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";
import { alimentoModelo } from "./alimentoModelo.js";
import { compraModelo } from "./compraModelo.js";


export const alimentoReporteModelo = sequelize.define("alimentoReporte",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
     
      cantidadmedidaUnidad: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      preciounidad: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      porcion: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      
      cantidadmedidaUnidadActualizada: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      porcionActualizada: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,  
        allowNull: false,
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
  

 //relacion entre la tabla tipo menu y menu
 unidadMedidaModelo.hasMany(alimentoReporteModelo, { foreignKey: "id_unidadMedida" });
 alimentoReporteModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida" });


 alimentoModelo.hasMany(alimentoReporteModelo, { foreignKey: "id_alimento" });
 alimentoReporteModelo.belongsTo(alimentoModelo, { foreignKey: "id_alimento" });