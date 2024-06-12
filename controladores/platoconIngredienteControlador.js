platoconIngredienteModelo
import { platoModelo } from "../modelos/platoModelo.js";
import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { menuModelo } from "../modelos/menuModelo.js";

import { productosplatoModelo } from "../modelos/productosplato.js";

import { Sequelize } from "sequelize"; // Asegúrate de importar Sequelize según tus necesidades
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";
import { platoconIngredienteModelo } from "../modelos/platoconIngredienteModelo.js";

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


export const crearplatoconIngrediente = async (req, res) => {
    try {
        const { id_plato, id_alimentos } = req.body;

        // Validar campos requeridos
        if (!id_plato || !id_alimentos || id_alimentos.length === 0) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Verificar si el plato ya existe en la relación productosplato
        const platoExistente = await platoconIngredienteModelo.findOne({
            where: {
                id_plato,
            },
        });

        if (platoExistente) {
            // El plato ya existe en la relación productosplato
            return res.status(400).json({ message: "Este plato ya existe" });
        }

        // Arreglo para almacenar errores
        const errores = [];

        // Verificar si todos los alimentos existen en la base de datos
        for (const alimento of id_alimentos) {
            try {
                const id_alimento = alimento.id_alimento; // Extraer el 'id_alimento' del objeto
                const alimentoDb = await alimentoModelo.findByPk(id_alimento);
                if (!alimentoDb) {
                    errores.push({ message: `El alimento con ID ${id_alimento} no fue encontrado` });
                    continue;
                }
            } catch (error) {
                console.error('Error al procesar alimento:', error);
                errores.push({ message: 'Error al procesar alimento' });
            }
        }

        // Si hubo errores, enviar una respuesta con los errores
        if (errores.length > 0) {
            return res.status(400).json({ errores });
        }

        // Si no hubo errores, continuar con la creación de productos
        for (const alimento of id_alimentos) {
            const id_alimento = alimento.id_alimento; // Extraer el 'id_alimento' del objeto
            const cantidadPersonaCome = alimento.cantidadPersonaCome; // Extraer 'cantidadPersonaCome' también si es necesario
            const alimentoDb = await alimentoModelo.findByPk(id_alimento);
            const unidadMedidaDb = await unidadMedidaModelo.findByPk(alimentoDb.id_unidadMedida);
            const cantidadPersonaGramo = unidadMedidaDb.valorMedida / cantidadPersonaCome;

            await platoconIngredienteModelo.create({
                id_plato,
                id_alimento,
                cantidadPersonaCome,
                cantidadPersonaGramo,
                 mes: new Date().getMonth() + 1, // Obtener el mes actual
                fecha: new Date(),
                id_unidadMedida: unidadMedidaDb.id, // Pasar el id de la unidad de medida
            });
        }

        // Si no hubo errores, enviar una respuesta de éxito
        res.status(201).json({ message: "Registros de productos creados exitosamente" });
    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({ message: "Error al crear productos con su plato" });
    }
};



export const obtenerproductosplatos_PorPlato_platoconIngrediente = async (req, res) => {
    try {
      const { descripcion_plato } = req.params;
  
      // Busca los ingredientes por descripción del plato
      const productosplato = await platoconIngredienteModelo.findAll({
        include: [
          {
            model: platoModelo,
            where: {
              descripcion: descripcion_plato,
            },
            attributes: ['id', 'descripcion'],
          },
          {
            model: alimentoModelo,
            attributes: ['id', 'descripcion'],

          },
          {
            model: unidadMedidaModelo,
            attributes: ['unidadMedida','valorMedida'],
          },

         
        ],
        attributes: ['id','cantidadPersonaGramo','cantidadPersonaCome'],
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


  export const obtenerListaplatosconIngrediente = async (req, res) => {
    try {
      const platoconIngrediente = await platoconIngredienteModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ["id", "descripcion"], // Seleccionar tanto el ID como la descripción del plato
          },
        ],
      });
  
      // Extraer la descripción y el ID de cada plato del resultado
      const platosUnicos = platoconIngrediente.reduce((acumulador, item) => {
        const { id, descripcion } = item.plato;
        // Verificar si ya existe una entrada con la misma descripción
        const existe = acumulador.some(plato => plato.descripcion === descripcion);
        // Si no existe, agregar una nueva entrada con la descripción y el ID
        if (!existe) {
          acumulador.push({ id, descripcion });
        }
        return acumulador;
      }, []);
  
      res.status(200).json({ platosUnicos: platosUnicos }); // Enviar solo las descripciones únicas de los platos junto con sus IDs
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: "Error al obtener las descripciones e IDs de los platos." });
    }
  };
  


  export const obtenerDescripcionplatoconIngrediente = async (req, res) => {
    try {
      const { descripcion_plato } = req.params;
  
      // Busca el plato por su descripción
      const plato = await platoModelo.findOne({
        where: {
          descripcion: descripcion_plato,
        },
        attributes: ['id', 'descripcion' ],
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