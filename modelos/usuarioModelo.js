import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { personaModelo } from "./personaModelo.js";
import { tipo_usuarioModelo } from "./tipo_usuarioModelo.js";

export const usuarioModelo = sequelize.define("usuarios",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Identificacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contrasena: {
        type: DataTypes.STRING,
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
 
//relacion entre la tabla tipo usuario y usuario
tipo_usuarioModelo.hasMany(usuarioModelo, { foreignKey: "id_tipousuario", onDelete: "CASCADE", onUpdate: "CASCADE" });
usuarioModelo.belongsTo(tipo_usuarioModelo, { foreignKey: "id_tipousuario", onDelete: "CASCADE", onUpdate: "CASCADE" });


//relacion entre la tabla persona y usuario
personaModelo.hasMany(usuarioModelo, { foreignKey: "id_persona", onDelete: "CASCADE", onUpdate: "CASCADE" });
usuarioModelo.belongsTo(personaModelo, { foreignKey: "id_persona", onDelete: "CASCADE", onUpdate: "CASCADE" });
  