import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { ingredientesModelo } from "../modelos/ingredientesModelo.js";
import { menuModelo } from "../modelos/menuModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";
import { productosplatoModelo } from "../modelos/productosplato.js";
import { Op } from 'sequelize';

import { tipo_menuModelo } from "../modelos/tipo_menuModelo.js";

import { Sequelize } from "sequelize";

import { sequelize } from "../base_de_datos/conexion.js";
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";
import { compraModelo } from "../modelos/compraModelo.js";
import { platoconIngredienteModelo } from "../modelos/platoconIngredienteModelo.js";

 


 

export const mostrarfechamenu = async (req, res) => {
  try {
    const idPlatosEnProductos = await productosplatoModelo.findAll({
      attributes: ['id_plato'],
      group: ['id_plato'],
    });

    if (!idPlatosEnProductos || idPlatosEnProductos.length === 0) {
      return res.status(404).json({ mensaje: 'No hay id_plato en productosplatoModelo' });
    }

    const idPlatos = idPlatosEnProductos.map((item) => item.id_plato);

    const menu = await menuModelo.findAll({
      where: {
        id_plato: idPlatos,
      },
      attributes: ['id', 'fecha'],
      order: [['fecha', 'DESC']], // Ordenar las fechas de manera descendente
    });

    if (!menu || menu.length === 0) {
      return res
        .status(404)
        .json({ mensaje: 'No hay fechas con productos para los id_plato encontrados' });
    }

    // Usar un conjunto para almacenar fechas únicas
    const fechasUnicas = new Set();

    // Filtrar las fechas para mostrar solo una vez cada fecha
    const menuFiltrado = menu.filter((item) => {
      const fecha = item.fecha;
      if (!fechasUnicas.has(fecha)) {
        fechasUnicas.add(fecha);
        return true;
      }
      return false;
    });

    // Filtrar para mostrar solo las 5 últimas fechas
    const ultimasCincoFechas = menuFiltrado.slice(0, 5);

    res.status(200).json({ menu: ultimasCincoFechas });
  } catch (error) {
    console.error('Error al obtener menú:', error);
    res.status(500).json({ mensaje: 'Error al obtener menú', error: error.message });
  }
};




export const obtenerMenuPorFecha = async (req, res) => {
  try {
      const { fecha} = req.params;

      // Busca los platos por la fecha del menú
      const platos = await platoModelo.findAll({
          include: [
              {
                  model: menuModelo,
                  where: {
                      fecha: fecha,
                  },
                  attributes: [],
              },
          ],
          attributes: ['id', 'descripcion'],
      });

      if (platos.length === 0) {
          return res.status(404).json({ mensaje: 'No existen platos para esta fecha de menú' });
      }

      // Devuelve los platos relacionados con la fecha del menú
      res.status(200).json({ platos });
  } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener los platos por fecha de menú' });
  }
};





export const mostrarfechamenuregistro = async (req, res) => {
  try {
    const menu = await menuModelo.findAll({
      attributes: ['id', 'fecha'],
      order: [['fecha', 'DESC']], // Ordenar por fecha de forma descendente
    });

    if (menu.length === 0) {
      return res.status(404).json({ mensaje: 'No existe menú' });
    }

    // Usar un conjunto para almacenar fechas únicas
    const fechasUnicas = new Set();
    const menuFiltrado = menu.filter((item) => {
      const fecha = item.fecha;
      if (!fechasUnicas.has(fecha)) {
        fechasUnicas.add(fecha);
        return true;
      }
      return false;
    });

    res.status(200).json({ menu: menuFiltrado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener menú' });
  }
};

//Obtener
 export const mostrarmenusss = async (req, res) => {
  try {
    const menus = await menuModelo.findAll({
      where: {state:true}
    });
  
    res.status(200).json({menus});
   
  } catch (error) {
      res.status(500).json("No existe menus");
  }
  };
  
  export const mostrarmenu = async (req, res) => {
    try {
      const menu = await menuModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
            where: {
              id: { [Op.ne]: null }, // Condición para asegurarse de que el plato no sea nulo
            },
          }
        ],
        attributes: ['id', 'habilitado', 'cantidad', 'fecha'],
        order: [['fecha', 'DESC']], // Ordenar por fecha de forma descendente
      });
  
      if (menu.length === 0) {
        return res.status(404).json({ mensaje: 'No existe menú' });
      }
  
      res.status(200).json({ menu });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener menú' });
    }
  };
  
  
  
 

  
  export const mostrarparalaweb = async (req, res) => {
    try {
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha
  
      const menu = await menuModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion', 'id_tipomenu'],
            where: {
              id_tipomenu: {
                [Op.notIn]: [1, 2, 3] // Excluir id_tipomenu 1, 2 y 3
              }
            },
            include: [
              {
                model: tipo_menuModelo,
                attributes: ['id','tipo'] // Puedes ajustar los atributos que deseas incluir del modelo tipo_menu
              }
            ]
          }
        ],
        where: {
          cantidad: {
            [Op.gt]: 0
          },
          habilitado: true, // Filtrar por platos habilitados
          fecha: fechaActual // Filtrar por la fecha actual
        },
        attributes: ['id', 'cantidad']
      });
  
      if (menu.length === 0) {
        return res.status(404).json({ mensaje: 'No existe menú' });
      }
  
      res.status(200).json({ menu });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener menú' });
    }
  };


  export const mostrardesayuno = async (req, res) => {
    try {
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha

        const menu = await menuModelo.findAll({
            include: [
                {
                    model: platoModelo,
                    attributes: ['id', 'descripcion'],
                    where: {
                        id_tipomenu: 1
                    }
                }
            ],
            where: {
                cantidad: {
                    [Op.gt]: 0
                },
                habilitado: true, // Filtrar por platos habilitados
                fecha: fechaActual // Filtrar por la fecha actual
            },
            attributes: ['id', 'cantidad']
        });

        if (menu.length === 0) {
            return res.status(404).json({ mensaje: 'No existe menú' });
        }

        res.status(200).json({ menu });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener menú' });
    }
};

