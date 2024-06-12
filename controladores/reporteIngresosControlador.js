import { DataTypes } from "sequelize";

import { reporteIngresosModelo } from "../modelos/reporteIngresos.js";
import { menuModelo } from "../modelos/menuModelo.js";
import { Op } from 'sequelize';
import { platoModelo } from "../modelos/platoModelo.js";


 
 

export const crearreporteIngresos = async (req, res) => {
  try {
    const { platos } = req.body;

    // Verificar que se haya enviado al menos un plato
    if (!platos || platos.length === 0) {
      return res.status(400).json({ message: "Se debe enviar al menos un plato" });
    }

    // Obtener la fecha actual
    const fechaActual = new Date();

    // Iterar sobre cada plato recibido
    for (const plato of platos) {
      const { cantidad, id_plato, id_ingreso } = plato;

      // Verificar que todos los campos necesarios estén presentes
      if (!(cantidad && id_plato && id_ingreso)) {
        return res.status(400).json({ message: "Todos los campos son requeridos para cada plato" });
      }

      // Actualizar la cantidad del menú restando la cantidad del crédito
      const menu = await menuModelo.findOne({
        where: {
          id_plato,
          fecha: {
            [Op.gte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0),
            [Op.lte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59),
          },
        },
      });

      if (menu) {
        const nuevaCantidad = menu.cantidad - cantidad;
        await menu.update({ cantidad: nuevaCantidad });
      }

      // Obtener la cantidad fija del menú
      const cantidadFija = menu ? menu.cantidadfija : null;

      // Crear reporte de ingresos
      const mesActual = fechaActual.getMonth() + 1; // Sumar 1 ya que los meses en JavaScript van de 0 a 11

      // Crear reporte de ingresos con la fecha actual
      await reporteIngresosModelo.create({
        cantidad,
        mes: mesActual,
        fecha: fechaActual,
        id_plato,
        id_ingreso,
        cantidadPlato: cantidadFija,
      });
    }

    return res.status(201).json({ message: "Registros de ingresos creados exitosamente" });

  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al crear el reporte de ingresos");
  }
};



 
  




