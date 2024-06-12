import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { alimentoReporteModelo } from "../modelos/alimentoReporteModelo.js";
import { ingredientesModelo } from "../modelos/ingredientesModelo.js";
import { menuModelo } from "../modelos/menuModelo.js";
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";




export const crearalimento = async (req, res) => {
  try {
    const { descripcion, id_unidadMedida } = req.body;

    // Validar campos requeridos
    if (!descripcion || !id_unidadMedida) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar si ya existe un alimento con la misma descripción
    const alimentoConMismaDescripcion = await alimentoModelo.findOne({
      where: { descripcion }
    });

    if (alimentoConMismaDescripcion) {
      return res.status(400).json({ message: "Ya existe un alimento con la misma descripción" });
    }

    // Si no existe, crear el nuevo alimento
    const nuevoAlimento = await alimentoModelo.create({
      descripcion,
      id_unidadMedida,
    });

    res.status(201).json({ nuevoAlimento });
  } catch (error) {
    console.error('Error al crear el alimento:', error);
    res.status(500).json({ message: "Error al crear el alimento" });
  }
};



export const mostraralimentoss = async (req, res) => {
  try {
    // Consultar todos los alimentos
    const alimentos = await alimentoModelo.findAll({
      attributes: ['id', 'descripcion'],
      where: { estado: true }, // Considerando que tienes una columna "estado" para marcar si está activo o no el alimento
      include: [{ model: unidadMedidaModelo, attributes: ['unidadMedida', 'valorMedida','id'] }],
    });

    // Si se encontraron alimentos, los enviamos en la respuesta
    if (alimentos.length > 0) {
      res.status(200).json({ alimentos });
    } else {
      // Si no se encontraron alimentos activos, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron alimentos activos' });
    }
  } catch (error) {
    console.error('Error al obtener los alimentos:', error);
    res.status(500).json({ message: 'Error al obtener los alimentos' });
  }
};


export const editaralimento = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del alimento a editar
    const { descripcion, id_unidadMedida } = req.body; // Obtener los nuevos datos del alimento

    // Validar campos requeridos
    if (!descripcion || !id_unidadMedida) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Buscar el alimento por su ID
    const alimento = await alimentoModelo.findByPk(id);
    if (!alimento) {
      return res.status(404).json({ message: "No se encontró el alimento" });
    }

    // Actualizar la descripción y el ID de la unidad de medida
    alimento.descripcion = descripcion;
    alimento.id_unidadMedida = id_unidadMedida;

    // Guardar los cambios en la base de datos
    await alimento.save();

    // Devolver la respuesta con el alimento actualizado
    return res.status(200).json({ alimento });
  } catch (error) {
    console.error('Error al editar el alimento:', error);
    res.status(500).json({ message: "Error al editar el alimento" });
  }
};


//eliminar
export const eliminaralimento = async (req, res) => {
try {
  const { id } = req.params;
  const alimento = await alimentoModelo.findByPk(id);

  if (!alimento) {
    return res.status(404).json({ message: "Alimento no encontrado" });
  }

  // Eliminar permanentemente el registro del alimento
  await alimento.destroy({ force: true });

  res.status(200).json({ message: "Alimento eliminado correctamente" });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error al eliminar el alimento", details: error.message });
}
};












































//Obtener
 

    
  
  
  export const getalimentos = async (req, res) => {
    try {
      // Consultar todos los alimentos
      const alimentos = await alimentoModelo.findAll({
        attributes: ['id', 'descripcion'],
        where: { estado: true }, // Considerando que tienes una columna "estado" para marcar si está activo o no el alimento
        include: [{ model: unidadMedidaModelo, attributes: ['unidadMedida', 'valorMedida','id'] }],
      });
  
      // Si se encontraron alimentos, los enviamos en la respuesta
      if (alimentos.length > 0) {
        res.status(200).json({ alimentos });
      } else {
        // Si no se encontraron alimentos activos, respondemos con un mensaje de error 404
        res.status(404).json({ message: 'No se encontraron alimentos activos' });
      }
    } catch (error) {
      console.error('Error al obtener los alimentos:', error);
      res.status(500).json({ message: 'Error al obtener los alimentos' });
    }
  };


export const obteneralimento = async (req, res) => {
  try {
    // Consultar todos los alimentos
    const alimentos = await alimentoModelo.findAll({
      attributes: ['id', 'descripcion', 'cantidadmedidaUnidad', 'precio', 'preciounidad', 'porcion'],
      where: { estado: true }, // Considerando que tienes una columna "estado" para marcar si está activo o no el alimento
      include: [{ model: unidadMedidaModelo, attributes: ['unidadMedida', 'valorMedida','id'] }],
    });

    // Si se encontraron alimentos, los enviamos en la respuesta
    if (alimentos.length > 0) {
      res.status(200).json({ alimentos });
    } else {
      // Si no se encontraron alimentos activos, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron alimentos activos' });
    }
  } catch (error) {
    console.error('Error al obtener los alimentos:', error);
    res.status(500).json({ message: 'Error al obtener los alimentos' });
  }
};




export const mostraralimentomenuIngredient = async (req, res) => {
  try {
    // Utiliza el modelo de menú para encontrar los platos
    const platosConInfoCompleta = await ingredientesModelo.findAll({
      include: [
        {
          model: alimentoModelo,
          attributes: ['id', 'descripcion'],
        },
      ],
      attributes: ['id'],
    });

    const platosSet = new Set(); // Utilizar un conjunto para evitar duplicados

    const alimentos = platosConInfoCompleta.reduce((result, ingrediente) => {
      const platoInfo = ingrediente.alimento ? {
        id: ingrediente.alimento.id,
        descripcion: ingrediente.alimento.descripcion,
      } : null;

      if (platoInfo && !platosSet.has(platoInfo.id)) {
        // Añadir solo si no está en el conjunto
        platosSet.add(platoInfo.id);
        result.push({
          id: platoInfo.id,
          descripcion: platoInfo.descripcion,
        });
      }

      return result;
    }, []);

    res.status(200).json({ alimentos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los platos en el menú", error: error.message });
  }
};

      export const mostraralimentomenu = async (req, res) => {
        try {
          // Utiliza el modelo de menú para encontrar los platos
          const platosConInfoCompleta = await ingredientesModelo.findAll({
            include: [
              {
                model: alimentoModelo,
                attributes: ['id', 'descripcion'],
              },
            ],
            attributes: ['id'],
          });
      
          const platosSet = new Set(); // Utilizar un conjunto para evitar duplicados
      
          const alimentos = platosConInfoCompleta.reduce((result, ingrediente) => {
            const platoInfo = ingrediente.alimento ? {
              id: ingrediente.alimento.id,
              descripcion: ingrediente.alimento.descripcion,
            } : null;
      
            if (platoInfo && !platosSet.has(platoInfo.id)) {
              // Añadir solo si no está en el conjunto
              platosSet.add(platoInfo.id);
              result.push({
                id: platoInfo.id,
                descripcion: platoInfo.descripcion,
              });
            }
      
            return result;
          }, []);
      
          res.status(200).json({ alimentos });
        } catch (error) {
          res.status(500).json({ mensaje: "Error al obtener los platos en el menú", error: error.message });
        }
      };
  //Crear

 
 
 
  


  