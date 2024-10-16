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

    // Crear una lista para almacenar los errores de cantidad
    const erroresCantidad = [];

    // Verificar la cantidad disponible para cada plato
    for (const plato of platos) {
      const { cantidad, id_plato, id_ingreso } = plato;

      // Verificar que todos los campos necesarios estén presentes
      if (!(cantidad && id_plato && id_ingreso)) {
        return res.status(400).json({ message: "Todos los campos son requeridos para cada plato" });
      }

      // Obtener el menú correspondiente al plato
      const menu = await menuModelo.findOne({
        where: {
          id_plato,
          fecha: {
            [Op.gte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0),
            [Op.lte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59),
          },
        },
      });

      // Verificar si se encontró el menú
      if (!menu) {
        console.error(`No se encontró un menú para el plato con ID: ${id_plato}`);
        return res.status(500).json("Error al obtener el menú");
      }

      // Verificar si la cantidad disponible en el menú es suficiente
      if (menu.cantidad < cantidad) {
        erroresCantidad.push(id_plato);
      }
    }

    // Si hay errores de cantidad, devolverlos
    if (erroresCantidad.length > 0) {
      const erroresPlatos = await Promise.all(erroresCantidad.map(async (id_plato) => {
        const plato = await platoModelo.findByPk(id_plato);
        return plato ? plato.descripcion : `Plato con ID ${id_plato}`;
      }));
      return res.status(400).json({ message: `No hay suficientes platos disponibles para: ${erroresPlatos.join(', ')}` });
    }

    // Si todas las verificaciones son exitosas, proceder con la actualización y registro
    for (const plato of platos) {
      const { cantidad, id_plato, id_ingreso } = plato;

      // Obtener el menú correspondiente al plato
      const menu = await menuModelo.findOne({
        where: {
          id_plato,
          fecha: {
            [Op.gte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0),
            [Op.lte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59),
          },
        },
      });

      // Obtener el precio del plato desde platoModelo
      const platoData = await platoModelo.findByPk(id_plato);
      if (!platoData) {
        console.error(`No se encontró el plato con ID: ${id_plato}`);
        return res.status(500).json("Error al obtener el plato");
      }
      const precio = platoData.precio;

      // Actualizar la cantidad del menú restando la cantidad del crédito
      if (menu) {
        const nuevaCantidad = menu.cantidad - cantidad;
        await menu.update({ cantidad: nuevaCantidad });
      }

      // Obtener la cantidad fija del menú
      const cantidadFija = menu ? menu.cantidadfija : null;

      // Crear reporte de ingresos con la fecha actual
      const mesActual = fechaActual.getMonth() + 1; // Sumar 1 ya que los meses en JavaScript van de 0 a 11

      await reporteIngresosModelo.create({
        cantidad,
        mes: mesActual,
        fecha: fechaActual,
        id_plato,
        id_ingreso,
        cantidadPlato: cantidadFija,
        precio: precio 
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
    if (isNaN(fechaBusqueda.getTime())) {
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

    // Inicializar sumas para id_ingreso 1 y 2, así como variables para precio y totales
    let sumaConCredito = 0;
    let sumaSinCredito = 0;
    let precio = 0;
     

    // Calcular la suma de créditos y obtener el precio para el primer reporte encontrado
    reportes.forEach(reporte => {
      const fechaReporte = new Date(reporte.fecha);
      if (fechaReporte.toISOString().split('T')[0] === fechaBusqueda.toISOString().split('T')[0]) {
        if (reporte.id_ingreso === 1) {
          sumaConCredito += reporte.cantidad;
        } else if (reporte.id_ingreso === 2) {
          sumaSinCredito += reporte.cantidad;
        }
        // Asignar precio al encontrar el primer reporte
        if (!precio) {
          precio = reporte.precio;
        }
      }
    });

    // Calcular totalCredito y totalSinCredito
    const totalCredito = precio * sumaConCredito;
    const totalSinCredito = precio * sumaSinCredito;
    const total = totalCredito + totalSinCredito;

    // Construir la respuesta
    const respuesta = {
      reporte: {
        fecha: fechaBusqueda.toISOString().split('T')[0],
        plato: plato ? plato.descripcion : "Plato no encontrado",
        conCreditos: sumaConCredito,
        sinCreditos: sumaSinCredito,
        cantidadPlato: reportes[0].cantidadPlato, // Asumiendo que todos los reportes tienen el mismo valor de cantidadPlato
        precio,
        totalCredito,
        totalSinCredito,
        total
      },
    };

    // Enviar la respuesta al cliente
    res.status(200).json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

 
 
 

export const buscarReportePorFechaEEEE = async (req, res) => {
  try {
    const { fecha } = req.params;

    // Verificar que se haya proporcionado una fecha
    if (!fecha) {
      return res.status(400).json({ message: "Se debe proporcionar una fecha" });
    }

    // Convertir la fecha a formato Date
    const fechaConsulta = new Date(fecha);
    
    // Consultar los reportes de ingresos en la fecha proporcionada
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate(), 0, 0, 0),
          [Op.lte]: new Date(fechaConsulta.getFullYear(), fechaConsulta.getMonth(), fechaConsulta.getDate(), 23, 59, 59),
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'], // Incluye la descripción del plato
        },
      ],
    });

    // Verificar si se encontraron reportes
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para la fecha especificada" });
    }

    // Agrupar reportes por plato
    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;
      
      // Inicializar objeto si no existe
      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fecha: reporte.fecha,
          cantidadPlato,
          conCreditos: 0,
          sinCreditos: 0,
          precio: precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      // Actualizar cantidades y totales
      if (id_ingreso === 1) { // Asumiendo id_ingreso 1 indica con créditos
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else { // Otros id_ingreso indican sin créditos
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      // Total general
      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    // Convertir el objeto de agrupación en un array
    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      // Forzar mostrar 0 en "totalSinCreditos" y "total" si no se calculan
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    // Devolver los resultados agrupados
    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al obtener el reporte de ingresos");
  }
};

