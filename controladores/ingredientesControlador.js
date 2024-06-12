import { ingredientesModelo } from "../modelos/ingredientesModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";
import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { menuModelo } from "../modelos/menuModelo.js";

import { productosplatoModelo } from "../modelos/productosplato.js";

import { Sequelize } from "sequelize"; // Asegúrate de importar Sequelize según tus necesidades
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";

// Función para obtener el número de mes a partir de su nombre
function obtenerNumeroMes(nombreMes) {
  const meses = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
  };
  return meses[nombreMes.toLowerCase()];
}

export const obtenerfiltropormes = async (req, res) => {
  const { id_alimento, mes } = req.params;

  try {
    const sumaCantidadPersonaGramo = await ingredientesModelo.sum("porcion", {
      where: {
        id_alimento,
        mes,
      },
    });

    // Verificar si sumaCantidadPersonaGramo es null y mostrar mensaje de error
    if (sumaCantidadPersonaGramo === null) {
      return res.status(404).json({
        mensaje: "No existen ingredientes para el mes y el ID de alimento proporcionados o el valor es nulo",
      });
    }

    // Consultar la descripción del alimento
    const alimento = await alimentoModelo.findOne({
      where: {
        id: id_alimento,
      },
      attributes: ["descripcion"],
    });

    if (!alimento) {
      return res.status(404).json({
        mensaje: "No se encontró el alimento con el ID proporcionado",
      });
    }

    res.status(200).json({
      ingredientesTotalesmes: {
        id_alimento: alimento.descripcion,
        mes: mes,
        sumaCantidadPersonaGramo: sumaCantidadPersonaGramo || 0, // Manejar el caso cuando sumaCantidadPersonaGramo es null
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      mensaje: "Error al obtener la suma de cantidadPersonaGramo",
    });
  }
};

export const obtenerfiltroporsemanas = async (req, res) => {
  try {
    const { idAlimento, fechaInicio, fechaFin } = req.params;

    if (!idAlimento || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        mensaje: "ID del alimento, fecha de inicio y fecha de fin son requeridos en la URL",
      });
    }

    const registros = await ingredientesModelo.findAll({
      where: {
        id_alimento: idAlimento,
        fecha: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin],
        },
      },
      attributes: ["porcion"],
    });

    if (!registros || registros.length === 0) {
      return res.status(404).json({
        mensaje: "No existen registros para el alimento y rango de fechas proporcionados",
      });
    }

    // Consultar la descripción del alimento
    const alimento = await alimentoModelo.findOne({
      where: {
        id: idAlimento,
      },
      attributes: ["descripcion"],
    });

    if (!alimento) {
      return res.status(404).json({
        mensaje: "No se encontró el alimento con el ID proporcionado",
      });
    }

    const totalCantidadPersonaGramo = registros.reduce(
      (total, registro) => total + (registro.porcion || 0),
      0
    );

    res.status(200).json({
      ingredientesTotalesSemana: {
        id_alimento: alimento.descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        totalCantidadPersonaGramo: totalCantidadPersonaGramo,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      mensaje: "Error al obtener la suma total de cantidadPersonaGramo por alimento y rango de fechas",
    });
  }
};




export const obtenerfiltropordias = async (req, res) => {
  try {
    const { fecha, idAlimento } = req.params; // Acceder a los parámetros de la URL

    console.log("Fecha:", fecha);
    console.log("ID del Alimento:", idAlimento);

    if (!fecha || !idAlimento) {
      return res.status(400).json({
        mensaje: "La fecha y el ID del alimento son requeridos en la URL",
      });
    }

    const ingredientesTotalesdia = await ingredientesModelo.findAll({
      where: {
        fecha: fecha,
        id_alimento: idAlimento, // Filtrar por el ID del alimento
      },
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.col("porcion")),
          "cantidadPersonaGramo",
        ],
      ],
    });

    // Si no hay registros o totalCantidadFinal es null, mostrar mensaje de error
    if (!ingredientesTotalesdia || ingredientesTotalesdia[0].get("cantidadPersonaGramo") === null) {
      return res.status(404).json({
        mensaje: "No existen ingredientes para la fecha y el ID de alimento proporcionados o el valor es nulo",
      });
    }

    // Consultar la descripción del alimento
    const alimento = await alimentoModelo.findOne({
      where: {
        id: idAlimento,
      },
      attributes: ["descripcion"],
    });

    // Crear un objeto de respuesta que incluya la descripción y la fecha
    const respuesta = {
      ingredientesTotalesdia: {
        id_alimento: alimento.descripcion,
        fecha: fecha,
        cantidadPersonaGramo: ingredientesTotalesdia[0].get("cantidadPersonaGramo"),
      },
    };

    res.status(200).json(respuesta);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      mensaje: "Error al obtener los ingredientes totales por ID de alimento y fecha",
    });
  }
};