export const mostraralmuerzo = async (req, res) => {
    try {
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha

        const menu = await menuModelo.findAll({
            include: [
                {
                    model: platoModelo,
                    attributes: ['id', 'descripcion'],
                    where: {
                        id_tipomenu: 2
                    }
                }
            ],
            where: {
                cantidad: {
                    [Op.gt]: 0
                },
                habilitado: true, // Filtrar por platos habilitados
                fecha: fechaActual // Filtrar por la fecha actual
            },
            attributes: ['id', 'cantidad']
        });

        if (menu.length === 0) {
            return res.status(404).json({ mensaje: 'No existe menú' });
        }

        res.status(200).json({ menu });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener menú' });
    }
};

export const mostrarmerienda = async (req, res) => {
    try {
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha

        const menu = await menuModelo.findAll({
            include: [
                {
                    model: platoModelo,
                    attributes: ['id', 'descripcion'],
                    where: {
                        id_tipomenu: 3
                    }
                }
            ],
            where: {
                cantidad: {
                    [Op.gt]: 0
                },
                habilitado: true, // Filtrar por platos habilitados
                fecha: fechaActual // Filtrar por la fecha actual
            },
            attributes: ['id', 'cantidad']
        });

        if (menu.length === 0) {
            return res.status(404).json({ mensaje: 'No existe menú' });
        }

        res.status(200).json({ menu });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Error al obtener menú' });
    }
};

  //Crear

  
  

  




  
  export const crearmenu = async (req, res) => {
    try {
        // Verificación de existencia de modelos
        if (!menuModelo || !ingredientesModelo || !platoconIngredienteModelo || !compraModelo || !unidadMedidaModelo || !alimentoModelo) {
            return res.status(500).json({ message: "No se pueden crear menús debido a modelos faltantes" });
        }

        // Extracción de datos del cuerpo de la solicitud
        const { id_plato, cantidad, fecha, habilitado } = req.body;

        // Validación de campos requeridos
        if (!(id_plato && cantidad && fecha && habilitado)) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Verificación de existencia de ingredientes para el plato y fecha
        const existingIngredients = await ingredientesModelo.findOne({ where: { id_plato, fecha } });

        if (existingIngredients) {
            return res.status(400).json({ message: "Ya existe un menú para este plato en la misma fecha" });
        }

        // Verificación de existencia del plato en productosplato
        const platoExistente = await productosplatoModelo.findOne({ where: { id_plato } });

        // Si no existe, llamar al método crearingredientesconsuplato
        if (!platoExistente) {
            const response = await crearingredientesconsuplatoInternal({ id_plato });

          
        }

        // Obtención de alimentos del plato
        const alimentosPlato = await platoconIngredienteModelo.findAll({ where: { id_plato } });

        if (alimentosPlato.length === 0) {
            return res.status(404).json({ message: "No se encontraron alimentos para ese plato" });
        }

        // Verificación de cantidades suficientes
        const errores = [];
        const alimentosConCantidadesInsuficientes = [];

        for (const alimentoPlato of alimentosPlato) {
            const { id_alimento, cantidadPersonaGramo } = alimentoPlato;
            const alimento = await compraModelo.findByPk(id_alimento, { include: { model: alimentoModelo, attributes: ['descripcion'] } });

            if (!alimento) {
                errores.push({ message: `El alimento con ID ${id_alimento} no fue encontrado` });
                continue;
            }

            const cantidadNecesaria = cantidadPersonaGramo * cantidad;
            if (alimento.porcion < cantidadNecesaria) {
                alimentosConCantidadesInsuficientes.push(alimento.alimento.descripcion);
            }
        }

        if (alimentosConCantidadesInsuficientes.length > 0) {
            const mensajeError = `No hay suficiente cantidad de ${alimentosConCantidadesInsuficientes.join(", ")} para registrar en este plato`;
            return res.status(400).json({ message: mensajeError });
        }

        // Creación de ingredientes y actualización de cantidades
        const fechaObj = new Date(fecha);
        const mes = fechaObj.getMonth() + 1;

        for (const alimentoPlato of alimentosPlato) {
            const { id_alimento, cantidadPersonaGramo, id_unidadMedida } = alimentoPlato;
            const alimento = await compraModelo.findByPk(id_alimento);
            const productoplatoDb = await productosplatoModelo.findOne({ where: { id_plato, id_alimento } });

            if (!productoplatoDb) {
                errores.push({ message: `No se encontró el producto plato con ID ${id_alimento}` });
                continue;
            }

            const nuevaPorcion = Math.max(0, alimento.porcion - ( productoplatoDb.cantidadPersonaGramo * cantidad));
            const unidadMedida = await unidadMedidaModelo.findByPk(id_unidadMedida);

            if (!unidadMedida) {
                errores.push({ message: `No se encontró la unidad de medida con ID ${id_unidadMedida}` });
                continue;
            }

            const cantidadmedidaUnidad = nuevaPorcion / unidadMedida.valorMedida;

            await ingredientesModelo.create({
                id_plato,
                id_alimento,
                cantidadPersonaGramo: productoplatoDb.cantidadPersonaGramo,
                porcion: productoplatoDb.cantidadPersonaGramo * cantidad,
                costeo: productoplatoDb.costeo * cantidad,
                id_unidadMedida,
                cantidad,
                mes,
                fecha,
                cantidadPersonaCome: productoplatoDb.cantidadPersonaCome,
                costeounaPersona: productoplatoDb.costeo,
                preciounidad: productoplatoDb.preciounidad
            });

            // Actualiza la cantidadmedidaUnidad en el modelo alimento
            await alimento.update({ porcion: nuevaPorcion, cantidadmedidaUnidad });
        }

        // Creación del menú
        const menu = await menuModelo.create({
            id_plato,
            cantidad,
            cantidadfija: cantidad,
            fecha,
            habilitado
        });

        res.status(201).json({ message: "Menú e ingredientes creados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear menú e ingredientes" });
    }
};


 

  export const crearmenut = async (req, res) => {
    try {
        if (!menuModelo || !ingredientesModelo || !platoconIngredienteModelo || !compraModelo || !unidadMedidaModelo || !alimentoModelo) {
            return res.status(500).json({ message: "No se pueden crear menús debido a modelos faltantes" });
        }

        const { id_plato, cantidad, fecha, habilitado } = req.body;

        if (!(id_plato && cantidad && fecha && habilitado)) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const existingIngredients = await ingredientesModelo.findOne({ where: { id_plato, fecha } });

        if (existingIngredients) {
            return res.status(400).json({ message: "Ya existe un menú para este plato en la misma fecha" });
        }

        // Verificar si el plato ya tiene sus ingredientes asociados en productosplato
        const platoExistente = await productosplatoModelo.findOne({ where: { id_plato } });

        // Si no existe, llamar al método crearingredientesconsuplato
        if (!platoExistente) {
            const response = await crearingredientesconsuplatoInternal({ id_plato });

            if (response.status !== 201) {
                return res.status(response.status).json({ message: response.message });
            }
        }

        // Continuar con el código de crearmenu si el plato ya existe en productosplatoModelo
        const alimentosPlato = await platoconIngredienteModelo.findAll({ where: { id_plato } });

        if (alimentosPlato.length === 0) {
            return res.status(404).json({ message: "No se encontraron alimentos para ese plato" });
        }

        const errores = [];
        const alimentosConCantidadesInsuficientes = [];

        for (const alimentoPlato of alimentosPlato) {
            const { id_alimento, cantidadPersonaGramo } = alimentoPlato;
            const alimento = await compraModelo.findByPk(id_alimento, { include: { model: alimentoModelo, attributes: ['descripcion'] } });

            if (!alimento) {
                errores.push({ message: `El alimento con ID ${id_alimento} no fue encontrado` });
                continue;
            }

            const cantidadNecesaria = cantidadPersonaGramo * cantidad;
            if (alimento.porcion < cantidadNecesaria) {
                alimentosConCantidadesInsuficientes.push(alimento.alimento.descripcion);
            }
        }

        if (alimentosConCantidadesInsuficientes.length > 0) {
            const mensajeError = `No hay suficiente cantidad de ${alimentosConCantidadesInsuficientes.join(", ")} para registrar en este menú`;
            return res.status(400).json({ message: mensajeError });
        }

        const menu = await menuModelo.create({
            id_plato,
            cantidad,
            cantidadfija: cantidad,
            fecha,
            habilitado
        });

        const fechaObj = new Date(fecha);
        const mes = fechaObj.getMonth() + 1;

        for (const alimentoPlato of alimentosPlato) {
            const { id_alimento, cantidadPersonaGramo, id_unidadMedida } = alimentoPlato;
            const alimento = await compraModelo.findByPk(id_alimento);
            const productoplatoDb = await productosplatoModelo.findByPk(id_alimento);

            const nuevaPorcion = Math.max(0, alimento.porcion - (cantidadPersonaGramo * cantidad));
            const unidadMedida = await unidadMedidaModelo.findByPk(id_unidadMedida);

            if (!unidadMedida) {
                errores.push({ message: `No se encontró la unidad de medida con ID ${id_unidadMedida}` });
                continue;
            }

            const cantidadmedidaUnidad = nuevaPorcion / unidadMedida.valorMedida;

            await ingredientesModelo.create({
                id_plato,
                id_alimento,
                cantidadPersonaGramo: productoplatoDb.cantidadPersonaGramo,
                porcion: productoplatoDb.cantidadPersonaGramo * cantidad,
                costeo: productoplatoDb.costeo * cantidad,
                id_unidadMedida,
                cantidad,
                mes,
                fecha,
                cantidadPersonaCome: productoplatoDb.cantidadPersonaCome,
                costeounaPersona: productoplatoDb.costeo,
                preciounidad: productoplatoDb.preciounidad
            });

            // Actualiza la cantidadmedidaUnidad en el modelo alimento
            await alimento.update({ porcion: nuevaPorcion, cantidadmedidaUnidad });
        }

        res.status(201).json({ message: "Menú e ingredientes creados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear menú e ingredientes" });
    }
};