export const buscarReportePorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;

    // Verificar que se haya proporcionado una fecha
    if (!fecha) {
      return res.status(400).json({ message: "Se debe proporcionar una fecha" });
    }

    // Convertir la fecha a formato Date y eliminar la diferencia horaria
    const fechaConsulta = new Date(fecha + 'T00:00:00');
    
    // Consultar los reportes de ingresos en la fecha proporcionada
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: fechaConsulta,
          [Op.lt]: new Date(fechaConsulta.getTime() + 24 * 60 * 60 * 1000), // 24 horas después
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'], // Incluye la descripción del plato
        },
      ],
    });

    // Verificar si se encontraron reportes
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para la fecha especificada" });
    }

    // Agrupar reportes por plato
    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;
      
      // Inicializar objeto si no existe
      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fecha: reporte.fecha,
          cantidadPlato,
          conCreditos: 0,
          sinCreditos: 0,
          precio: precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      // Actualizar cantidades y totales
      if (id_ingreso === 1) { // Asumiendo id_ingreso 1 indica con créditos
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else { // Otros id_ingreso indican sin créditos
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      // Total general
      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    // Convertir el objeto de agrupación en un array
    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    // Devolver los resultados agrupados
    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al obtener el reporte de ingresos");
  }
};





export const buscarPorMesxx = async (req, res) => {
  try {
    const { mes } = req.params;

    if (!mes) {
      return res.status(400).json({ message: "Se debe proporcionar un mes" });
    }

    const anioActual = new Date().getFullYear();
    const mesNumero = parseInt(mes, 10) - 1; // Convertir a formato 0-11 para JavaScript

    if (isNaN(mesNumero) || mesNumero < 0 || mesNumero > 11) {
      return res.status(400).json({ message: "Mes inválido" });
    }

    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: new Date(anioActual, mesNumero, 1, 0, 0, 0),
          [Op.lte]: new Date(anioActual, mesNumero + 1, 0, 23, 59, 59),
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'],
        },
      ],
    });

    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para el mes especificado" });
    }

    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;

      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fecha: reporte.fecha,
          cantidadPlato,
          conCreditos: 0,
          sinCreditos: 0,
          precio: precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      if (id_ingreso === 1) {
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else {
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al obtener el reporte de ingresos");
  }
};



