import { creditoModelo } from "../modelos/creditoModelo.js";
import { ingresosModelo } from "../modelos/ingresos.js";
import { menuModelo } from "../modelos/menuModelo.js";
import { personaModelo } from "../modelos/personaModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";

import { DataTypes, Op } from "sequelize";
import { reporteIngresosModelo } from "../modelos/reporteIngresos.js";

 
//Obtener
 export const obtenercreditosss = async (req, res) => {
    try {
        const credito = await creditoModelo.findAll({
          attributes: ['id','fecha','cantidad','pagado','precio', 'id_persona', 'id_plato']
        },{where: {state:true}});
      
        res.status(200).json({credito});
       
      } catch (error) {
          res.status(500).json("No existe  credito");
      }
  };
  
  export const obtenercreditowwwwwwwww = async (req, res) => {
    try {
      const creditos = await creditoModelo.findAll({
        include: [
          {
            model: personaModelo,
            attributes: ["id","Apellido1","Nombre1",  "EmailInstitucional", "TelefonoC"],
          },
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
          }
        ],
        attributes: ['id', 'fecha', 'cantidad', 'pagado', 'precio'],
        order: [['fecha', 'DESC']], // Ordena por fecha de la más reciente a la más antigua
      });
  
      if (creditos.length === 0) {
        return res.status(404).json({ mensaje: 'No existen créditos' });
      }
  
      res.status(200).json({ creditos });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener los créditos' });
    }
  };

  
  export const obtenercredito = async (req, res) => {
    try {
        const creditos = await creditoModelo.findAll({
            where: {
                pagado: false // Filtrar solo los créditos no pagados
            },
            include: [
                {
                    model: personaModelo,
                    attributes: ["id", "Apellido1", "Apellido2","Nombre1","Nombre2", "EmailInstitucional", "TelefonoC"],
                },
                {
                    model: platoModelo,
                    attributes: ['id', 'descripcion', 'precio'],
                }
            ],
            order: [
                ['fecha', 'DESC'], // Ordena por fecha de manera descendente
                [personaModelo, 'id', 'ASC'] // Ordena por el id de persona de manera ascendente
            ]
        });

        if (creditos.length === 0) {
            return res.status(404).json({ mensaje: 'No existen créditos no pagados' });
        }

        // Mapa para agrupar créditos por persona
        const creditosPorPersona = new Map();

        // Iterar sobre los créditos para agruparlos por persona
        creditos.forEach(credito => {
            const personaId = credito.persona.id;
            if (!creditosPorPersona.has(personaId)) {
                creditosPorPersona.set(personaId, {
                    persona: {
                        id: credito.persona.id,
                        Apellido1: credito.persona.Apellido1,
                        Apellido2: credito.persona.Apellido2,
                        Nombre1: credito.persona.Nombre1,
                        Nombre2: credito.persona.Nombre2,
                        EmailInstitucional: credito.persona.EmailInstitucional,
                        TelefonoC: credito.persona.TelefonoC
                    },
                    creditosPorFecha: new Map(),
                    totalPrecioFinal: 0 // Inicializamos el totalPrecioFinal para esta persona
                });
            }
            const creditosPersona = creditosPorPersona.get(personaId);
            const fecha = credito.fecha.split('T')[0]; // Utiliza la cadena de texto de fecha directamente
            if (!creditosPersona.creditosPorFecha.has(fecha)) {
                creditosPersona.creditosPorFecha.set(fecha, []);
            }
            creditosPersona.creditosPorFecha.get(fecha).push({
                cantidad: credito.cantidad,
                pagado: credito.pagado,
                precio: credito.precio,
                precio_final: credito.precio_final,
                plato: {
                    id: credito.plato.id,
                    descripcion: credito.plato.descripcion
                }
            });
            // Suma el precio_final al totalPrecioFinal
            creditosPersona.totalPrecioFinal += credito.precio_final;
        });

        // Convertir el mapa a un arreglo de objetos para el formato de respuesta
        const resultado = [];
        creditosPorPersona.forEach((personaData, personaId) => {
            const creditosPorFecha = [];
            personaData.creditosPorFecha.forEach((creditos, fecha) => {
                // Ordenar los créditos por fecha de manera descendente
                creditos.sort((a, b) => (a.fecha > b.fecha) ? -1 : 1);
                creditosPorFecha.push({ fecha, creditos });
            });
            resultado.push({ persona: personaData.persona, creditosPorFecha, totalPrecioFinal: personaData.totalPrecioFinal });
        });

        res.status(200).json(resultado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener los créditos' });
    }
};







  

  export const obtenerreporteporusuario = async (req, res) => {
    try {
      const id = req.params.id; // Obtener el id del usuario de la solicitud
  
      const creditos = await creditoModelo.findAll({
        where: { id_persona: id }, // Filtrar por el id del usuario
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion', 'precio'],
           
          },

        ],
        attributes: ['id', 'fecha', 'cantidad', 'pagado', 'precio','precio_final'],
      });
  
      if (creditos.length === 0) {
        return res.status(404).json({ mensaje: 'No existen reportes para el usuario con id ' + id });
      }
  
      res.status(200).json({ creditos });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener el reporte' });
    }
  };
  
  

  export const crearcredito = async (req, res) => {
    try {
        const { platos } = req.body;

        // Verificar que se haya enviado al menos un plato
        if (!platos || platos.length === 0) {
            return res.status(400).json({ message: "Se debe enviar al menos un plato" });
        }

        // Inicializar variables para el cálculo del precio total y precio promedio final
        let precioTotal = 0;
        let erroresCantidad = []; // Para acumular las descripciones de platos con cantidades insuficientes

        // Obtener la fecha actual
        const fechaActual = new Date();

        // Verificar la cantidad disponible para cada plato
        for (const plato of platos) {
            const { cantidad, id_plato } = plato;

            // Verificar que la cantidad sea un número positivo
            if (typeof cantidad !== 'number' || cantidad <= 0) {
                return res.status(400).json({ message: `La cantidad para el plato con ID ${id_plato} debe ser un número positivo` });
            }

            // Obtener el menú correspondiente
            const menu = await menuModelo.findOne({
                where: {
                    id_plato,
                    fecha: {
                        [Op.gte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0),
                        [Op.lte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59),
                    },
                },
            });

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

        // Si todos los platos tienen suficiente cantidad, proceder con la creación de créditos
        for (const plato of platos) {
            const { cantidad, precio, id_persona, id_plato, id_ingreso } = plato;

            // Calcular precio total y precio final del plato actual
            const precioTotalPlato = precio * cantidad;
            precioTotal += precioTotalPlato;

            // Obtener el menú correspondiente (ya se obtuvo en el bucle anterior)
            const menu = await menuModelo.findOne({
                where: {
                    id_plato,
                    fecha: {
                        [Op.gte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0),
                        [Op.lte]: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 23, 59, 59),
                    },
                },
            });

            // Crear crédito con la fecha actual
            const credito = await creditoModelo.create({
                fecha: fechaActual,
                cantidad,
                pagado: false, // Siempre se establece como false
                precio: precio, // Precio total del plato
                precio_final: precioTotalPlato, // Precio final del plato
                id_persona,
                id_plato,
                id_ingreso,
            });

            // Actualizar la cantidad del menú restando la cantidad del crédito
            const nuevaCantidad = menu.cantidad - cantidad;
            await menu.update({ cantidad: nuevaCantidad });

            // Obtener la cantidad fija del menú
            const cantidadFija = menu.cantidadfija;

            // Crear reporte de ingresos
            const mesActual = fechaActual.getMonth() + 1; // Sumar 1 ya que los meses en JavaScript van de 0 a 11
            await reporteIngresosModelo.create({
                cantidad,
                mes: mesActual,
                fecha: fechaActual,
                id_plato,
                id_ingreso,
                cantidadPlato: cantidadFija,
            });
        }

        // Calcular precio promedio final
        const precioPromedioFinal = precioTotal / platos.length;

        console.log(`Créditos creados para todos los platos`);

        return res.status(201).json({ precioTotal, precioFinal: precioTotal, precioPromedioFinal });

    } catch (error) {
        console.error(error);
        return res.status(500).json("Error al crear el crédito");
    }
};





  

  //Editar
  export const editarcredito = async (req, res) => {
    const { id_persona } = req.params; // Obtenemos el id de la persona de los parámetros de la solicitud

    try {
        // Buscamos todos los créditos de la persona específica
        const creditos = await creditoModelo.findAll({
            where: {
              id_persona: id_persona // Filtramos por el id de la persona
            }
        });

        // Verificamos si encontramos algún crédito para la persona
        if (creditos.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron créditos para la persona especificada' });
        }

        // Iteramos sobre los créditos y actualizamos el valor de 'pagado' a true
        await Promise.all(creditos.map(async (credito) => {
            await credito.update({ pagado: true });
        }));

        // Respondemos con un mensaje de éxito
        res.status(200).json({ mensaje: 'Créditos actualizados exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al editar los créditos' });
    }
};

  

  //eliminar
  export const eliminarcreditosss = async (req, res) => {
    try {
      const credito = await creditoModelo.findByPk(req.params.id);
   
      if (credito) {
        // Eliminar el menú de la base de datos
        await credito.destroy();
  
        res.status(200).json({ message: "Menú fue eliminado correctamente" });
      } else {
        res.status(404).json({ message: "No se encuentra registrado ese menú" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el menú" });
    }
  };


  
  export const ingresos = async (req, res) => {
    try {
      const { fecha, id_plato } = req.params;
  
      if (!fecha || !id_plato) {
        return res.status(400).json({
          mensaje: "La fecha y el ID del plato son requeridos en la URL",
        });
      }
  
      // Buscar en la tabla de menú por la fecha y el plato
      const menu = await menuModelo.findOne({
        where: {
          fecha: fecha,
          id_plato: id_plato,
        },
      });
  
      if (!menu) {
        return res.status(404).json({
          mensaje: "No se encontró un registro en la tabla de menú para la fecha y el plato proporcionados",
        });
      }
  
      // Buscar en la tabla de crédito por la fecha y el plato
      const creditos = await creditoModelo.sum("cantidad", {
        where: {
          fecha: fecha,
          id_plato: id_plato,
        },
      });
  
      // Obtener la cantidad fija del menú
      const cantidadFija = menu.cantidadfija || 0;
  
      // Calcular el resultado deseado
      const conCreditos = creditos || 0;
      const sinCreditos = cantidadFija - conCreditos;
  
      // Obtener la descripción del plato
      const plato = await platoModelo.findOne({
        where: {
          id: id_plato,
        },
        attributes: ["descripcion"],
      });
  
      // Crear un objeto de respuesta
      const respuesta = {
        reporte: {
          fecha: fecha,
          plato: plato ? plato.descripcion : "Plato no encontrado",
          conCreditos: conCreditos,
          sinCreditos: sinCreditos,
        },
      };
  
      res.status(200).json(respuesta);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        mensaje: "Error al obtener los ingresos por fecha y plato",
      });
    }
  };
  

