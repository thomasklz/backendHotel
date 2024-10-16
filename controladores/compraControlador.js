import { compraModelo } from "../modelos/compraModelo.js";

import { alimentoReporteModelo } from "../modelos/alimentoReporteModelo.js";
import { ingredientesModelo } from "../modelos/ingredientesModelo.js";
import { menuModelo } from "../modelos/menuModelo.js";
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";
import { alimentoModelo } from "../modelos/alimentoModelo.js";



export const gestionarAlimento = async (req, res) => {
  try {
    const { id_alimento, cantidadmedidaUnidad, precio, fecha } = req.body;

    // Validar campos requeridos
    if (!id_alimento || !cantidadmedidaUnidad || !precio || !fecha) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Obtener la unidad de medida del alimento
    const alimento = await alimentoModelo.findByPk(id_alimento, {
      include: unidadMedidaModelo,
    });
    if (!alimento) {
      return res.status(404).json({ message: "No se encontró el alimento" });
    }
    const id_unidadMedida = alimento.id_unidadMedida;

    // Verificar si el id_alimento ya existe en la base de datos
    const alimentoExistente = await compraModelo.findOne({ where: { id_alimento } });

    if (alimentoExistente) {
      // Si el alimento ya existe, utilizar el método de edición
      return editarAlimento(req, res, alimentoExistente.id, id_unidadMedida, fecha);
    } else {
      // Si el alimento no existe, utilizar el método de creación
      return crearAlimento(req, res, id_unidadMedida, fecha);
    }
  } catch (error) {
    console.error('Error al gestionar el alimento:', error);
    res.status(500).json({ message: "Error al gestionar el alimento" });
  }
};

const crearAlimento = async (req, res, id_unidadMedida, fecha) => {
  try {
    const { id_alimento, cantidadmedidaUnidad, precio } = req.body;

    // Calcular el precio por unidad
    const unidadMedida = await unidadMedidaModelo.findByPk(id_unidadMedida);
    if (!unidadMedida) {
      return res.status(404).json({ message: "No se encontró la unidad de medida" });
    }
    const preciounidad = precio / cantidadmedidaUnidad;

    // Calcular la porción
    const porcion = unidadMedida.valorMedida * cantidadmedidaUnidad;

    // Crear el alimento con la fecha proporcionada y los valores actualizados
    const nuevoAlimento = await compraModelo.create({
      id_alimento,
      cantidadmedidaUnidad,
      precio,
      preciounidad,
      porcion,
      cantidadmedidaUnidadActualizada: cantidadmedidaUnidad,
      porcionActualizada: porcion,
      fecha,
      id_unidadMedida,
    });

    const nuevoAlimentoReporte = await alimentoReporteModelo.create({
      id_alimento,
      cantidadmedidaUnidad,
      precio,
      preciounidad,
      porcion,
      cantidadmedidaUnidadActualizada: cantidadmedidaUnidad,
      porcionActualizada: porcion,
      fecha,
      id_unidadMedida,
    });

    res.status(201).json({ nuevoAlimento });
  } catch (error) {
    console.error('Error al crear el alimento:', error);
    res.status(500).json({ message: "Error al crear el alimento" });
  }
};

