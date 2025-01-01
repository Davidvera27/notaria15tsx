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

// Obtener todos los protocolistas
router.get('/protocolist-rents', (req, res) => {
  db.all<Protocolist[]>('SELECT * FROM protocolist_rents', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener los protocolistas:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Verificar si un correo electrónico ya existe
router.get('/protocolist-rents/check-email/:email', (req, res) => {
  const { email } = req.params;
  db.get<{ count: number }>(
    'SELECT COUNT(*) AS count FROM protocolist_rents WHERE email = ?',
    [email],
    (err, row) => {
      if (err) {
        console.error('Error al verificar correo:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      res.json({ exists: row?.count > 0 });
    }
  );
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
