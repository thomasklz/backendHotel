import { recetarioModelo } from "../modelos/recetarioModelo.js";
 import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";
import { platoconIngredienteModelo } from "../modelos/platoconIngredienteModelo.js";


export const crearRecetario = async (req, res) => {
    try {
        const { id_plato, id_alimentos } = req.body;

        // Validar campos requeridos
        if (!id_plato || !id_alimentos || id_alimentos.length === 0) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Verificar si el plato ya existe en la relación productosplato
        const platoExistente = await recetarioModelo.findOne({
            where: { id_plato },
        });

        if (platoExistente) {
            return res.status(400).json({ message: "Este plato ya existe" });
        }

        const errores = [];

        // Verificar si todos los alimentos existen en la base de datos
        for (const alimento of id_alimentos) {
            const { id_alimento } = alimento;
            try {
                const alimentoDb = await alimentoModelo.findByPk(id_alimento);
                if (!alimentoDb) {
                    errores.push({ message: `El alimento con ID ${id_alimento} no fue encontrado` });
                }
            } catch (error) {
                console.error('Error al procesar alimento:', error);
                errores.push({ message: 'Error al procesar alimento' });
            }
        }

        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Crear registros en el recetario
        for (const alimento of id_alimentos) {
            const { id_alimento } = alimento;
            const alimentoDb = await alimentoModelo.findByPk(id_alimento);
            if (alimentoDb) {
                await recetarioModelo.create({
                    id_plato,
                    id_alimento,
                    id_unidadMedida: alimentoDb.id_unidadMedida,
                });
            }
        }

        res.status(201).json({ message: "Registros de productos creados exitosamente" });
    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ message: "Error al crear productos con su plato" });
    }
};


export const obtenerrecetario_PorPlato = async (req, res) => {
    try {
      const { descripcion_plato } = req.params;
  
      // Busca los ingredientes por descripción del plato
      const productosplato = await recetarioModelo.findAll({
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
            attributes: ['id', 'descripcion'],

          },
          {
            model: unidadMedidaModelo,
            attributes: ['unidadMedida'],
          },

         
        ],
        attributes: ['id'],
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


  export const obtenerplatosdeproductosRecetario = async (req, res) => {
    try {
      const recetario = await recetarioModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ["id", "descripcion"],
          },
        ],
      });
  
      if (!recetario || recetario.length === 0) {
        return res.status(404).json({ message: "No se encontraron datos en el recetario." });
      }
  
      // Crear un mapa para almacenar las descripciones únicas
      const descripcionUnicaMap = new Map();
  
      // Filtrar los resultados para obtener descripciones únicas
      const resultadosUnicos = recetario.filter((item) => {
        const plato = item.plato;
        if (!descripcionUnicaMap.has(plato.descripcion)) {
          descripcionUnicaMap.set(plato.descripcion, true);
          return true;
        }
        return false;
      });
  
      // Crear un array con objetos que contienen ID y descripción de los platos únicos
      const platosUnicos = resultadosUnicos.map((item) => ({
        id: item.plato.id,
        descripcion: item.plato.descripcion,
      }));
  
      res.status(200).json({ platosUnicos });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: "Error al obtener los platos del recetario." });
    }
  };
  
  export const eliminarRecetario= async (req, res) => {
    try {
      const productoPlato = await recetarioModelo.findByPk(req.params.id);
  
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

  

export const eliminarRecetariobasico = async (req, res) => {
  try {
      const { id_plato } = req.params;

      // Validar campo requerido
      if (!id_plato) {
          return res.status(400).json({ message: "El campo id_plato es requerido" });
      }

      // Verificar si el plato existe en la relación recetario
      const platoExistente = await recetarioModelo.findOne({
          where: { id_plato },
      });

      if (!platoExistente) {
          return res.status(404).json({ message: "El plato no existe" });
      }

      // Eliminar todos los registros relacionados con el id_plato
      await recetarioModelo.destroy({
          where: { id_plato },
      });

      res.status(200).json({ message: "Registros eliminados exitosamente" });
  } catch (error) {
      console.error('Error general:', error);
      res.status(500).json({ message: "Error al eliminar los registros del recetario" });
  }
};



export const eliminarRecetariodetallado = async (req, res) => {
  try {
      const { id_plato } = req.params;

      // Validar campo requerido
      if (!id_plato) {
          return res.status(400).json({ message: "El campo id_plato es requerido" });
      }

      // Verificar si el plato existe en la relación recetario
      const platoExistente = await platoconIngredienteModelo.findOne({
          where: { id_plato },
      });

      if (!platoExistente) {
          return res.status(404).json({ message: "El plato no existe" });
      }

      // Eliminar todos los registros relacionados con el id_plato
      await platoconIngredienteModelo.destroy({
          where: { id_plato },
      });

      res.status(200).json({ message: "Registros eliminados exitosamente" });
  } catch (error) {
      console.error('Error general:', error);
      res.status(500).json({ message: "Error al eliminar los registros del recetario" });
  }
};



  export const mostrarplatoRecetario = async (req, res) => {
    try {
      const recetarios = await recetarioModelo.findAll({
        attributes: ["id"],
        where: { estado: true },
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
          },
          {
            model: alimentoModelo,
            attributes: ['id', 'descripcion'],
          },
          {
            model: unidadMedidaModelo,
            attributes: ['id', 'unidadMedida'],
          }
        ]
      });
  
      // Organizar los datos para que la descripción del plato se muestre una vez
      const platosMap = new Map();
  
      recetarios.forEach(recetario => {
        const platoId = recetario.plato.id;
        if (!platosMap.has(platoId)) {
          platosMap.set(platoId, {
            id: platoId,
            descripcion: recetario.plato.descripcion,
            ingredientes: []
          });
        }
  
        platosMap.get(platoId).ingredientes.push({
          id: recetario.id,
          alimento: recetario.alimento.descripcion,
          unidadMedida: recetario.unidadMedida.unidadMedida
        });
      });
  
      // Convertir el map a un array para enviarlo como respuesta
      const platos = Array.from(platosMap.values());
  
      res.status(200).json({ platos });
    } catch (error) {
      console.error('Error al obtener los platos:', error);
      res.status(500).json("No existe platos");
    }
  };
 
  