export const editarAlimento = async (req, res, id, id_unidadMedida, fecha) => {
  try {
    const { id_alimento, cantidadmedidaUnidad, precio, fecha } = req.body;

    // Validar campos requeridos
    if (!id_alimento || !cantidadmedidaUnidad || !precio || !fecha) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Buscar el alimento por su ID
    const alimento = await compraModelo.findByPk(id);
    if (!alimento) {
      return res.status(404).json({ message: "No se encontró el alimento" });
    }

    // Actualizar la descripción siempre
    alimento.id_alimento = id_alimento;

    // Verificar si se han editado cantidadmedidaUnidad, precio, id_unidadMedida o fecha
    if (cantidadmedidaUnidad !== alimento.cantidadmedidaUnidad || precio !== alimento.precio || fecha !== alimento.fecha) {
      // Calcular el precio por unidad
      const unidadMedida2 = await unidadMedidaModelo.findByPk(id_unidadMedida);
      if (!unidadMedida2) {
        return res.status(404).json({ message: "No se encontró la unidad de medida" });
      }

      const cantidadingresada = parseFloat(cantidadmedidaUnidad);
      const precioingresado = parseFloat(precio);

      const calcantidadMedida = parseFloat(alimento.cantidadmedidaUnidad) + cantidadingresada;
      const calprecio = parseFloat(alimento.precio) + precioingresado;

      alimento.cantidadmedidaUnidad = calcantidadMedida;
      alimento.precio = calprecio;
      alimento.fecha = fecha;
      const porcioncalculo = unidadMedida2.valorMedida * cantidadingresada;
      alimento.porcion = porcioncalculo + alimento.porcion;
      alimento.preciounidad = precioingresado / cantidadingresada;

      // Guardar los cambios en la base de datos
      await alimento.save();

      // Crear el alimento con los valores actualizados
      const nuevoAlimento = await alimentoReporteModelo.create({
        id_alimento,
        cantidadmedidaUnidad: cantidadingresada,
        precio: precioingresado,
        preciounidad: alimento.preciounidad,
        porcion: porcioncalculo,
        cantidadmedidaUnidadActualizada: calcantidadMedida,
        porcionActualizada: alimento.porcion,
        fecha,
        id_unidadMedida,
      });

      // Devolver la respuesta con el nuevo alimento creado
      return res.status(201).json({ nuevoAlimento });
    } else {
      // Si solo se actualiza la descripción, guardar sin hacer cálculos adicionales
      await alimento.save();
      return res.status(200).json({ message: "Descripción actualizada correctamente" });
    }
  } catch (error) {
    console.error('Error al editar el alimento:', error);
    res.status(500).json({ message: "Error al editar el alimento" });
  }
};