// Modificación del método crearingredientesconsuplato para uso interno sin respuesta HTTP
const crearingredientesconsuplatoInternal = async ({ id_plato }) => {
    try {
        if (!id_plato) {
            return { status: 400, message: "El campo id_plato es requerido" };
        }

        const platoExistente = await productosplatoModelo.findOne({ where: { id_plato } });

        if (platoExistente) {
            return { status: 200, message: "Este plato ya existe" }; // Si el plato ya existe, devolver éxito
        }

        const ingredientes = await platoconIngredienteModelo.findAll({ where: { id_plato } });

        if (ingredientes.length === 0) {
            return { status: 400, message: "No se encontraron ingredientes asociados a este plato" };
        }

        for (const ingrediente of ingredientes) {
            const id_alimento = ingrediente.id_alimento;
            const cantidadPersonaCome = ingrediente.cantidadPersonaCome;
            const alimentoDb = await compraModelo.findByPk(id_alimento);
            const unidadMedidaDb = await unidadMedidaModelo.findByPk(alimentoDb.id_unidadMedida);
            const cantidadPersonaGramo = unidadMedidaDb.valorMedida / cantidadPersonaCome;

            await productosplatoModelo.create({
                id_plato,
                id_alimento,
                cantidadPersonaCome,
                cantidadPersonaGramo,
                preciounidad: alimentoDb.preciounidad,
                costeo: alimentoDb.preciounidad / cantidadPersonaCome,
                mes: new Date().getMonth() + 1,
                fecha: new Date(),
                id_unidadMedida: unidadMedidaDb.id,
            });
        }

        return { status: 201, message: "Registros de productos creados exitosamente" };
    } catch (error) {
        console.error('Error general:', error);
        return { status: 500, message: "Error al crear productos con su plato" };
    }
};


 
  //Editar
  export const editarmenu = async (req, res) => {
    if (!req.body.id_plato) {
      res.status(400).json({ message: "los campos es requerido" });
    }
    const id_plato = await menuModelo.findOne({ where: { id: req.params.id } });
    if (id_plato) {
      id_plato.set(req.body);
      await id_plato.save();
      res.status(200).json({ message: "el menu fue modificada correctamente" });
    } else {
      res.status(404).json({ message: "menu  no encontrado" });
    }
  };

  //eliminar
  export const eliminarmenu = async (req, res) => {
    try {
        const menuId = req.params.id;

        // Find the menu with the given ID
        const menu = await menuModelo.findByPk(menuId);

        if (!menu) {
            res.status(404).json({ message: "No se encuentra registrado ese menú" });
            return;
        }

        const { fecha, id_plato } = menu;

        // Delete the menu
        await menu.destroy();

        // Delete related ingredients based on fecha and id_plato
        await ingredientesModelo.destroy({
            where: { fecha, id_plato }
        });

        res.status(200).json({ message: "Menú y sus ingredientes fueron eliminados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el menú y sus ingredientes" });
    }
};

  
  
  