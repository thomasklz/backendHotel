import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";

export const personaModelo = sequelize.define("persona",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Nombre2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Apellido1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Apellido2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      EmailInstitucional: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      TelefonoC: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      foto: {
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
  