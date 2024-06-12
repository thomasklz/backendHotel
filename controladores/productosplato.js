import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { compraModelo } from "../modelos/compraModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";
import { platoconIngredienteModelo } from "../modelos/platoconIngredienteModelo.js";
import { productosplatoModelo } from "../modelos/productosplato.js";
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";


























export const obtenerplatosdeproductos = async (req, res) => {
  try {
    const productosplatos = await productosplatoModelo.findAll({
      include: [
        {
          model: platoModelo,
          attributes: ["id", "descripcion"],
        },
      ],
    });

    // Crear un mapa para almacenar las descripciones únicas
    const descripcionUnicaMap = new Map();

    // Filtrar los resultados para obtener descripciones únicas
    const resultadosUnicos = productosplatos.filter((productoPlato) => {
      const plato = productoPlato.plato;
      if (!descripcionUnicaMap.has(plato.descripcion)) {
        descripcionUnicaMap.set(plato.descripcion, true);
        return true;
      }
      return false;
    });

    // Crear un array con objetos que contienen ID y descripción de los platos únicos
    const platosUnicos = resultadosUnicos.map((productoPlato) => ({
      id: productoPlato.plato.id,
      descripcion: productoPlato.plato.descripcion,
    }));

    res.status(200).json({ platosUnicos });
  } catch (error) {
    res.status(500).json("No existen usuarios");
  }
};



