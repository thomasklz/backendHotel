import { personaModelo } from "../modelos/personaModelo.js";
import { tipo_usuarioModelo } from "../modelos/tipo_usuarioModelo.js";
import { usuarioModelo } from "../modelos/usuarioModelo.js";

import bcrypt from "bcrypt";


export const obtenerNombrePorUsuario = async (req, res) => {
  try {
    let { nombreUsuario } = req.params; // Accedemos al parámetro de la URL

    // Verificamos si el nombre de usuario es una cadena, si no, lo convertimos a cadena
    if (typeof nombreUsuario !== "string") {
      nombreUsuario = nombreUsuario.toString();
    }

    // Asegúrate de que el nombre de usuario se reciba correctamente
    if (!nombreUsuario) {
      return res
        .status(400)
        .json({ mensaje: "El nombre de usuario es requerido" });
    }

    // Busca el usuario por su nombre de usuario y selecciona el nombre asociado a ese usuario
    const usuario = await usuarioModelo.findOne({
      where: {
        Identificacion: nombreUsuario,
      },
      include: [{ model: personaModelo, attributes: ["id","Apellido1", "Apellido2", "Nombre1", "Nombre2"] }],
    });

    if (!usuario) {
      return res
        .status(404)
        .json({ mensaje: "No existe un usuario con este nombre de usuario" });
    }

    // Devuelve todos los campos solicitados
    res.status(200).json({
      id: usuario.persona.id,
      Identificacion: usuario.Identificacion,
      Nombre1: usuario.persona.Nombre1,
      Nombre2: usuario.persona.Nombre2,
      Apellido1: usuario.persona.Apellido1,
      Apellido2: usuario.persona.Apellido2
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mensaje: "Error al obtener el nombre del usuario" });
  }
};


export const obtenerusuario = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto","estado"],

        },
      ],

      attributes: ["id", "Identificacion"],
      where: { estado:true, id_tipousuario: 2 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuarios");
  }
};

export const obtenerusuarioestado = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto","estado"],

        },
      ],

      attributes: ["id", "Identificacion"],
      where: { id_tipousuario: 2 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuarios");
  }
};

export const obtenerusuariocedula = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      attributes: ["id", "Identificacion"],
      where: { estado: true, id_tipousuario: 2 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuarios");
  }
};

export const listadoadministradores = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto"],
        },
      ],

      attributes: ["id", "Identificacion"],
      where: { estado: true, id_tipousuario: 1 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuarios");
  }
};



export const listadoaCajero = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto"],
        },
      ],

      attributes: ["id", "Identificacion"],
      where: { estado: true, id_tipousuario: 3 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuarios");
  }
};



export const listados = async (req, res) => {
  try {
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id", "Apellido1", "Apellido2", "Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto"],
        },
        {
          model: tipo_usuarioModelo,
          attributes: ["id", "tipo"],
        },
      ],
      attributes: ["id", "Identificacion"],
      where: { estado: true },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json({ error: "No existe usuarios" });
  }
};


export const obtusuario = async (req, res) => {
  try {
    console.log("Antes de la consulta a la base de datos");
    const usuarios = await usuarioModelo.findAll({
      include: [
        {
          model: personaModelo,
          attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto"],
        },
      ],

      attributes: ["id", "Identificacion", "contrasena"],
      where: { estado: true, id_tipousuario: 1 },
    });

    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json("No existe  usuariosmmmmmmmmmmmmm");
  }
};


//editar un solo campo ----------------------------------------------------
//-------------------------usuario
export const editUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;

    // Verificar si el campo "usuario" está presente en el cuerpo de la solicitud
    if (!usuario) {
      return res
        .status(400)
        .json({ message: 'El campo "usuario" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await usuarioModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualizar el campo "usuario" del usuario
    usuarioExistente.usuario = usuario;
    await usuarioExistente.save();

    res.status(200).json({ message: "Usuario modificado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al editar usuario" });
  }
};

//--------------------------------contrasena

export const editContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { contrasena } = req.body;

    // Verificar si el campo "contraseña" está presente en el cuerpo de la solicitud
    if (!contrasena) {
      return res
        .status(400)
        .json({ message: 'El campo "contraseña" es requerido' });
    }

    // Buscar el usuario en la base de datos
    const usuarioExistente = await usuarioModelo.findOne({ where: { id } });

    // Verificar si el usuario existe
    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Actualizar el campo "contraseña" del usuario con la nueva contraseña encriptada
    usuarioExistente.contrasena = hashedPassword;
    await usuarioExistente.save();

    res.status(200).json({ message: "Contraseña modificada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al editar contraseña de usuario" });
  }
};

