const express = require('express');
const db = require('../database/db');
const router = express.Router();

// CREATE
router.post('/case-rents', (req, res) => {
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones } = req.body;
    const last_modified = new Date().toISOString();
    const query = `
        INSERT INTO case_rents (creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
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
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones } = req.body;
    const last_modified = new Date().toISOString();
    const query = `
        UPDATE case_rents
        SET creation_date = ?, document_date = ?, escritura = ?, radicado = ?, protocolista = ?, observaciones = ?, last_modified = ?
        WHERE id = ?
    `;
    db.run(query, [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updatedRows: this.changes });
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
