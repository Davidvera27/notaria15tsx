import { Router, Request, Response } from 'express';
import db from '../database/db';

const router = Router();

// Tipos
interface CaseRent {
  id?: number; // Hacer opcional para adaptarlo a las respuestas de las consultas
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: string;
  observaciones?: string;
}

// CREATE
router.post('/case-rents', (req: Request, res: Response) => {
  const { creation_date, document_date, escritura, radicado, protocolista, observaciones }: CaseRent = req.body;
  const last_modified = new Date().toISOString();
  const currentDate = new Date().toISOString().split('T')[0];

  if (!/^[0-9]{1,5}$/.test(escritura)) {
    return res.status(400).json({ error: 'La escritura debe ser un número de hasta 5 dígitos sin caracteres especiales o letras.' });
  }

  if (creation_date > currentDate || document_date > currentDate) {
    return res.status(400).json({ error: 'Las fechas no son válidas.' });
  }

  const radicadoQuery = 'SELECT id, protocolista FROM case_rents WHERE radicado = ?';
  db.get<Pick<CaseRent, 'id' | 'protocolista'>>(radicadoQuery, [radicado], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar el radicado.' });
    }
    if (row) {
      return res.status(400).json({
        error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
      });
    }

    const escrituraQuery = 'SELECT id, protocolista FROM case_rents WHERE escritura = ? AND document_date = ?';
    db.get<Pick<CaseRent, 'id' | 'protocolista'>>(escrituraQuery, [escritura, document_date], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error al verificar la escritura y la fecha del documento.' });
      }
      if (row) {
        return res.status(400).json({
          error: `La escritura ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
        });
      }

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
router.get('/case-rents', (_req: Request, res: Response) => {
  const query = 'SELECT * FROM case_rents';
  db.all<CaseRent[]>(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// UPDATE
router.put('/case-rents/:id', (req: Request, res: Response) => {
  const { id } = req.params; // ID de la fila que se está editando
  const { radicado, escritura, document_date, protocolista, observaciones }: Partial<CaseRent> = req.body;
  const last_modified = new Date().toISOString();

  // Paso 1: Obtener los datos actuales de la fila
  const currentQuery = 'SELECT * FROM case_rents WHERE id = ?';
  db.get<CaseRent>(currentQuery, [id], (err, currentRow) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los datos actuales del registro.' });
    }

    if (!currentRow) {
      return res.status(404).json({ error: 'El registro no existe.' });
    }

    // Paso 2: Mezclar los datos actuales con los datos enviados por el usuario
    const updatedData: CaseRent = {
      creation_date: currentRow.creation_date, // No se actualiza en este endpoint
      document_date: document_date || currentRow.document_date,
      escritura: escritura || currentRow.escritura,
      radicado: radicado || currentRow.radicado,
      protocolista: protocolista || currentRow.protocolista,
      observaciones: observaciones !== undefined ? observaciones : currentRow.observaciones,
    };

    // Paso 3: Validar duplicado de "radicado", excluyendo la fila actual
    const radicadoQuery = 'SELECT id, protocolista FROM case_rents WHERE radicado = ? AND id != ?';
    db.get<Pick<CaseRent, 'id' | 'protocolista'>>(radicadoQuery, [updatedData.radicado, id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Error al verificar el radicado.' });
      }
      if (row) {
        return res.status(400).json({
          error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
        });
      }

      // Paso 4: Validar duplicado de "escritura" + "fecha del documento", excluyendo la fila actual
      const escrituraQuery = 'SELECT id, protocolista FROM case_rents WHERE escritura = ? AND document_date = ? AND id != ?';
      db.get<Pick<CaseRent, 'id' | 'protocolista'>>(escrituraQuery, [updatedData.escritura, updatedData.document_date, id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Error al verificar la escritura y la fecha del documento.' });
        }
        if (row) {
          return res.status(400).json({
            error: `La escritura ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
          });
        }

        // Paso 5: Realizar la actualización con los datos actualizados
        const updateQuery = `
          UPDATE case_rents
          SET escritura = ?, document_date = ?, radicado = ?, protocolista = ?, observaciones = ?, last_modified = ?
          WHERE id = ?
        `;
        db.run(
          updateQuery,
          [
            updatedData.escritura,
            updatedData.document_date,
            updatedData.radicado,
            updatedData.protocolista,
            updatedData.observaciones,
            last_modified,
            id,
          ],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Error al actualizar el registro.' });
            }
            res.json({ success: true, updatedRows: this.changes });
          }
        );
      });
    });
  });
});


// DELETE
router.delete('/case-rents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const query = 'DELETE FROM case_rents WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deletedRows: this.changes });
  });
});

export default router;
