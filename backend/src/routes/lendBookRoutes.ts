import { Router } from 'express';
import db from '../database/db';

const router = Router();

// Búsqueda por escritura
router.get('/records/:deedNumber', (req, res) => {
  const { deedNumber } = req.params;

  if (!deedNumber) {
    return res.status(400).json({ message: 'Número de escritura es obligatorio.' });
  }

  const query = `
    SELECT * FROM records
    WHERE ? BETWEEN initial_deed AND final_deed
  `;

  // Convert deedNumber to an integer before passing it to the query
  const deedNumberInt = parseInt(deedNumber, 10);

  if (isNaN(deedNumberInt)) {
    return res.status(400).json({ message: 'El número de escritura debe ser un número válido.' });
  }

  db.all(query, [deedNumberInt], (err, rows) => {
    if (err) {
      console.error('Error al buscar registros:', err.message);
      return res.status(500).json({ message: 'Error del servidor al buscar registros.' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros para el número de escritura proporcionado.' });
    }

    return res.status(200).json(rows);
  });
});

// Marcar un libro como prestado
router.patch('/records/lend/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    UPDATE records
    SET borrowed_book = 1
    WHERE id = ?
  `;

  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error al prestar libro:', err.message);
      return res.status(500).json({ message: 'Error del servidor al actualizar el libro.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Registro no encontrado.' });
    }

    return res.status(200).json({ message: 'Libro prestado exitosamente.' });
  });
});

export default router;