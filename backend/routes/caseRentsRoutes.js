const express = require('express');
const db = require('../database/db');
const router = express.Router();

// CREATE
router.post('/case-rents', (req, res) => {
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones } = req.body;
    const last_modified = new Date().toISOString();

    // Validación 1: Verificar si el radicado ya existe
    const radicadoQuery = 'SELECT id, protocolista FROM case_rents WHERE radicado = ?';
    db.get(radicadoQuery, [radicado], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error al verificar el radicado." });
        }
        if (row) {
            return res.status(400).json({
                error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
            });
        }

        // Validación 2: Verificar si escritura y fecha del documento ya existen
        const escrituraQuery = 'SELECT id FROM case_rents WHERE escritura = ? AND document_date = ?';
        db.get(escrituraQuery, [escritura, document_date], (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Error al verificar la escritura y la fecha del documento." });
            }
            if (row) {
                return res.status(400).json({
                    error: "La combinación de escritura y fecha del documento ya existe.",
                });
            }

            // Si pasa las validaciones, insertar el registro
            const insertQuery = `
                INSERT INTO case_rents (creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(insertQuery, [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ id: this.lastID });
            });
        });
    });
});

// READ
router.get('/case-rents', (req, res) => {
    const query = 'SELECT * FROM case_rents';
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// UPDATE
router.put('/case-rents/:id', (req, res) => {
    const { id } = req.params;
    const { radicado, escritura, document_date } = req.body; // Extraemos los campos necesarios
    const last_modified = new Date().toISOString();

    // Validación 1: Verificar duplicado de radicado
    const radicadoQuery = 'SELECT id, protocolista FROM case_rents WHERE radicado = ? AND id != ?';
    db.get(radicadoQuery, [radicado, id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error al verificar el radicado." });
        }
        if (row) {
            return res.status(400).json({
                error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
            });
        }

        // Validación 2: Verificar duplicado de escritura + fecha del documento
        const escrituraQuery = `
            SELECT id, protocolista FROM case_rents 
            WHERE escritura = ? AND document_date = ? AND id != ?`;
        db.get(escrituraQuery, [escritura, document_date, id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Error al verificar escritura y fecha del documento." });
            }
            if (row) {
                return res.status(400).json({
                    error: `La combinación de escritura ${escritura} y fecha del documento ${document_date} ya existe en la fila ${row.id} con el protocolista ${row.protocolista}.`,
                });
            }

            // Si pasa las validaciones, proceder con la actualización
            const fields = req.body;
            const setClause = Object.keys(fields)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(fields), last_modified, id];

            const updateQuery = `
                UPDATE case_rents
                SET ${setClause}, last_modified = ?
                WHERE id = ?`;

            db.run(updateQuery, values, function (err) {
                if (err) {
                    return res.status(500).json({ error: "Error al actualizar el registro." });
                }
                res.json({ success: true, updatedRows: this.changes });
            });
        });
    });
});


  

// DELETE
router.delete('/case-rents/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM case_rents WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedRows: this.changes });
    });
});

module.exports = router;
