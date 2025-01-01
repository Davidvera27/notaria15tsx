import express from 'express';
import db from '../database/db';

const router = express.Router();

type Protocolist = {
  id: number;
  complete_name: string;
  last_name: string;
  email: string;
  observations?: string | null;
};

// Ruta unificada para actualizar los casos activos y obtener todos los protocolistas
router.get("/protocolist-rents", (req, res) => {
  const updateOngoingCasesQuery = `
    UPDATE protocolist_rents
    SET ongoing_case = (
      SELECT COUNT(*)
      FROM case_rents
      WHERE case_rents.protocolista = protocolist_rents.id
    )
  `;

  // Actualizar los casos activos
  db.run(updateOngoingCasesQuery, [], (updateErr) => {
    if (updateErr) {
      console.error("Error al actualizar los casos activos:", updateErr.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    // Obtener todos los protocolistas después de actualizar los casos activos
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

    db.all(selectQuery, [], (err, rows) => {
      if (err) {
        console.error("Error al obtener los protocolistas:", err.message);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.json(rows);
    });
  });
});

// Crear un nuevo protocolista
router.post('/protocolist-rents', (req, res) => {
  const { complete_name, last_name, email, observations } = req.body;

  // Validaciones
  if (!complete_name || complete_name.length < 3 || complete_name.length > 50) {
    return res.status(400).json({ error: 'El nombre debe tener entre 3 y 50 caracteres' });
  }
  if (!last_name || last_name.length < 3 || last_name.length > 50) {
    return res.status(400).json({ error: 'Los apellidos deben tener entre 3 y 50 caracteres' });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correo electrónico no es válido' });
  }

  db.run(
    'INSERT INTO protocolist_rents (complete_name, last_name, email, observations) VALUES (?, ?, ?, ?)',
    [complete_name, last_name, email, observations || null],
    function (err) {
      if (err) {
        console.error('Error al crear el protocolista:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.status(201).json({ message: 'Protocolista creado con éxito', id: this.lastID });
    }
  );
});

// Actualizar un protocolista
router.put('/protocolist-rents/:id', (req, res) => {
  const { id } = req.params;
  const { complete_name, last_name, email, observations } = req.body;

  db.get<Protocolist>('SELECT * FROM protocolist_rents WHERE id = ?', [id], (err, protocolist) => {
    if (err) {
      console.error('Error al buscar el protocolista:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (!protocolist) {
      return res.status(404).json({ error: 'Protocolista no encontrado' });
    }

    db.run(
      'UPDATE protocolist_rents SET complete_name = ?, last_name = ?, email = ?, observations = ? WHERE id = ?',
      [
        complete_name || protocolist.complete_name,
        last_name || protocolist.last_name,
        email || protocolist.email,
        observations || protocolist.observations,
        id,
      ],
      (err) => {
        if (err) {
          console.error('Error al actualizar el protocolista:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        res.json({ message: 'Protocolista actualizado con éxito' });
      }
    );
  });
});

// Endpoint para actualizar los casos activos
router.put("/protocolist-rents/update-cases", (req, res) => {
  const updateQuery = `
    UPDATE protocolist_rents
    SET ongoing_case = (
      SELECT COUNT(*)
      FROM case_rents
      WHERE case_rents.protocolista = protocolist_rents.id
    )
  `;

  db.run(updateQuery, [], (err) => {
    if (err) {
      console.error("Error al actualizar los casos activos:", err.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json({ message: "Casos activos actualizados con éxito" });
  });
});
// Eliminar un protocolista
router.delete('/protocolist-rents/:id', (req, res) => {
  const { id } = req.params;

  db.get<Protocolist>('SELECT * FROM protocolist_rents WHERE id = ?', [id], (err, protocolist) => {
    if (err) {
      console.error('Error al buscar el protocolista:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (!protocolist) {
      return res.status(404).json({ error: 'Protocolista no encontrado' });
    }

    db.run('DELETE FROM protocolist_rents WHERE id = ?', [id], (err) => {
      if (err) {
        console.error('Error al eliminar el protocolista:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json({ message: 'Protocolista eliminado con éxito' });
    });
  });
});

export default router;