// Nombres de los meses
const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const buscarPorMes = async (req, res) => {
  try {
    const { mes } = req.params;

    // Verificar que se haya proporcionado un mes
    if (!mes) {
      return res.status(400).json({ message: "Se debe proporcionar un mes" });
    }

    // Suponemos el año actual para la consulta
    const anioActual = new Date().getFullYear();
    const mesNumero = parseInt(mes, 10) - 1; // Convertir a formato 0-11 para JavaScript

    // Validar el mes
    if (isNaN(mesNumero) || mesNumero < 0 || mesNumero > 11) {
      return res.status(400).json({ message: "Mes inválido" });
    }

    // Consultar los reportes de ingresos en el mes proporcionado
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: new Date(anioActual, mesNumero, 1, 0, 0, 0),
          [Op.lte]: new Date(anioActual, mesNumero + 1, 0, 23, 59, 59),
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'],
        },
      ],
    });

    // Verificar si se encontraron reportes
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para el mes especificado" });
    }

    // Agrupar reportes por plato
    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;

      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fecha: nombresMeses[mesNumero], // Nombre del mes
          cantidadPlato: 0,
          conCreditos: 0,
          sinCreditos: 0,
          precio: precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      acc[id_plato].cantidadPlato += cantidadPlato;
      if (id_ingreso === 1) {
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else {
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    // Convertir el objeto de agrupación en un array
    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    // Devolver los resultados agrupados
    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al obtener el reporte de ingresos");
  }
};

export const buscarPorSemanaeee = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;

    // Verificar que se hayan proporcionado ambas fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Se deben proporcionar ambas fechas (fechaInicio y fechaFin)" });
    }

    // Convertir las fechas a formato Date
    const fechaInicioConsulta = new Date(fechaInicio);
    const fechaFinConsulta = new Date(fechaFin);

    // Asegurarse de que fechaFin tenga el final del día
    fechaFinConsulta.setHours(23, 59, 59, 999);

    // Consultar los reportes de ingresos dentro del rango de fechas proporcionado
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: fechaInicioConsulta,
          [Op.lte]: fechaFinConsulta,
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'], // Incluye la descripción del plato
        },
      ],
    });

    // Verificar si se encontraron reportes
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para el rango de fechas especificado" });
    }

    // Agrupar reportes por plato
    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;
      
      // Inicializar objeto si no existe
      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fechaInicio: fechaInicio, // Mostrar el rango de fechas en la respuesta
          fechaFin: fechaFin,       // Mostrar el rango de fechas en la respuesta
          cantidadPlato,
          conCreditos: 0,
          sinCreditos: 0,
          precio: precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      // Actualizar cantidades y totales
      if (id_ingreso === 1) { // Asumiendo id_ingreso 1 indica con créditos
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else { // Otros id_ingreso indican sin créditos
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      // Total general
      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    // Convertir el objeto de agrupación en un array
    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      // Forzar mostrar 0 en "totalSinCreditos" y "total" si no se calculan
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    // Devolver los resultados agrupados
    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el reporte de ingresos" });
  }
};