export const buscarPlatoRecetarioyyy = async (req, res) => {
  const { descripcion } = req.query; // Obtener el parámetro de búsqueda de la query string

  try {
    const whereClause = { estado: true };
    
    // Si se proporciona una descripción, agregarla a la cláusula WHERE
    if (descripcion) {
      whereClause['$plato.descripcion$'] = { [Op.like]: `%${descripcion}%` };
    }

    const recetarios = await recetarioModelo.findAll({
      attributes: ["id"],
      where: whereClause,
      include: [
        {
          model: platoModelo,
          attributes: ['id', 'descripcion'],
        },
        {
          model: alimentoModelo,
          attributes: ['id', 'descripcion'],
        },
        {
          model: unidadMedidaModelo,
          attributes: ['id', 'unidadMedida'],
        }
      ]
    });

    // Organizar los datos para que la descripción del plato se muestre una vez
    const platosMap = new Map();

    recetarios.forEach(recetario => {
      const platoId = recetario.plato.id;
      if (!platosMap.has(platoId)) {
        platosMap.set(platoId, {
          id: platoId,
          descripcion: recetario.plato.descripcion,
          ingredientes: []
        });
      }

      platosMap.get(platoId).ingredientes.push({
        id: recetario.id,
        alimento: recetario.alimento.descripcion,
        unidadMedida: recetario.unidadMedida.unidadMedida
      });
    });

    // Convertir el map a un array para enviarlo como respuesta
    const platos = Array.from(platosMap.values());

    res.status(200).json({ platos });
  } catch (error) {
    console.error('Error al obtener los platos:', error);
    res.status(500).json("No existe platos");
  }
};


export const buscarPlatoRecetarioy = async (req, res) => {
  const { descripcion } = req.query; // Obtener el parámetro de búsqueda de la query string

  try {
    const whereClause = { estado: true };
    
    // Si se proporciona una descripción, agregarla a la cláusula WHERE
    if (descripcion) {
      whereClause['$plato.descripcion$'] = { [Op.like]: `%${descripcion}%` };
    }

    const recetarios = await recetarioModelo.findAll({
      attributes: ["id"],
      where: whereClause,
      include: [
        {
          model: platoModelo,
          attributes: ['id', 'descripcion'],
        },
        {
          model: alimentoModelo,
          attributes: ['id', 'descripcion'],
        },
        {
          model: unidadMedidaModelo,
          attributes: ['id', 'unidadMedida'],
        }
      ]
    });

    // Organizar los datos para que la descripción del plato se muestre una vez
    const platosMap = new Map();

    recetarios.forEach(recetario => {
      const platoId = recetario.plato.id;
      if (!platosMap.has(platoId)) {
        platosMap.set(platoId, {
          id: platoId,
          descripcion: recetario.plato.descripcion,
          ingredientes: []
        });
      }

      platosMap.get(platoId).ingredientes.push({
        id: recetario.id,
        alimento: recetario.alimento.descripcion,
        unidadMedida: recetario.unidadMedida.unidadMedida
      });
    });

    // Convertir el map a un array para enviarlo como respuesta
    const platos = Array.from(platosMap.values());

    res.status(200).json({ platos });
  } catch (error) {
    console.error('Error al obtener los platos:', error);
    res.status(500).json("No existe platos");
  }
};

export const buscarPlatoRecetario = async (req, res) => {
  const { descripcion } = req.params; // Obtener la descripción del plato de los parámetros de la ruta

  try {
    // Buscar el plato específico
    const plato = await platoModelo.findOne({
      where: {
        descripcion: descripcion,
        estado: true
      }
    });

    if (!plato) {
      // Si no se encuentra el plato, devolver un error 404
      return res.status(404).json({ mensaje: "Plato no encontrado" });
    }

    // Obtener los ingredientes del plato encontrado
    const ingredientes = await recetarioModelo.findAll({
      attributes: [],
      where: {
        id_plato: plato.id
      },
      include: [
        {
          model: alimentoModelo,
          attributes: ['id', 'descripcion'],
        },
        {
          model: unidadMedidaModelo,
          attributes: ['id', 'unidadMedida'],
        }
      ]
    });

    // Organizar los ingredientes en el formato deseado
    const ingredientesPlato = ingredientes.map(ingrediente => ({
      id: ingrediente.alimento.id,
      alimento: ingrediente.alimento.descripcion,
      unidadMedida: ingrediente.unidadMedida.unidadMedida
    }));

    // Devolver los ingredientes del plato encontrado
    res.status(200).json({ platos: [{ id: plato.id, descripcion: plato.descripcion, ingredientes: ingredientesPlato }] });
  } catch (error) {
    console.error('Error al buscar el plato:', error);
    res.status(500).json("Error interno del servidor");
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