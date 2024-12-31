import { Router, Request, Response } from "express";
import db from "../database/db"; // Import database connection

const router = Router();

// CREATE a protocolist
router.post('/protocolist-rents', (req: Request, res: Response) => {
    const { complete_name, last_name, email, observations } = req.body;

    // Usar la fecha actual como valor predeterminado para creation_date
    const creation_date = new Date().toISOString();

    const query = `
        INSERT INTO protocolist_rents (complete_name, last_name, email, observations, creation_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [complete_name, last_name, email, observations || null, creation_date], function (err) {
        if (err) {
            console.error('Error while inserting into protocolist_rents:', err.message);
            return res.status(500).json({ error: 'Error al crear el protocolista', details: err.message });
        }

        res.status(201).json({ id: this.lastID });
    });
});



  
// READ all protocolists
router.get('/protocolist-rents', (req: Request, res: Response) => {
    const query = `SELECT id, complete_name, last_name, email, observations FROM protocolist_rents`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching protocolists:', err.message);
            // Asegúrate de que devuelves una sola respuesta
            return res.status(500).json({ error: 'Error al obtener los protocolistas', details: err.message });
        }

        // Devuelve la respuesta solo una vez
        res.status(200).json(rows);
    });
});


// UPDATE a protocolist
router.put("/protocolist-rents/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { complete_name, last_name, email, observations } = req.body;

  const query = `
    UPDATE protocolist_rents
    SET complete_name = ?, last_name = ?, email = ?, observations = ?
    WHERE id = ?
  `;
  db.run(query, [complete_name, last_name, email, observations || null, id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Error al actualizar el protocolista" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Protocolista no encontrado" });
    }
    res.status(200).json({ updatedRows: this.changes });
  });
});

// DELETE a protocolist
router.delete("/protocolist-rents/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const query = "DELETE FROM protocolist_rents WHERE id = ?";
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Error al eliminar el protocolista" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Protocolista no encontrado" });
    }
    res.status(200).json({ deletedRows: this.changes });
  });
});

export default router;