export const buscarPorSemana = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.params;

    // Verificar que se hayan proporcionado ambas fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Se deben proporcionar ambas fechas (fechaInicio y fechaFin)" });
    }

    // Convertir las fechas a formato Date y manejar la zona horaria
    const fechaInicioConsulta = new Date(`${fechaInicio}T00:00:00`);
    const fechaFinConsulta = new Date(`${fechaFin}T23:59:59`);

    // Verificar si las fechas son válidas
    if (isNaN(fechaInicioConsulta) || isNaN(fechaFinConsulta)) {
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }

    // Consultar los reportes de ingresos dentro del rango de fechas proporcionado
    const reportes = await reporteIngresosModelo.findAll({
      where: {
        fecha: {
          [Op.gte]: fechaInicioConsulta,
          [Op.lte]: fechaFinConsulta,
        },
      },
      include: [
        {
          model: platoModelo,
          attributes: ['descripcion'], // Incluye la descripción del plato
        },
      ],
    });

    // Verificar si se encontraron reportes
    if (reportes.length === 0) {
      return res.status(404).json({ message: "No se encontraron reportes de ingresos para el rango de fechas especificado" });
    }

    // Agrupar reportes por plato
    const reportesAgrupados = reportes.reduce((acc, reporte) => {
      const { id_plato, plato, cantidad, cantidadPlato, precio, id_ingreso } = reporte;
      
      // Inicializar objeto si no existe
      if (!acc[id_plato]) {
        acc[id_plato] = {
          descripcion: plato.descripcion,
          fechaInicio, // Mostrar el rango de fechas en la respuesta
          fechaFin,    // Mostrar el rango de fechas en la respuesta
          cantidadPlato,
          conCreditos: 0,
          sinCreditos: 0,
          precio,
          totalConCreditos: 0,
          totalSinCreditos: 0,
          total: 0
        };
      }

      // Actualizar cantidades y totales
      if (id_ingreso === 1) { // Asumiendo id_ingreso 1 indica con créditos
        acc[id_plato].conCreditos += cantidad;
        acc[id_plato].totalConCreditos += cantidad * precio;
      } else { // Otros id_ingreso indican sin créditos
        acc[id_plato].sinCreditos += cantidad;
        acc[id_plato].totalSinCreditos += cantidad * precio;
      }

      // Calcular total general
      acc[id_plato].total = acc[id_plato].totalConCreditos + acc[id_plato].totalSinCreditos;

      return acc;
    }, {});

    // Convertir el objeto de agrupación en un array
    const resultados = Object.values(reportesAgrupados).map(result => ({
      ...result,
      totalSinCreditos: result.totalSinCreditos ? result.totalSinCreditos.toFixed(2) : '0.00',
      total: result.total ? result.total.toFixed(2) : '0.00',
    }));

    // Devolver los resultados agrupados
    return res.status(200).json(resultados);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el reporte de ingresos" });
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
          id_ingreso: [1, 2], // Considerar ingresos con id 1 y 2
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
  
      // Inicializar sumas para id_ingreso 1 y 2, así como variables para precio y totales
      let sumaConCredito = 0;
      let sumaSinCredito = 0;
      let precio = 0;
  
      // Calcular la suma de créditos, obtener el precio y calcular totales
      reportes.forEach(reporte => {
        const fechaReporte = new Date(reporte.fecha);
        if (reporte.id_ingreso === 1 && fechaReporte >= fechaInicioBusqueda && fechaReporte < new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000)) {
          sumaConCredito += reporte.cantidad;
        } else if (reporte.id_ingreso === 2 && fechaReporte >= fechaInicioBusqueda && fechaReporte < new Date(fechaFinBusqueda.getTime() + 24 * 60 * 60 * 1000)) {
          sumaSinCredito += reporte.cantidad;
        }
        // Asignar precio al encontrar el primer reporte
        if (!precio) {
          precio = reporte.precio;
        }
      });
  
      // Calcular totalCredito y totalSinCredito
      const totalCredito = precio * sumaConCredito;
      const totalSinCredito = precio * sumaSinCredito;
      const total = totalCredito + totalSinCredito;
  
      // Construir la respuesta
      const respuesta = {
        reporte: {
          fechaInicio: fechaInicioBusqueda.toISOString().split('T')[0],
          fechaFin: fechaFinBusqueda.toISOString().split('T')[0],
          plato: plato ? plato.descripcion : "Plato no encontrado",
          conCreditos: sumaConCredito,
          sinCreditos: sumaSinCredito,
          cantidadPlato: reportes[0].cantidadPlato, // Asumiendo que todos los reportes tienen el mismo valor de cantidadPlato
          precio,
          totalCredito,
          totalSinCredito,
          total,
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
          id_ingreso: [1, 2], // Considerar ingresos con id 1 y 2
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
  
      // Inicializar sumas para id_ingreso 1 y 2, así como variables para precio y totales
      let sumaConCredito = 0;
      let sumaSinCredito = 0;
      let precio = 0;
  
      // Calcular la suma de créditos, obtener el precio y calcular totales
      reportes.forEach(reporte => {
        if (reporte.id_ingreso === 1) {
          sumaConCredito += reporte.cantidad;
        } else if (reporte.id_ingreso === 2) {
          sumaSinCredito += reporte.cantidad;
        }
        // Asignar precio al encontrar el primer reporte
        if (!precio) {
          precio = reporte.precio;
        }
      });
  
      // Calcular totalCredito y totalSinCredito
      const totalCredito = precio * sumaConCredito;
      const totalSinCredito = precio * sumaSinCredito;
      const total = totalCredito + totalSinCredito;
  
      const respuesta = {
        reporte: {
          mes: mesNum,
          plato: plato ? plato.descripcion : "Plato no encontrado",
          conCreditos: sumaConCredito,
          sinCreditos: sumaSinCredito,
          cantidadPlato: reportes[0].cantidadPlato, // Asumiendo que todos los reportes tienen el mismo valor de cantidadPlato
          precio,
          totalCredito,
          totalSinCredito,
          total,
        },
      };
  
      res.status(200).json(respuesta);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  