export const buscarReportePorIdYFecha = async (req, res) => {
  try {
    const { id_plato, fecha } = req.params;

    if (!id_plato || !fecha) {
      return res.status(400).json({ message: "id_plato y fecha son campos requeridos" });
    }

    // Parsear la fecha desde el formato de cadena a objeto Date
    const fechaBusqueda = new Date(fecha);

    // Verificar si la fecha es válida
    if (!isValidDate(fechaBusqueda)) {
      return res.status(400).json({ message: "La fecha proporcionada no es válida" });
    }

    // Buscar todos los reportes de ingresos para el plato y fecha especificados
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        id_plato,
        fecha: {
          [Op.between]: [
            new Date(fechaBusqueda.getFullYear(), fechaBusqueda.getMonth(), fechaBusqueda.getDate(), 0, 0, 0),
            new Date(fechaBusqueda.getFullYear(), fechaBusqueda.getMonth(), fechaBusqueda.getDate() + 1, 0, 0, 0),
          ],
        },
      },
    });

    // Verificar si hay informes para la fecha y plato especificados
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No hay informes para la fecha y plato especificados" });
    }

    // Obtener la descripción del plato
    const plato = await platoModelo.findOne({
      where: { id: id_plato },
      attributes: ["descripcion"],
    });

    // Encontrar el informe específico para la fecha buscada
    const informeFechaEspecifica = reportes.find(reporte => {
      const fechaReporte = new Date(reporte.fecha);
      return fechaReporte.toISOString().split('T')[0] === fechaBusqueda.toISOString().split('T')[0];
    });

    // Verificar si se encontró el informe para la fecha especificada
    if (!informeFechaEspecifica) {
      return res.status(404).json({ message: "No hay informe para la fecha y plato especificados" });
    }

    // Obtener la cantidadPlato del informe específico
    const cantidadPlato = informeFechaEspecifica.cantidadPlato;

    // Inicializar sumas para id_ingreso 1 y 2
    let sumaConCredito = 0;
    let sumaSinCredito = 0;

    // Calcular la suma de créditos solo para el plato, la fecha y el id_ingreso específicos
    reportes.forEach(reporte => {
      const fechaReporte = new Date(reporte.fecha);
      if (reporte.id_ingreso === 1 && fechaReporte.toISOString().split('T')[0] === fechaBusqueda.toISOString().split('T')[0]) {
        sumaConCredito += reporte.cantidad;
      } else if (reporte.id_ingreso === 2 && fechaReporte.toISOString().split('T')[0] === fechaBusqueda.toISOString().split('T')[0]) {
        sumaSinCredito += reporte.cantidad;
      }
    });

    // Construir la respuesta
    const respuesta = {
      reporte: {
        fecha: fechaBusqueda.toISOString().split('T')[0],
        plato: plato ? plato.descripcion : "Plato no encontrado",
        conCreditos: sumaConCredito,
        sinCreditos: sumaSinCredito,
        cantidadPlato,
      },
    };

    // Enviar la respuesta al cliente
    res.status(200).json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

  
  

























  
  
  
  
  
  // Función para verificar si la fecha es válida
  function isValidDate(date) {
    return !isNaN(date.getTime());
  }
  
  
 












 


  export const buscarReportePorRangoFechaYPlato = async (req, res) => {
    try {
      const { id_plato, fechaInicio, fechaFin } = req.params;
  
      if (!(id_plato && fechaInicio && fechaFin)) {
        return res.status(400).json({ message: "id_plato, fechaInicio y fechaFin son campos requeridos" });
      }
  
      // Parsear las fechas desde el formato de cadena a objetos Date
      const fechaInicioBusqueda = new Date(fechaInicio);
      const fechaFinBusqueda = new Date(fechaFin);
  
      // Validar que la fecha de inicio sea menor que la fecha de fin
      if (fechaInicioBusqueda > fechaFinBusqueda) {
        return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha de fin" });
      }
  
      // Buscar todos los reportes de ingresos para el plato y rango de fechas especificados
      const reportes = await reporteIngresosModelo.findAll({
        where: {
          id_plato,
          fecha: {
            [Op.between]: [
              fechaInicioBusqueda,
              new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000), // Añadir 24 horas al rango
            ],
          },
          // Agregamos la condición de id_ingreso
          id_ingreso: [1, 2],
        },
      });
  
      // Verificar si hay informes para el rango de fechas y plato especificados
      if (reportes.length === 0) {
        return res.status(404).json({ message: "No hay informes para el rango de fechas y plato especificados" });
      }
  
      // Obtener la descripción del plato
      const plato = await platoModelo.findOne({
        where: {
          id: id_plato,
        },
        attributes: ["descripcion"],
      });
  
      // Encontrar la cantidadPlato del informe específico
      const cantidadPlato = reportes.find(reporte => {
        const fechaReporte = new Date(reporte.fecha);
        return (
          reporte.id_ingreso === 1 &&
          fechaReporte >= fechaInicioBusqueda &&
          fechaReporte < new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000)
        );
      }).cantidadPlato;
  
      // Inicializar sumas para id_ingreso 1 y 2
      let sumaConCredito = 0;
      let sumaSinCredito = 0;
  
      // Calcular la suma de créditos solo para el plato, el rango de fechas y el id_ingreso específicos
      reportes.forEach(reporte => {
        const fechaReporte = new Date(reporte.fecha);
        if (
          reporte.id_ingreso === 1 &&
          fechaReporte >= fechaInicioBusqueda &&
          fechaReporte < new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000)
        ) {
          sumaConCredito += reporte.cantidad;
        } else if (
          reporte.id_ingreso === 2 &&
          fechaReporte >= fechaInicioBusqueda &&
          fechaReporte < new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000)
        ) {
          sumaSinCredito += reporte.cantidad;
        }
      });
  
      // Construir la respuesta
      const respuesta = {
        reporte: {
          fechaInicio: fechaInicioBusqueda.toISOString().split('T')[0],
          fechaFin: fechaFinBusqueda.toISOString().split('T')[0],
          plato: plato ? plato.descripcion : "Plato no encontrado",
          conCreditos: sumaConCredito,
          sinCreditos: sumaSinCredito,
          cantidadPlato,
        },
      };
  
      // Enviar la respuesta al cliente
      res.status(200).json(respuesta);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  
  

  export const buscarReportePorMesYPlato = async (req, res) => {
    try {
      const { id_plato, mes } = req.params;
  
      if (!(id_plato && mes)) {
        return res.status(400).json({ message: "id_plato y mes son campos requeridos" });
      }
  
      // Validar que el mes esté dentro del rango válido (de 1 a 12)
      const mesNum = parseInt(mes);
      if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
        return res.status(400).json({ message: "Mes no válido" });
      }
  
      // Buscar todos los reportes de ingresos para el plato y mes especificados
      const reportes = await reporteIngresosModelo.findAll({
        where: {
          id_plato,
          mes: mesNum,
        },
      });
  
      // Verificar si hay informes para el mes y plato especificados
      if (reportes.length === 0) {
        return res.status(404).json({ message: "No hay informes para el mes y plato especificados" });
      }
  
      // Obtener la descripción del plato
      const plato = await platoModelo.findOne({
        where: {
          id: id_plato,
        },
        attributes: ["descripcion"],
      });
  
      // Encontrar la cantidadPlato del informe específico
      const cantidadPlato = reportes.find(reporte => reporte.mes === mesNum).cantidadPlato;
  
      // Inicializar sumas para id_ingreso 1 y 2
      let sumaConCredito = 0;
      let sumaSinCredito = 0;
  
      // Calcular la suma de créditos para cada id_ingreso
      reportes.forEach(reporte => {
        if (reporte.id_ingreso === 1) {
          sumaConCredito += reporte.cantidad;
        } else if (reporte.id_ingreso === 2) {
          sumaSinCredito += reporte.cantidad;
        }
      });
  
      const respuesta = {
        reporte: {
          mes: mesNum,
          plato: plato ? plato.descripcion : "Plato no encontrado",
          conCreditos: sumaConCredito,
          sinCreditos: sumaSinCredito,
          cantidadPlato,
        },
      };
  
      res.status(200).json(respuesta);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  