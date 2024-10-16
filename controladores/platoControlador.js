import { menuModelo } from "../modelos/menuModelo.js";
import { platoModelo } from "../modelos/platoModelo.js";
import { tipo_menuModelo } from "../modelos/tipo_menuModelo.js"; 
import { Op } from "sequelize";

export const obtenerplato = async (req, res) => {
  try {
      const plato = await platoModelo.findAll({
        attributes: ['id', 'descripcion', 'estado'],
        where: {estado:true}
      });
    
      res.status(200).json({plato});
     
    } catch (error) {
        res.status(500).json("No existe  plato");
    }
  
};

//Obtener platos con datos relacionados 
 export const mostrarplato = async (req, res) => {
  try {
    const platos = await platoModelo.findAll({
   
      include:[{
      model:tipo_menuModelo,
      attributes:['id','tipo']
    }],
    
    attributes: ["id","descripcion"],
    where: {estado:true}
  });
  
    res.status(200).json({platos});
   
  } catch (error) {
      res.status(500).json("No existe  platos");
  }
  };
  

 

  export const mostrarplatomenu = async (req, res) => {
    try {
      // Utiliza el modelo de menú para encontrar los platos
      const platosConInfoCompleta = await menuModelo.findAll({
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
          },
        ],
        attributes: ['id', 'cantidad', 'cantidadfija', 'fecha'],
      });
  
      const platosSet = new Set(); // Utilizar un conjunto para evitar duplicados
  
      const platos = platosConInfoCompleta.reduce((result, menu) => {
        const platoInfo = menu.plato ? {
          id: menu.plato.id,
          descripcion: menu.plato.descripcion,
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
  
      res.status(200).json({ platos });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener los platos en el menú", error: error.message });
    }
  };
  
  export const mostrarplatocreditorrr= async (req, res) => {
    try {
      const platos = await menuModelo.findAll({
        where: {
          fecha: {
            [Op.gte]: new Date(), // Mayor o igual a la fecha actual
          },
        },
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion', 'precio', 'estado'],
          },
          
        ],
        attributes: ['id', 'cantidad', 'cantidadfija', 'fecha'],
      });
  
      res.status(200).json({ platos });
    } catch (error) {
      console.error(error);
      res.status(500).json("Error al obtener los datos del menú");
    }
  };
  
 
  export const mostrarplatocredito = async (req, res) => {
    try {
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha
  
      const platosConInfoCompleta = await menuModelo.findAll({
        where: {
          fecha: fechaActual, // Igual a la fecha actual
        },
        include: [
          {
            model: platoModelo,
            attributes: ['id', 'descripcion'],
          },
        ],
        attributes: ['id', 'cantidad', 'cantidadfija', 'fecha'],
      });
  
      const platos = platosConInfoCompleta.map((menu) => {
        const platoInfo = menu.plato ? {
          id: menu.plato.id,
          descripcion: menu.plato.descripcion,
        } : null;
  
        return {
          id: platoInfo ? platoInfo.id : null,
          descripcion: platoInfo ? platoInfo.descripcion : null,
        };
      });
  
      res.status(200).json({ platos });
    } catch (error) {
      console.error(error);
      res.status(500).json("Error al obtener los datos del menú");
    }
  };



  export const mostrartodoslosplatosMenu = async (req, res) => {
    try {
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a las 00:00:00:000 para comparar solo la fecha

        const platosConInfoCompleta = await menuModelo.findAll({
            where: {
                fecha: fechaActual, // Igual a la fecha actual
                habilitado: true, // Filtrar solo los platos habilitados
                cantidad: { [Op.gt]: 0 } // Filtrar solo los platos con cantidad mayor a 0
            },
            include: [
                {
                    model: platoModelo,
                    where: { estado: true }, // Filtrar solo los platos con estado true en el modelo platoModelo
                    attributes: ['id', 'descripcion', 'precio'],
                },
            ],
            attributes: ['id', 'cantidad', 'cantidadfija', 'fecha'],
        });

        const platos = platosConInfoCompleta.map((menu) => ({
            id: menu.plato ? menu.plato.id : null,
            descripcion: menu.plato ? menu.plato.descripcion : null,
            precio: menu.plato ? menu.plato.precio : null,
            cantidad: menu.cantidad, // Acceder a la cantidad del menú, no del plato
        }));

        if (platos.length > 0) {
            res.status(200).json({ platos });
        } else {
            res.status(404).json({ message: "No hay platos disponibles" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los platos" });
    }
};

  
  export const mostrartodoslosplatos = async (req, res) => {
    try {
      const platos = await platoModelo.findAll({
     
        include:[{
        model:tipo_menuModelo,
        attributes:['id','tipo']
      }],
      
      attributes: ["id","descripcion","precio"],
      where: {estado:true}
    });
    
      res.status(200).json({platos});
     
    } catch (error) {
        res.status(500).json("No existe  platos");
    }
    };





   
    
  //Crear
  export const crearplatos = async (req, res) => {
    try {
        const { descripcion,id_tipomenu,precio} = req.body;
        if (!(descripcion )) {
          res.status(400).json({ message: "campo requerido" });
        }
        const oldUser = await platoModelo.findOne({ where: { descripcion: descripcion } });
        if (oldUser) {
          return res.status(409).json("el plato ya existe, agregar otro");
        }
        const plato = await platoModelo.create({
          
            descripcion, 
            id_tipomenu,
            precio
           
        });
        res.status(201).json({ plato});
      } catch (error) {
        res.status(500).json("error al agregar plato");
      }
  };


  

  //Editar
  export const editarplatos = async (req, res) => {
    if (!req.body.descripcion) {
        res.status(400).json({ message: "campo requerido" });
      }
      const descripcion = await platoModelo.findOne({ where: { id: req.params.id } });
      if (descripcion) {
        descripcion.set(req.body);
        await descripcion.save();
        res.status(200).json({ message: "el plato  fue modificado correctamente" });
      } else {
        res.status(404).json({ message: "el plato no fue modificado correctamente" });
      }
    
  };

  //eliminar
  export const eliminarplatos = async (req, res) => {
    try {
      const { id } = req.params;
      const plato = await platoModelo.findByPk(id);
  
      if (!plato) {
        return res.status(404).json({ message: "Plato no encontrado" });
      }
  
      // Eliminar permanentemente el registro del plato
      await plato.destroy();
  
      res.status(200).json({ message: "Plato eliminado correctamente" });
    } catch (error) {
      console.error("Error al intentar eliminar el plato:", error);
      res.status(500).json({ error: "Error interno del servidor al intentar eliminar el plato", details: error.message });
    }
  };
  