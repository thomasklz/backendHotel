import { personaModelo } from "../modelos/personaModelo.js";
import { usuarioModelo } from "../modelos/usuarioModelo.js";
import { tipo_menuModelo } from "../modelos/tipo_menuModelo.js";
import bcrypt from 'bcrypt';
import { tipo_usuarioModelo } from "../modelos/tipo_usuarioModelo.js";
import { Op } from 'sequelize';
import { alimentoModelo } from "../modelos/alimentoModelo.js";
import { ingresosModelo } from "../modelos/ingresos.js";

import fs from 'fs/promises';








//Obtener
export const obtenerPersona = async (req, res) => {
    try {
        const personas = await personaModelo.findAll({
            attributes: ['id', 'nombre', 'email', 'telefono', 'foto', 'estado'],
            where: {
                estado: true,
                id: { [Op.gt]: 1 } // Filtra los registros con id mayor a 1
            }
        });

        res.status(200).json({ personas });
    } catch (error) {
        res.status(500).json("Error al obtener personas");
    }
};

  // Buscar persona por ID

  import path from 'path';
import { unidadMedidaModelo } from "../modelos/unidadMedidaModelo.js";

  export const buscarPersona = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Buscar la persona en la base de datos
      const persona = await personaModelo.findByPk(id, {
        attributes: ['id', 'nombre', 'email', 'telefono', 'foto', 'estado'],
      });
  
      // Verificar si la persona existe
      if (!persona) {
        return res.status(404).json({ message: 'Persona no encontrada' });
      }

      
  
      // Construir la URL de la imagen
      const imagenUrl = persona.foto
      ? `${req.protocol}://${req.get('host')}/imagenes/${persona.foto}`
      : null;
    
  
      res.status(200).json({ persona: { ...persona.toJSON(), imagenUrl } });
    } catch (error) {
      res.status(500).json({ message: 'Error al buscar persona' });
    }
  };
  



