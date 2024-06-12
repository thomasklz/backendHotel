import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";
 


   //Crear

export const crearunidadMedida = async (req, res) => {
  try {
    const { unidadMedida, valorMedida } = req.body;

    // Validar campos requeridos
    if (!unidadMedida || !valorMedida) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Buscar si ya existe una unidad de medida con el mismo nombre y valor
    const existeUnidadMedida = await unidadMedidaModelo.findOne({
      where: {
        unidadMedida,
        valorMedida
      },
    });

    // Si la unidad de medida ya existe, respondemos con un mensaje de error
    if (existeUnidadMedida) {
      return res.status(400).json({ message: 'Ya existe una unidad de medida con el mismo nombre y valor' });
    }

    // Crear la nueva unidad de medida
    const nuevaUnidadMedida = await unidadMedidaModelo.create({
      unidadMedida,
      valorMedida,
    });

    res.status(201).json({ nuevaUnidadMedida });
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    res.status(500).json({ message: 'Error al crear la unidad de medida' });
  }
};




 
export const obtenerUnidadMedida = async (req, res) => {
  try {
    // Consultar todas las unidades de medida
    const unidadesMedida = await unidadMedidaModelo.findAll({
      attributes: ['id', 'unidadMedida', 'valorMedida'],
     });

    // Si se encontraron unidades de medida, las enviamos en la respuesta
    if (unidadesMedida.length > 0) {
      res.status(200).json({ unidadesMedida });
    } else {
      // Si no se encontraron unidades de medida activas, respondemos con un mensaje de error
      res.status(404).json({ message: 'No se encontraron unidades de medida activas' });
    }
  } catch (error) {
    console.error('Error al obtener las unidades de medida:', error);
    res.status(500).json({ message: 'Error al obtener las unidades de medida' });
  }
};
