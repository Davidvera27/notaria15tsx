import { Router } from "express";
import db from "../database/db";

const router = Router();

// Fetch all records
router.get("/records", (req, res) => {
  const query = `
    SELECT * FROM records
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all records:", err.message);
      return res.status(500).json({ message: "Error del servidor al obtener los registros." });
    }

    return res.status(200).json(rows);
  });
});

// Get all borrowed books
router.get('/records/borrowed', (req, res) => {
    const query = `
      SELECT * FROM records
      WHERE borrowed_book = 1
    `;
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error al obtener libros prestados:', err.message);
        return res.status(500).json({ message: 'Error del servidor al obtener libros prestados.' });
      }
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron libros prestados.' });
      }
  
      return res.status(200).json(rows);
    });
  });
  

export default router;