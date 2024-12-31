const express = require('express');
const db = require('../database/db');
const router = express.Router();

// CREATE
router.post('/case-rents', (req, res) => {
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones } = req.body;
    const last_modified = new Date().toISOString();

    const currentDate = new Date().toISOString().split("T")[0]; // Fecha actual (YYYY-MM-DD)

    // Validación 1: Verificar si escritura cumple con el formato
    if (!/^[0-9]{1,5}$/.test(escritura)) {
        return res.status(400).json({ error: "La escritura debe ser un número de hasta 5 dígitos sin caracteres especiales o letras." });
    }

    // Validación 2: Verificar si las fechas son válidas
    if (creation_date > currentDate) {
        return res.status(400).json({ error: "La fecha de creación no es válida." });
    }
    if (document_date > currentDate) {
        return res.status(400).json({ error: "La fecha del documento no es válida." });
    }

    // Validación 3: Verificar si el radicado ya existe
    const radicadoQuery = 'SELECT id, protocolista FROM case_rents WHERE radicado = ?';
    db.get(radicadoQuery, [radicado], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Error al verificar el radicado." });
        }
        if (row) {
            return res.status(400).json({
                error: `El radicado que intenta agregar, ya existe y se encuentra creado en la fila ${row.id} y corresponde al protocolista ${row.protocolista}.`,
            });
        }

        // Validación 4: Verificar si escritura y fecha del documento ya existen
        const escrituraQuery = 'SELECT id, protocolista FROM case_rents WHERE escritura = ? AND document_date = ?';
        db.get(escrituraQuery, [escritura, document_date], (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Error al verificar la escritura y la fecha del documento." });
            }
            if (row) {
                return res.status(400).json({
                    error: `La escritura que intenta agregar, ya existe y se encuentra creada en la fila ${row.id} y corresponde al protocolista ${row.protocolista}.`,
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
        const escrituraQuery = 'SELECT id, protocolista FROM case_rents WHERE escritura = ? AND document_date = ?';
        db.get(escrituraQuery, [escritura, document_date], (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Error al verificar la escritura y la fecha del documento." });
            }
            if (row) {
                return res.status(400).json({
                    error: `La escritura que intenta agregar, ya existe y se encuentra creada en la fila ${row.id} y corresponde al protocolista ${row.protocolista}.`,
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