/* export const buscarPersona = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la persona en la base de datos
    const persona = await personaModelo.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'telefono', 'foto', 'estado'],
    });

    // Verificar si la persona existe
    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    res.status(200).json({ persona });
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar persona' });
  }
}; */
//-----------------------------------editar----Nombre-------------------------------
export const editNombre = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Verificar si el campo "contraseña" está presente en el cuerpo de la solicitud
    if (!nombre) {
      return res.status(400).json({ message: 'El campo "nombre" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await personaModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el campo "nombre" del usuario
    usuarioExistente.nombre = nombre;
    await usuarioExistente.save();

    res.status(200).json({ message: 'nombre modificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar nombre de usuario' });
  }
};


//-------------------------------------------editar----email----------------------
export const editEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { EmailInstitucional } = req.body;

    // Verificar si el campo "email" está presente en el cuerpo de la solicitud
    if (!EmailInstitucional) {
      return res.status(400).json({ message: 'El campo "email" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await personaModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el campo "email" del usuario
    usuarioExistente.EmailInstitucional = EmailInstitucional;
    await usuarioExistente.save();

    res.status(200).json({ message: 'email modificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar email de usuario' });
  }
};


//-------------------------------------------editar----telefono----------------------
export const editTelefono = async (req, res) => {
  try {
    const { id } = req.params;
    const { TelefonoC } = req.body;

    // Verificar si el campo "telefono" está presente en el cuerpo de la solicitud
    if (!TelefonoC) {
      return res.status(400).json({ message: 'El campo "telefono" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await personaModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el campo "telefono" del usuario
    usuarioExistente.TelefonoC = TelefonoC;
    await usuarioExistente.save();

    res.status(200).json({ message: 'telefono modificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar telefono de usuario' });
  }
};



//-------------------------------------------editar----foto----------------------
export const editFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { foto } = req.body;

    // Verificar si el campo "foto" está presente en el cuerpo de la solicitud
    if (!foto) {
      return res.status(400).json({ message: 'El campo "foto" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await personaModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar el campo "foto" del usuario
    usuarioExistente.foto = foto;
    await usuarioExistente.save();

    res.status(200).json({ message: 'foto modificada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al editar foto de usuario' });
  }
};


const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

export const crearImagen = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;

    let fotoNombre;

    if (req.file || (req.files && req.files.length > 0)) {
      // Si se proporciona una imagen en la solicitud
      if (req.file && !allowedMimes.includes(req.file.mimetype)) {
        return res.status(404).json({ message: "Solo se permiten archivos JPEG, PNG y JPG" });
      }

      fotoNombre = req.file ? req.file.filename : req.files[0].filename;
    } else {
      // Si no se proporciona una imagen, utiliza la imagen por defecto
      fotoNombre = 'fotoIconoUsuario.jpeg';
    }

    const nuevaPersona = await personaModelo.create({
      nombre,
      email: email.toLowerCase(),
      telefono,
      foto: fotoNombre,
    });

    res.status(200).json({ message: "Imagen subida con éxito", img: nuevaPersona.foto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const rutaCarpetaImagenes = 'imagenes';

// Nombre de la foto por defecto
const nombreFotoDefecto = 'fotoIconoUsuario.jpeg';



 


export const uploadImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({'message':'No se proporcionó una imagen'});
    }
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimes.includes(req.file.mimetype)) {
      const persona= await personaModelo.findOne({where:{id:req.params.id}});
      if(persona){
        const nombreImagen = req.file.filename;

        // const nuevaPersona = await personaModelo.create({
        //   nombre,
        //   email: email.toLowerCase(),
        //   telefono,
        //   foto: nombreImagen, // Siempre utiliza la foto por defecto
        //   id_tipousuario: tipoUsuarioId,
        // });
    

        persona.set({...persona,foto:nombreImagen});
        await persona.save();
        res.status(200).json({ message: "Imagen subida con éxito" , img:persona.foto});
        }else{
        res.status(404).json({message: "Usuario no encontrado"});
      }
    } else {
      res.status(404).json({message: "Solo se permiten archivos JPEG, PNG y JPG"});
    }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

export const crearPersona = async (req, res) => {
  try {
    const { Nombre1,Nombre2,Apellido1,Apellido2, EmailInstitucional, TelefonoC, foto, Identificacion, contrasena, id_tipousuario } = req.body;

    if (!(Nombre1 &&Nombre2 &&Apellido1  &&  Apellido2 && EmailInstitucional && TelefonoC && Identificacion && contrasena)) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    // Verificar si hay algún registro en la tabla tipo_usuarioModelo
    const tiposUsuarios = await tipo_usuarioModelo.findAll();

    if (tiposUsuarios.length === 0) {
      // No hay registros en la tabla tipo_usuarioModelo, crear tipos de usuario por defecto
      const tipoAdministrador = await tipo_usuarioModelo.create({ tipo: "Administrador" });
      const tipoUsuario = await tipo_usuarioModelo.create({ tipo: "Cliente" });
      const tipcajero = await tipo_usuarioModelo.create({ tipo: "Cajero" });
    }
    // Verificar si hay algún registro en la tabla tipo_menuModelo
    const tiposMenu = await tipo_menuModelo.findAll();
    if (tiposMenu.length === 0) {
      // No hay registros en la tabla tipo_menuModelo, crear tipos de menú por defecto
      const tipoDesayuno = await tipo_menuModelo.create({ tipo: "Desayuno", id: 1 });
      const tipoAlmuerzo = await tipo_menuModelo.create({ tipo: "Almuerzo", id: 2 });
      const tipoMerienda = await tipo_menuModelo.create({ tipo: "Merienda", id: 3 });
    }
     // Verificar si hay algún registro en la tabla unidad medidaa
     const unidadMedida = await unidadMedidaModelo.findAll();

     if (unidadMedida.length === 0) {
       // No hay registros en la tabla tipo_menuModelo, crear tipos de menú por defecto
       const libra = await unidadMedidaModelo.create({ unidadMedida: "Libra", valorMedida:" 453.592", id: 1 });
       const kilo = await unidadMedidaModelo.create({ unidadMedida: "Kilo",  valorMedida:"1000",id: 2 });
       const litro = await unidadMedidaModelo.create({ unidadMedida: "Litro",  valorMedida:"1000 ",id: 3 });
       const onza = await unidadMedidaModelo.create({ unidadMedida: "Onza",  valorMedida:" 28.3495",id: 4 });
       const cubetahuevo = await unidadMedidaModelo.create({ unidadMedida: "Cubeta",  valorMedida:"30",id: 5 });
     }

   // Verificar si hay algún registro en la tabla ingresos
   const tiposingresos = await ingresosModelo.findAll();

   if (tiposingresos.length === 0) {
     // No hay registros en la tabla tipo_menuModelo, crear tipos de menú por defecto
     const tipoCredito = await ingresosModelo.create({ tipo: "Credito", id: 1 });
     const tipoSinCredito = await ingresosModelo.create({ tipo: "SinCredito", id: 2 });
    }

    

    // Verificar si hay algún registro en la tabla persona
    const personas = await personaModelo.findAll();
    let tipoUsuarioId = null;

    if (personas.length === 0) {
      // No hay registros en la tabla persona, asignar automáticamente el tipo "Administrador"
      const tipoAdministrador = await tipo_usuarioModelo.findOne({ where: { tipo: "Administrador" } });

      if (!tipoAdministrador) {
        // Si no existe el tipo "Administrador", crearlo
        const nuevoTipoAdministrador = await tipo_usuarioModelo.create({ tipo: "Administrador" });
        tipoUsuarioId = nuevoTipoAdministrador.id;
      } else {
        tipoUsuarioId = tipoAdministrador.id;
      }
    } else {
      // Hay registros en la tabla persona, id_tipousuario es requerido
      if (!id_tipousuario) {
        return res.status(400).json({ message: "El campo id_tipousuario es requerido " });
      }

      // Usar el tipo de usuario proporcionado en la solicitud
      tipoUsuarioId = id_tipousuario;
    }

    // Validar si el email ya existe en la tabla de persona
    const emailExistente = await personaModelo.findOne({ where: { EmailInstitucional } });
    if (emailExistente) {
      return res.status(409).json({ message: "El email ya existe" });
    }

    // Validar si el teléfono ya existe en la tabla de persona
    const telefonoExistente = await personaModelo.findOne({ where: { TelefonoC } });
    if (telefonoExistente) {
      return res.status(409).json({ message: "El teléfono ya existe" });
    }

    // Crear persona en la base de datos
    const nuevaPersona = await personaModelo.create({
      Nombre1,
      Nombre2,
      Apellido1,
      Apellido2,
      EmailInstitucional: EmailInstitucional.toLowerCase(),
      TelefonoC,
      foto: `${nombreFotoDefecto}`, // Siempre utiliza la foto por defecto
      id_tipousuario: tipoUsuarioId,
    });

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear usuario en la base de datos
    const nuevoUsuario = await usuarioModelo.create({
      Identificacion,
      contrasena: hashedPassword,
      id_persona: nuevaPersona.id,
      id_tipousuario: tipoUsuarioId,
    });

    res.status(201).json({ persona: nuevaPersona, usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear persona y usuario" });
  }
};
  
  export const editardatos = async (req, res) => {
    try {
      const { nombre, email, telefono, foto, usuario } = req.body;
  
      if (!nombre || !email || !telefono || !foto || !usuario ) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
  
      const persona = await personaModelo.findOne({ where: { id: req.params.id } });
  
      if (persona) {
        persona.set({
          nombre,
          email: email.toLowerCase(),
          telefono,
          foto,
        });
  
        await persona.save();
  
        const usuarioEncontrado = await usuarioModelo.findOne({ where: { id_persona: persona.id } });
  
        if (usuarioEncontrado) {
          usuarioEncontrado.set({ usuario });
          await usuarioEncontrado.save();
        } else {
          const nuevoUsuario = await usuarioModelo.create({
            usuario,
          
            id_persona: persona.id,
          });
        }
  
        res.status(200).json({ message: "Datos modificados correctamente" });
      } else {
        res.status(404).json({ message: "Datos no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al editar Datos" });
    }
  };
  
  
  //Editar
  export const editarpersona = async (req, res) => {
    if (!req.body.email) {
        res.status(400).json({ message: "Campo requerido" });
      }
      
      const email = await personaModelo.findOne({ where: { id: req.params.id } });
      
      if (email) {
        email.set(req.body);
        await email.save();
        res.status(200).json({ message: "persona modificada correctamente" });
      } else {
        res.status(404).json({ message: "persona no encontrada" });
      }
  
  };

  //eliminar
  export const eliminarPersona = async (req, res) => {
    
    try {
        const { id } = req.params;
        const persona = await personaModelo.findOne({
          where: { id },
          
        });
        persona.set({ ...persona, estado: false });
        await persona.save();
    
        res.status(200).json({ message: "persona eliminada correctamente" });
      } catch (error) { 
        res.status(200).json({ message: "no se encuentra registrada esa persona" });
      }
  };
  




  
  



 
  export const crearPersonaCliente = async (req, res) => {
    try {
      const { Nombre1, Nombre2, Apellido1, Apellido2, EmailInstitucional, TelefonoC, foto, Identificacion, id_tipousuario } = req.body;
  
      if (!(Nombre1 && Nombre2 && Apellido1 && Apellido2 && EmailInstitucional && TelefonoC && Identificacion)) {
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }
  
      // Verificar si hay algún registro en la tabla persona
      const personas = await personaModelo.findAll();
      let tipoUsuarioId = null;
  
      // Validar si el email ya existe en la tabla de persona
      const emailExistente = await personaModelo.findOne({ where: { EmailInstitucional } });
      if (emailExistente) {
        return res.status(409).json({ message: "El email ya existe" });
      }
  
      // Validar si el teléfono ya existe en la tabla de persona
      const telefonoExistente = await personaModelo.findOne({ where: { TelefonoC } });
      if (telefonoExistente) {
        return res.status(409).json({ message: "El teléfono ya existe" });
      }
  
      // Crear persona en la base de datos
      const nuevaPersona = await personaModelo.create({
        Nombre1,
        Nombre2,
        Apellido1,
        Apellido2,
        EmailInstitucional: EmailInstitucional.toLowerCase(),
        TelefonoC,
        foto: `${nombreFotoDefecto}`, // Siempre utiliza la foto por defecto
        id_tipousuario: 2,
      });
  
      const contrasena = `${Identificacion}ESPAM`; // Construir la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);
  
      // Crear usuario en la base de datos
      const nuevoUsuario = await usuarioModelo.create({
        Identificacion,
        contrasena: hashedPassword,
        id_persona: nuevaPersona.id,
        id_tipousuario: 2,
      });
  
      res.status(201).json({ persona: nuevaPersona, usuario: nuevoUsuario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear persona y usuario" });
    }
  };
  