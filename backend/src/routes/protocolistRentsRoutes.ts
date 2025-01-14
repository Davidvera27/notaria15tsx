import express from 'express';
import db from '../database/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();
const SECRET_KEY = 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
interface Protocolist {
  id: number;
  creation_date: string;
  complete_name: string;
  last_name: string;
  email: string;
  observations: string | null;
  ongoing_case: number;
  password: string;
}

// Obtener todos los protocolistas y actualizar casos activos
router.get('/protocolist-rents', (req, res) => {
  const updateOngoingCasesQuery = `
    UPDATE protocolist_rents
    SET ongoing_case = (
      SELECT COUNT(*)
      FROM case_rents
      WHERE case_rents.protocolista = protocolist_rents.id
    )
  `;

  db.run(updateOngoingCasesQuery, [], (updateErr) => {
    if (updateErr) {
      console.error('Error al actualizar los casos activos:', updateErr.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const selectQuery = `
      SELECT
          id,
          creation_date,
          complete_name,
          last_name,
          email,
          observations,
          ongoing_case
      FROM protocolist_rents
    `;

    db.all<Protocolist[]>(selectQuery, [], (err, rows) => {
      if (err) {
        console.error('Error al obtener los protocolistas:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json(rows);
    });
  });
});

// Crear un nuevo protocolista con validación de correo único
router.post('/protocolist-rents', async (req, res) => {
  const { complete_name, last_name, email, observations, password } = req.body;

  if (!complete_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre completo, apellidos, correo y contraseña.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const emailCheckQuery = 'SELECT COUNT(*) as count FROM protocolist_rents WHERE email = ?';
    db.get<{ count: number }>(emailCheckQuery, [email], (emailErr, row) => {
      if (emailErr) {
        console.error('Error al verificar el correo:', emailErr.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (row?.count > 0) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      }

      const insertQuery = `
        INSERT INTO protocolist_rents (complete_name, last_name, email, password, observations)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(insertQuery, [complete_name, last_name, email, hashedPassword, observations || null], function (insertErr) {
        if (insertErr) {
          console.error('Error al insertar protocolo:', insertErr.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.status(201).json({ id: this.lastID, message: 'Protocolo creado con éxito' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
});

// Actualizar un protocolista
router.put('/protocolist-rents/:id', async (req, res) => {
  const { id } = req.params;
  const { complete_name, last_name, email, observations, password } = req.body;

  if (!complete_name || !last_name || !email) {
    return res.status(400).json({ error: 'Los campos nombre completo, apellidos y correo son obligatorios.' });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const emailCheckQuery = 'SELECT COUNT(*) as count FROM protocolist_rents WHERE email = ? AND id != ?';
    db.get<{ count: number }>(emailCheckQuery, [email, id], (emailErr, row) => {
      if (emailErr) {
        console.error('Error al verificar el correo:', emailErr.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (row?.count > 0) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
      }

      const updateQuery = `
        UPDATE protocolist_rents
        SET complete_name = ?, last_name = ?, email = ?, observations = ?, password = COALESCE(?, password)
        WHERE id = ?
      `;
      db.run(updateQuery, [complete_name, last_name, email, observations || null, hashedPassword, id], (updateErr) => {
        if (updateErr) {
          console.error('Error al actualizar protocolo:', updateErr.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Protocolo actualizado con éxito' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor', details: error });
  }
});

// Eliminar un protocolista
router.delete('/protocolist-rents/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM protocolist_rents WHERE id = ?';
  db.run(deleteQuery, [id], (deleteErr) => {
    if (deleteErr) {
      console.error('Error al eliminar protocolo:', deleteErr.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json({ message: 'Protocolo eliminado con éxito' });
  });
});

// Login de protocolistas
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const selectQuery = 'SELECT * FROM protocolist_rents WHERE email = ?';
  db.get<Protocolist>(selectQuery, [email], async (err, user) => {
    if (err) {
      console.error('Error al buscar usuario:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '8h' });

    res.json({ 
      message: 'Inicio de sesión exitoso', 
      token, 
      user: { id: user.id, email: user.email, complete_name: user.complete_name } 
    });
  });
});

// Obtener perfil de un protocolista
router.get('/profile', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación no proporcionado.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('Error al verificar el token:', err.message);
      return res.status(401).json({ error: 'Token no válido o expirado.' });
    }

    const { id } = decoded as { id: number };

    const selectQuery = 'SELECT id, complete_name, last_name, email, observations, ongoing_case FROM protocolist_rents WHERE id = ?';
    db.get<Protocolist>(selectQuery, [id], (selectErr, user) => {
      if (selectErr) {
        console.error('Error al obtener el perfil:', selectErr.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      res.json({ user });
    });
  });
});

export default router;