export const mostrarCompratt = async (req, res) => {
  try {
    // Consultar todos los alimentos
    const alimentos = await compraModelo.findAll({
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad' ,'porcion','cantidadmedidaUnidadActualizada','fecha','porcion'],
      where: { estado: true }, // Considerando que tienes una columna "estado" para marcar si está activo o no el alimento
      include: [{ model: unidadMedidaModelo, attributes: ['unidadMedida','id'] }],
      include: [{ model: alimentoModelo, attributes: ['descripcion','id'] }],
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


export const mostrarCompraAlimmentosReportes = async (req, res) => {
  try {
    // Consultar todas las compras con la unidad de medida y el alimento asociados
    const compras = await alimentoReporteModelo.findAll({
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad' ,'porcion','cantidadmedidaUnidadActualizada','fecha','porcion','porcionActualizada'],
      include: [
        { model: unidadMedidaModelo, attributes: ['unidadMedida'] },
        { model: alimentoModelo, attributes: ['descripcion'] }
      ]
    });

    // Si se encontraron compras, las enviamos en la respuesta
    if (compras.length > 0) {
      res.status(200).json({ compras });
    } else {
      // Si no se encontraron compras, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron compras' });
    }
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    res.status(500).json({ message: 'Error al obtener las compras' });
  }
};




export const buscarFechaCompra = async (req, res) => {
  try {
    // Obtener la fecha de los parámetros de la solicitud
    const { fecha } = req.params;

    // Consultar todas las compras con la unidad de medida y el alimento asociados para la fecha dada
    const compras = await alimentoReporteModelo.findAll({
      where: { fecha: fecha },
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad', 'porcion', 'cantidadmedidaUnidadActualizada', 'fecha', 'porcion', 'porcionActualizada'],
      include: [
        { model: unidadMedidaModelo, attributes: ['unidadMedida'] },
        { model: alimentoModelo, attributes: ['descripcion'] }
      ]
    });

    // Si se encontraron compras, calcular la suma de los precios
    if (compras.length > 0) {
      const sumaPrecios = compras.reduce((acc, compra) => acc + compra.precio, 0);
      res.status(200).json({ compras, sumaPrecios });
    } else {
      // Si no se encontraron compras, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron compras para la fecha especificada' });
    }
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    res.status(500).json({ message: 'Error al obtener las compras' });
  }
};

export const mostrarCompra = async (req, res) => {
  try {
    // Consultar todas las compras con la unidad de medida y el alimento asociados
    const compras = await compraModelo.findAll({
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad' ,'porcion','cantidadmedidaUnidadActualizada','fecha','porcion','porcionActualizada'],
      include: [
        { model: unidadMedidaModelo, attributes: ['unidadMedida'] },
        { model: alimentoModelo, attributes: ['descripcion'] }
      ]
    });

    // Si se encontraron compras, las enviamos en la respuesta
    if (compras.length > 0) {
      res.status(200).json({ compras });
    } else {
      // Si no se encontraron compras, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron compras' });
    }
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    res.status(500).json({ message: 'Error al obtener las compras' });
  }
};
 
export const mostrarCompraExistente = async (req, res) => {
  try {
    // Consultar todas las compras con la unidad de medida y el alimento asociados
    const compras = await compraModelo.findAll({
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad', 'porcion', 'cantidadmedidaUnidadActualizada', 'fecha', 'porcion', 'porcionActualizada'],
      include: [
        { model: unidadMedidaModelo, attributes: ['unidadMedida'] },
        { model: alimentoModelo, attributes: ['descripcion'] }
      ]
    });

    // Filtrar las compras para mostrar solo las que tienen cantidad mayor a 0 en cantidadmedidaUnidad o porcion
    const comprasFiltradas = compras.filter(compra => compra.cantidadmedidaUnidad > 0 || compra.porcion > 0);

    // Si se encontraron compras después de filtrar, las enviamos en la respuesta
    if (comprasFiltradas.length > 0) {
      res.status(200).json({ compras: comprasFiltradas });
    } else {
      // Si no se encontraron compras después de filtrar, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron compras con cantidad mayor a 0 en cantidadmedidaUnidad o porción' });
    }
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    res.status(500).json({ message: 'Error al obtener las compras' });
  }
};

 
export const mostrarCompraNoExistente = async (req, res) => {
  try {
    // Consultar todas las compras con la unidad de medida y el alimento asociados
    const compras = await compraModelo.findAll({
      attributes: ['id', 'cantidadmedidaUnidad', 'precio', 'preciounidad', 'porcion', 'cantidadmedidaUnidadActualizada', 'fecha', 'porcion', 'porcionActualizada'],
      include: [
        { model: unidadMedidaModelo, attributes: ['unidadMedida'] },
        { model: alimentoModelo, attributes: ['descripcion'] }
      ]
    });

    // Filtrar las compras para mostrar solo las que tienen cantidad igual o menor a 0 en cantidadmedidaUnidad o porcion
    const comprasFiltradas = compras.filter(compra => compra.cantidadmedidaUnidad <= 0 || compra.porcion <= 0);

    // Si se encontraron compras después de filtrar, las enviamos en la respuesta
    if (comprasFiltradas.length > 0) {
      res.status(200).json({ compras: comprasFiltradas });
    } else {
      // Si no se encontraron compras después de filtrar, respondemos con un mensaje de error 404
      res.status(404).json({ message: 'No se encontraron compras con cantidad igual o menor a 0 en cantidadmedidaUnidad o porción' });
    }
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    res.status(500).json({ message: 'Error al obtener las compras' });
  }
};


 














 
  
  export const getalimentos = async (req, res) => {
    try {
      // Consultar todos los alimentos
      const alimentos = await compraModelo.findAll({
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


export const obteneralimento = async (req, res) => {
  try {
    // Consultar todos los alimentos
    const alimentos = await compraModelo.findAll({
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


export const mostraralimentoss = async (req, res) => {
  try {
    // Consultar todos los alimentos
    const alimentos = await compraModelo.findAll({
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


      export const mostraralimentomenu = async (req, res) => {
        try {
          // Utiliza el modelo de menú para encontrar los platos
          const platosConInfoCompleta = await ingredientesModelo.findAll({
            include: [
              {
                model: compraModelo,
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

 
 
  export const crearalimento = async (req, res) => {
    try {
      const { id_alimento, cantidadmedidaUnidad, id_unidadMedida, precio } = req.body;
  
      // Validar campos requeridos
      if (!id_alimento || !cantidadmedidaUnidad || !id_unidadMedida || !precio) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
  
      // Calcular el precio por unidad
      const unidadMedida = await unidadMedidaModelo.findByPk(id_unidadMedida);
      if (!unidadMedida) {
        return res.status(404).json({ message: "No se encontró la unidad de medida" });
      }
      const preciounidad = precio / cantidadmedidaUnidad;
  
      // Calcular la porción
      const porcion = unidadMedida.valorMedida * cantidadmedidaUnidad;
  
      // Obtener la fecha actual
      const fecha = new Date();
  
      // Crear el alimento con la fecha actual y los valores actualizados
      const nuevoAlimento = await compraModelo.create({
        id_alimento,
        cantidadmedidaUnidad,
        precio,
        preciounidad,
        porcion,
        cantidadmedidaUnidadActualizada: cantidadmedidaUnidad,
        porcionActualizada: porcion,
        fecha,
        id_unidadMedida,
      });
      const nuevoAlimentoRepporte = await alimentoReporteModelo.create({
        id_alimento,
        cantidadmedidaUnidad,
        precio,
        preciounidad,
        porcion,
        cantidadmedidaUnidadActualizada: cantidadmedidaUnidad,
        porcionActualizada: porcion,
        fecha,
        id_unidadMedida,
      });



 
      res.status(201).json({ nuevoAlimento });
    } catch (error) {
      console.error('Error al crear el alimento:', error);
      res.status(500).json({ message: "Error al crear el alimento" });
    }

    
  };
  
  
  export const editaralimento = async (req, res) => {
    try {
      const { id } = req.params; // Obtener el ID del alimento a editar
      const { id_alimento, cantidadmedidaUnidad, precio, id_unidadMedida } = req.body; // Obtener los nuevos datos del alimento
  
      // Validar campos requeridos
      if (!id_alimento || !cantidadmedidaUnidad || !precio || !id_unidadMedida) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
  
      // Buscar el alimento por su ID
      const alimento = await compraModelo.findByPk(id);
      if (!alimento) {
        return res.status(404).json({ message: "No se encontró el alimento" });
      }
  
      // Actualizar la descripción siempre
      alimento.id_alimento = id_alimento;
  
      // Verificar si se han editado cantidadmedidaUnidad, precio o id_unidadMedida
      if (cantidadmedidaUnidad !== alimento.cantidadmedidaUnidad || precio !== alimento.precio || id_unidadMedida !== alimento.id_unidadMedida) {
        // Calcular el precio por unidad
        const unidadMedida2 = await unidadMedidaModelo.findByPk(id_unidadMedida);
        if (!unidadMedida2) {
          return res.status(404).json({ message: "No se encontró la unidad de medida" });
        }
  
        const cantidadingresada = parseFloat(cantidadmedidaUnidad);
        const precioingresado = parseFloat(precio);
  
        const calcantidadMedida = parseFloat(alimento.cantidadmedidaUnidad) + cantidadingresada;
        const calprecio = parseFloat(alimento.precio) + precioingresado;
  
        alimento.cantidadmedidaUnidad = calcantidadMedida;
        alimento.precio = calprecio;
        const porcioncalculo = unidadMedida2.valorMedida * cantidadingresada;
        alimento.porcion = porcioncalculo + alimento.porcion;
        alimento.preciounidad = precioingresado / cantidadingresada;
        alimento.id_unidadMedida = id_unidadMedida; // Actualizar el ID de la unidad de medida
  
        // Guardar los cambios en la base de datos
        await alimento.save();
  
        // Obtener la fecha actual
        const fecha = new Date();
  
        // Crear el alimento con la fecha actual y los valores actualizados
        const nuevoAlimento = await alimentoReporteModelo.create({
          id_alimento,
          cantidadmedidaUnidad: cantidadingresada,
          precio: precioingresado,
          preciounidad: alimento.preciounidad,
          porcion: porcioncalculo,
          cantidadmedidaUnidadActualizada: calcantidadMedida,
          porcionActualizada: alimento.porcion,
          fecha,
          id_unidadMedida,
        });
  
        // Devolver la respuesta con el nuevo alimento creado
        return res.status(201).json({ nuevoAlimento });
      } else {
        // Si solo se actualiza la descripción, guardar sin hacer cálculos adicionales
        await alimento.save();
        return res.status(200).json({ message: "Descripción actualizada correctamente" });
      }
    } catch (error) {
      console.error('Error al editar el alimento:', error);
      res.status(500).json({ message: "Error al editar el alimento" });
    }
  };
  
  


   
  
//eliminar
export const eliminaralimentoCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await compraModelo.findByPk(id);

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    // Eliminar permanentemente el registro de la compra
    await compra.destroy();

    res.status(200).json({ message: "Compra eliminada correctamente" });
  } catch (error) {
    console.error("Error al intentar eliminar la compra:", error);
    res.status(500).json({ error: "Error interno del servidor al intentar eliminar la compra", details: error.message });
  }
};
  