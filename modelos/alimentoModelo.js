import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { unidadMedidaModelo } from "./unidadMedidaModelo.js";

export const alimentoModelo = sequelize.define("alimento", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: false,
});

// Relación con unidadMedidaModelo
unidadMedidaModelo.hasMany(alimentoModelo, { foreignKey: "id_unidadMedida", onDelete: 'CASCADE' });
alimentoModelo.belongsTo(unidadMedidaModelo, { foreignKey: "id_unidadMedida" });