/* 
export const crearingredientesconsuplato = async (req, res) => {
    try  {
      const { id_plato, id_alimento } = req.body;
      if (!(id_plato || id_alimento )) {
        res.status(400).json({ message: "Todos los campos son requeridos" });
        return; // Agrega un return para salir de la función si falta algún campo
      }
  
      // Busca el valor de equivalenteGramo en la base de datos usando Sequelize
      const alimento = await alimentoModelo.findByPk(id_alimento);
      if (!alimento) {
        res.status(404).json({ message: "El producto no fue encontrado" });
        return; // Agrega un return para salir de la función si el alimento no se encuentra
      }

  
      // Crea un nuevo registro de ingredientes en la base de datos
      const productosplato = await productosplatoModelo.create({
        id_plato,
        id_alimento,
        
      });
  
      res.status(201).json({ productosplato });
    } catch (error) {
      console.error(error); // Imprime el error en la consola para depuración
      res.status(500).json("Error al crear prodcutos con su plato");
    }
  };
 */


  



  export const crearingredientesconsuplato = async (req, res) => {
    try {
        const { id_plato } = req.body;

        // Validar campos requeridos
        if (!id_plato) {
            return res.status(400).json({ message: "El campo id_plato es requerido" });
        }

        // Verificar si el plato ya existe en la relación productosplato
        const platoExistente = await productosplatoModelo.findOne({
            where: {
                id_plato,
            },
        });

        if (platoExistente) {
            // El plato ya existe en la relación productosplato
            return res.status(400).json({ message: "Este plato ya existe" });
        }

        // Obtener todos los ingredientes asociados con el plato
        const ingredientes = await platoconIngredienteModelo.findAll({
            where: {
                id_plato,
            },
        });

        // Si no hay ingredientes asociados, retornar error
        if (ingredientes.length === 0) {
            return res.status(400).json({ message: "No se encontraron ingredientes asociados a este plato" });
        }

        // Crear registros en productosplatoModelo para cada ingrediente
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
                preciounidad:alimentoDb.preciounidad,
                costeo: alimentoDb.preciounidad / cantidadPersonaCome,
                mes: new Date().getMonth() + 1, // Obtener el mes actual
                fecha: new Date(),
                id_unidadMedida: unidadMedidaDb.id, // Pasar el id de la unidad de medida
            });
        }

        // Enviar una respuesta de éxito
        res.status(201).json({ message: "Registros de productos creados exitosamente" });
    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ message: "Error al crear productos con su plato" });
    }
};


  
  
  
  
  export const obtenerproductosplato = async (req, res) => {
    try {
      const ingredientes = await ingredientesModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
          },
          {
            model: alimentoModelo,
            attributes: ['id', 'descripcion'],
          },
          
        ],
        attributes: ['id']
      });
  
      if (ingredientes.length === 0) {
        return res.status(404).json({ mensaje: 'No existen productos para ese plato' });
      }
  
      res.status(200).json({ ingredientes });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener los ingredientes' });
    }
  };
  
  export const obtenerproductosplatos_PorPlato = async (req, res) => {
    try {
      const { descripcion_plato } = req.params;
  
      // Busca los ingredientes por descripción del plato
      const productosplato = await productosplatoModelo.findAll({
        include: [
          {
            model: platoModelo,
            where: {
              descripcion: descripcion_plato,
            },
            attributes: ['id', 'descripcion','precio'],
          },
          {
            model: alimentoModelo,
            attributes: ['id', 'descripcion','preciounidad'],

          },
          {
            model: unidadMedidaModelo,
            attributes: ['unidadMedida'],
          },

         
        ],
        attributes: ['id','cantidadPersonaGramo','costeo','cantidadPersonaCome'],
      });
  
      if (productosplato.length === 0) {
        return res.status(404).json({ mensaje: 'No existen ingredientes para este plato' });
      }
  
      // Devuelve los ingredientes relacionados con la descripción del plato
      res.status(200).json({ productosplato });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener los ingredientes' });
    }
  };



  export const obtenerproductosplatos_PorPlatokkkkkkkkkkkk = async (req, res) => {
    try {
        const { descripcion_plato } = req.params;

        // Buscar el plato por su descripción
        const plato = await platoModelo.findOne({
            where: {
                descripcion: descripcion_plato,
            },
            include: [
                {
                    model: productosplatoModelo,
                    include: [
                        {
                            model: alimentoModelo,
                            include: [
                                {
                                    model: unidadMedidaModelo,
                                    attributes: ['unidadMedida'],
                                },
                            ],
                            attributes: ['descripcion'],
                        },
                    ],
                    attributes: ['cantidadPersonaGramo', 'costeo'],
                },
            ],
            attributes: ['id', 'descripcion'],
        });

        if (!plato) {
            return res.status(404).json({ message: "Plato no encontrado" });
        }

        // Construir el objeto de resultado con el formato deseado
        const resultado = {
            plato: {
                id: plato.id,
                descripcion: plato.descripcion,
                productosplatos: plato.productosplatos.map(producto => ({
                    cantidadPersonaGramo: producto.cantidadPersonaGramo,
                    costeo: producto.costeo,
                    alimento: {
                        descripcion: producto.alimento.descripcion,
                        unidadMedida: {
                            unidadMedida: producto.alimento.unidadMedida.unidadMedida
                        }
                    }
                }))
            }
        };

        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al buscar el plato:', error);
        res.status(500).json({ message: "Error al buscar el plato" });
    }
};
  
  export const obtenerDescripcionPlatoproductos = async (req, res) => {
    try {
      const { descripcion_plato } = req.params;
  
      // Busca el plato por su descripción
      const plato = await platoModelo.findOne({
        where: {
          descripcion: descripcion_plato,
        },
        attributes: ['id', 'descripcion','precio'],
      });
  
      if (!plato) {
        return res.status(404).json({ mensaje: 'No existe un plato con esta descripción' });
      }
  
      // Devuelve los datos del plato
      res.status(200).json({ productosplato: [{ plato }] });
    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Error al obtener el plato' });
      const { descripcion_plato } = req.params;
console.log('Descripción del plato:', descripcion_plato);

    }
  };

  export const eliminarproductoPlato = async (req, res) => {
    try {
      const productoPlato = await productosplatoModelo.findByPk(req.params.id);
  
      if (productoPlato) {
        // Eliminar el menú de la base de datos
        await productoPlato.destroy();
  
        res.status(200).json({ message: "producto y Plato fue eliminado correctamente" });
      } else {
        res.status(404).json({ message: "No se encuentra registrado ese producto y Plato" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el producto y Plato" });
    }
  };
  