export const obtenerplatosdeingredientes = async (req, res) => {
  try {
    const productosplatos = await ingredientesModelo.findAll({
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
    const platos = resultadosUnicos.map((productoPlato) => ({
      id: productoPlato.plato.id,
      descripcion: productoPlato.plato.descripcion,
    }));

    res.status(200).json({ platos });
  } catch (error) {
    res.status(500).json("No existen usuarios");
  }
};

export const buscarPorFecha = async (req, res) => {
  try {
    const { id_plato, fecha } = req.params;

    if (!(id_plato && fecha)) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    // Busca los ingredientes asociados al plato y a la fecha
    const ingredientes = await ingredientesModelo.findAll({
      where: { id_plato, fecha },
      include: [
        {
          model: platoModelo,

          attributes: ["id", "descripcion"],
        },
        {
          model: alimentoModelo,
          attributes: ["id", "descripcion"],
        },
        {
          model: unidadMedidaModelo,
          attributes: ["unidadMedida"],
        },
         
      ],
      attributes: [
        "id",
        "cantidadPersonaCome",
        "cantidadPersonaGramo",
        "preciounidad",
        "costeounaPersona",
        "porcion",
        "costeo",
        "cantidad",
    
       
      
        "fecha",
        
      ],
    });

    if (ingredientes.length === 0) {
      res.status(404).json({
        message:
          "No se encontraron ingredientes para ese plato en la fecha proporcionada",
      });
      return;
    }

    // Puedes devolver los ingredientes encontrados en la respuesta
    res.status(200).json({
      message: "Ingredientes encontrados correctamente",
      ingredientes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error al buscar ingredientes por fecha");
  }
};



//Obtener
export const obteneringredientesnoooooooooooooooo = async (req, res) => {
  try {
    const ingredientes = await ingredientesModelo.findAll(
      {
        attributes: ["id", "precio", "id_plato", "id_alimento", "id_peso"],
      },
      { where: { state: true } }
    );

    res.status(200).json({ ingredientes });
  } catch (error) {
    res.status(500).json("No existe  ingredientes");
  }
};

export const obtenerIngredientesPorPlato = async (req, res) => {
  try {
    const { descripcion_plato } = req.params;

    // Busca los ingredientes por descripción del plato
    const ingredientes = await ingredientesModelo.findAll({
      include: [
        {
          model: platoModelo,
          where: {
            descripcion: descripcion_plato,
          },
          attributes: ["id", "descripcion"],
        },
        {
          model: alimentoModelo,
          attributes: ["id", "descripcion"],
        },
      ],
      attributes: [
        "id",
        "cantidad",
        "cantidadGramo",
        "numDias",
        "cantidadFinal",
      ],
    });

    if (ingredientes.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No existen ingredientes para este plato" });
    }

    // Devuelve los ingredientes relacionados con la descripción del plato
    res.status(200).json({ ingredientes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los ingredientes" });
  }
};

export const obtenerDescripcionPlato = async (req, res) => {
  try {
    const { descripcion_plato } = req.params;

    // Busca el plato por su descripción
    const plato = await platoModelo.findOne({
      where: {
        descripcion: descripcion_plato,
      },
      attributes: ["id", "descripcion", "precio"],
    });

    if (!plato) {
      return res
        .status(404)
        .json({ mensaje: "No existe un plato con esta descripción" });
    }

    // Devuelve los datos del plato
    res.status(200).json({ ingredientes: [{ plato }] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener el plato" });
    const { descripcion_plato } = req.params;
    console.log("Descripción del plato:", descripcion_plato);
  }
};

// Modificar la función obtenerDescripcionPlatoyprecio en tu servicio Node.js
export const obtenerDescripcionPlatoyprecio = async (req, res) => {
  try {
    const { descripcion_plato } = req.params;

    // Asegúrate de que la descripción del plato se reciba correctamente
    if (!descripcion_plato) {
      return res
        .status(400)
        .json({ mensaje: "La descripción del plato es requerida" });
    }

    // Busca el plato por su descripción
    const plato = await platoModelo.findOne({
      where: {
        descripcion: descripcion_plato,
      },
      attributes: ["id", "precio"],
    });

    if (!plato) {
      return res
        .status(404)
        .json({ mensaje: "No existe un plato con esta descripción" });
    }

    // Devuelve los datos del plato
    res.status(200).json({ platos: [{ plato }] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener el plato" });
  }
};

export const obtenerPlatos = async (req, res) => {
  try {
    const { descripcion_plato } = req.params;

    // No es necesario buscar el plato por su descripción en este caso
    // Simplemente devuelve los detalles del plato utilizando la descripción proporcionada
    const plato = {
      id: 1, // Reemplaza con el ID real del plato
      descripcion: descripcion_plato,
      // Otros atributos del plato si los tienes
    };

    if (!plato) {
      return res
        .status(404)
        .json({ mensaje: "No existe un plato con esta descripción" });
    }

    // Devuelve los datos del plato
    res.status(200).json({ ingredientes: [{ plato }] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener el plato" });
  }
};

export const obteneringredientes = async (req, res) => {
  try {
    const ingredientes = await ingredientesModelo.findAll({
      include: [
        {
          model: platoModelo,
          attributes: ["id", "descripcion"],
        },
        {
          model: alimentoModelo,
          attributes: ["id", "descripcion"],
        },
      ],
      attributes: [
        "id",
        "cantidad",
        "cantidadGramo",
        "numDias",
        "cantidadFinal",
        "precio",
        "precioporcion",
      ],
    });

    if (ingredientes.length === 0) {
      return res.status(404).json({ mensaje: "No existen ingredientes" });
    }

    res.status(200).json({ ingredientes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener los ingredientes" });
  }
};

//Crear

export const crearingredientes = async (req, res) => {
  try {
    const { id_plato, cantidad, numDias, precio, fecha } = req.body;
    if (!(id_plato && cantidad && numDias && precio && fecha)) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    // Busca todos los alimentos asociados a ese plato
    const alimentosPlato = await productosplatoModelo.findAll({
      where: { id_plato },
    });

    if (alimentosPlato.length === 0) {
      res
        .status(404)
        .json({ message: "No se encontraron alimentos para ese plato" });
      return;
    }

    // Busca el menú asociado a la fecha proporcionada
    const menu = await menuModelo.findOne({
      where: { fecha: fecha },
    });

    if (!menu) {
      res.status(404).json({
        message: "No se encontró un menú para la fecha proporcionada",
      });
      return;
    }

    // Crea nuevos registros en la tabla ingredientes para cada alimento asociado al plato
    await Promise.all(
      alimentosPlato.map(async (alimentoPlato) => {
        const { id_alimento } = alimentoPlato;

        const alimento = await alimentoModelo.findByPk(id_alimento);

        if (!alimento) {
          console.warn(`El alimento con id ${id_alimento} no fue encontrado`);
          return;
        }

        const equivalenteGramo = alimento.equivalenteGramo;
        const gramoPersona = alimento.gramoPersona;

        const x = gramoPersona * cantidad;
        const y = x / equivalenteGramo;
        const f = numDias * y;
        const p = precio * f;

        // Crea un nuevo registro en la base de datos
        await ingredientesModelo.create({
          id_plato,
          id_alimento,
          cantidad,
          cantidadGramo: y,
          numDias,
          cantidadFinal: f,
          precio: p,

          fecha, // Agrega la fecha del menú al ingrediente
        });
      })
    );

    res.status(201).json({ message: "Ingredientes creados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error al crear ingredientes");
  }
};

//Editar
export const editaringredientes = async (req, res) => {
  if (!req.body.precio) {
    res.status(400).json({ message: "los campos son  requeridos" });
  }
  const precio = await ingredientesModelo.findOne({
    where: { id: req.params.id },
  });
  if (precio) {
    precio.set(req.body);
    await precio.save();
    res
      .status(200)
      .json({ message: "ingredientes fue modificada correctamente" });
  } else {
    res.status(404).json({ message: "ingredientes no encontrado" });
  }
};

//eliminar no tiene estado
export const eliminaringredientes = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredientes = await ingredientesModelo.findOne({
      where: { id },
    });
    ingredientes.set({ ...precio, estado: false });
    await ingredientes.save();

    res.status(200).json({ message: "ingredientes eliminada correctamente" });
  } catch (error) {
    res
      .status(200)
      .json({ message: "no se encuentra registrada ese ingredientes" });
  }
};


export const eliminaringredientescreados = async (req, res) => {
  try {
    const ingredientes = await ingredientesModelo.findByPk(req.params.id);

    if (ingredientes) {
      // Eliminar el menú de la base de datos
      await ingredientes.destroy();

      res.status(200).json({ message: "ingredientes fue eliminado correctamente" });
    } else {
      res.status(404).json({ message: "No se encuentra registrado ese ingredientes" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar elingredientes" });
  }
};