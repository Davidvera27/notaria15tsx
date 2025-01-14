import express from 'express';
import db from '../database/db';
import bcrypt from "bcrypt"
const router = express.Router();

interface Protocolist {
  id: number;
  creation_date: string;
  complete_name: string;
  last_name: string;
  email: string;
  observations: string | null;
  ongoing_case: number;
  password:string
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
  const { complete_name, last_name, email, observations , password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!complete_name || !last_name || !email) {
    return res.status(400).json({ error: 'Los campos nombre completo, apellidos y correo son obligatorios.' });
  }

  // Validar correo único
  const emailCheckQuery = 'SELECT COUNT(*) as count FROM protocolist_rents WHERE email = ?';
  db.get<{ count: number }>(emailCheckQuery, [email], (emailErr, row) => {
    if (emailErr) {
      console.error('Error al verificar el correo:', emailErr.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (row?.count > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Insertar nuevo registro si el correo es único
    const insertQuery = `
      INSERT INTO protocolist_rents (complete_name, last_name, email, hashedPassword, observations)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(insertQuery, [complete_name, last_name, email, password, observations || null], function (insertErr) {
      if (insertErr) {
        console.error('Error al insertar protocolo:', insertErr.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(201).json({ id: this.lastID, message: 'Protocolo creado con éxito' });
    });
  });
});

// Actualizar un protocolista
router.put('/protocolist-rents/:id', async (req, res) => {
  const { id } = req.params;
  const { complete_name, last_name, email, observations , password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  if (!complete_name || !last_name || !email) {
    return res.status(400).json({ error: 'Los campos nombre completo, apellidos y correo son obligatorios.' });
  }

  // Validar que el correo no esté en uso por otro protocolista
  const emailCheckQuery = 'SELECT COUNT(*) as count FROM protocolist_rents WHERE email = ? AND id != ?';
  db.get<{ count: number }>(emailCheckQuery, [email, id], (emailErr, row) => {
    if (emailErr) {
      console.error('Error al verificar el correo:', emailErr.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (row?.count > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro usuario.' });
    }

    // Actualizar registro si el correo es válido
    const updateQuery = `
      UPDATE protocolist_rents
      SET complete_name = ?, last_name = ?, email = ?, observations = ?
      WHERE id = ?
    `;
    db.run(updateQuery, [complete_name, last_name, email,hashedPassword, observations || null, id], (updateErr) => {
      if (updateErr) {
        console.error('Error al actualizar protocolo:', updateErr.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json({ message: 'Protocolo actualizado con éxito' });
    });
  });
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



// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
  }

  try {
    const database = await db;
    const user = await database.get(
      "SELECT * FROM protocolist_rents WHERE email = ?",
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

   
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor", error });
  }
});
export default router;
