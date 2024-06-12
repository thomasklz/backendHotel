import { DataTypes } from "sequelize";
import { sequelize } from "../base_de_datos/conexion.js";
import { platoModelo } from "./platoModelo.js";
import { personaModelo } from "./personaModelo.js";
import { ingresosModelo } from "./ingresos.js";



export const creditoModelo = sequelize.define(
  "credito",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATEONLY, // Use DATEONLY instead of DATE
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
   
    pagado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,

    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    precio_final : {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

// ... (resto del código)

personaModelo.hasMany(creditoModelo, { foreignKey: "id_persona", onDelete: "CASCADE", onUpdate: "CASCADE" });
creditoModelo.belongsTo(personaModelo, { foreignKey: "id_persona", onDelete: "CASCADE", onUpdate: "CASCADE" });

platoModelo.hasMany(creditoModelo, { foreignKey: "id_plato", onDelete: "CASCADE", onUpdate: "CASCADE" });
creditoModelo.belongsTo(platoModelo, { foreignKey: "id_plato", onDelete: "CASCADE", onUpdate: "CASCADE" });


ingresosModelo.hasMany(creditoModelo, { foreignKey: "id_ingreso", onDelete: "CASCADE", onUpdate: "CASCADE" });
creditoModelo.belongsTo(ingresosModelo, { foreignKey: "id_ingreso", onDelete: "CASCADE", onUpdate: "CASCADE" });