// Buscar usuario por ID
export const buscarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario en la base de datos
    const usuario = await usuarioModelo.findByPk(id, {
      attributes: ["id", "Identificacion", "contrasena"],
      include: {
        model: personaModelo,
        attributes: ["id","Apellido1","Apellido2","Nombre1", "Nombre2", "EmailInstitucional", "TelefonoC", "foto"],
      },
    });

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ usuario });
  } catch (error) {
    res.status(500).json({ message: "Error al buscar usuario" });
  }
};

//Crear

 

export const iniciarSesion = async (req, res) => {
  try {
    const { Identificacion, contrasena } = req.body;
    if (!(Identificacion && contrasena)) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    // Verificar si el usuario existe en la base de datos
    const usuarioExistente = await usuarioModelo.findOne({
      where: { Identificacion },
      include: [{
        model: personaModelo,
        as: 'persona', // Asegúrate de que este alias coincida con el alias en la configuración de la relación
      }],
    });

    if (!usuarioExistente) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    // Verificar si el usuario está habilitado (estado === true)
    if (!usuarioExistente.estado) {
      return res.status(401).json({ message: "El usuario está deshabilitado" });
    }

    // Verificar si la contraseña es correcta
    const contrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuarioExistente.contrasena
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Resto del código para el inicio de sesión...

    // Acceder al nombre de la persona a través de la relación
    const nombrePersona = usuarioExistente.persona ? usuarioExistente.persona.Nombre1 : '';

    // Agregar condiciones adicionales
    let mensaje = "Inicio de sesión exitoso";
    if (usuarioExistente.id_persona === 1) {
      mensaje += " - Usuario con id_persona igual a 1";
      // Aquí puedes agregar las rutas específicas para id_persona igual a 1
    } else {
      mensaje += " - Otro tipo de usuario";
      // Aquí puedes agregar las rutas específicas para otros tipos de usuarios
    }

    // Si el usuario y la contraseña son válidos, puedes devolver una respuesta exitosa
    res.status(200).json({
      message: mensaje,
      idPersona: usuarioExistente.id_persona,
      idUsuario: usuarioExistente.id,
      Identificacion: usuarioExistente.Identificacion,
       id_tipousuario: usuarioExistente.id_tipousuario,
       Nombre1: nombrePersona, // Agregamos el nombre de la persona a la respuesta
    });
    console.log(usuarioExistente.persona);

  } catch (error) {
    res.status(500).json({ message: "Error al realizar el inicio de sesión" });
  }
};




//Editar
export const editarusuario = async (req, res) => {
  if (!req.body.usuario) {
    res.status(400).json({ message: "campos son requeridos" });
  }
  const usuario = await usuarioModelo.findOne({ where: { id: req.params.id } });
  if (usuario) {
    usuario.set(req.body);
    await tipo.save();
    res.status(200).json({ message: "usuario   modificado correctamente" });
  } else {
    res.status(404).json({ message: "usuario no encontrado" });
  }
};

//eliminar
export const cambiarestadousuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por su ID
    const usuario = await usuarioModelo.findOne({
      where: { id },
    });

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Cambiar el estado del usuario
    usuario.estado = !usuario.estado;
    await usuario.save();

    // Obtener la instancia de persona asociada al usuario
    const persona = await personaModelo.findOne({
      where: { id: usuario.id_persona },
    });

    // Verificar si la persona existe
    if (!persona) {
      return res.status(404).json({ message: "Persona no encontrada" });
    }

    // Cambiar el estado de la persona (suponiendo que también tiene una propiedad 'estado')
    persona.estado = !persona.estado;
    await persona.save();

    res.status(200).json({ message: "Estado del usuario y persona cambiados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar el estado del usuario y persona" });
  }
};





export const eliminarusuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por su ID incluyendo la relación con personamodelo
    const usuario = await usuarioModelo.findOne({
      where: { id },
      include: [{ model: personaModelo, as: 'persona' }],
    });

    // Verificar si el usuario existe
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario y su relación con personamodelo
    await usuario.destroy();

    // Eliminar también la persona asociada
    if (usuario.persona) {
      await personaModelo.destroy({
        where: { id: usuario.persona.id },
      });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

