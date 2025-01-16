import { Router, Request, Response } from "express";
import db from "../database/db";

const router = Router();

// Tipos
interface CaseRent {
  id?: number; // Opcional para adaptarse a las consultas
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: string;
  observaciones?: string;
  last_modified?: string;
}

type RadicadoValidationResult = {
  id: number;
  protocolista_name: string;
  protocolista_last_name: string;
};

// CREATE
router.post("/case-rents", (req: Request, res: Response) => {
  const {
    creation_date,
    document_date,
    escritura,
    radicado,
    protocolista,
    observaciones,
  }: CaseRent = req.body;
  const last_modified = new Date().toISOString();
  const currentDate = new Date().toISOString().split("T")[0];

  if (!/^[0-9]{1,5}$/.test(escritura)) {
    return res.status(400).json({
      error:
        "La escritura debe ser un número de hasta 5 dígitos sin caracteres especiales o letras.",
    });
  }

  if (creation_date > currentDate || document_date > currentDate) {
    return res.status(400).json({ error: "Las fechas no son válidas." });
  }

  const radicadoQuery = `
    SELECT cr.id, pr.complete_name AS protocolista_name, pr.last_name AS protocolista_last_name
    FROM case_rents cr
    JOIN protocolist_rents pr ON cr.protocolista = pr.id
    WHERE cr.radicado = ?`;

  db.get<RadicadoValidationResult>(
    radicadoQuery,
    [radicado],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al verificar el radicado." });
      }
      if (row) {
        return res.status(400).json({
          error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista_name} ${row.protocolista_last_name}.`,
        });
      }

      const escrituraQuery = `
        SELECT cr.id, pr.complete_name AS protocolista_name, pr.last_name AS protocolista_last_name
        FROM case_rents cr
        JOIN protocolist_rents pr ON cr.protocolista = pr.id
        WHERE cr.escritura = ? AND cr.document_date = ?`;

      db.get<RadicadoValidationResult>(
        escrituraQuery,
        [escritura, document_date],
        (err, row) => {
          if (err) {
            return res.status(500).json({
              error:
                "Error al verificar la escritura y la fecha del documento.",
            });
          }
          if (row) {
            return res.status(400).json({
              error: `La escritura ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista_name} ${row.protocolista_last_name}.`,
            });
          }

          const insertQuery = `
            INSERT INTO case_rents (
              creation_date,
              document_date,
              escritura,
              radicado,
              protocolista,
              observaciones,
              last_modified
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

          db.run(
            insertQuery,
            [
              creation_date,
              document_date,
              escritura,
              radicado,
              protocolista,
              observaciones,
              last_modified,
            ],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.status(201).json({ id: this.lastID });
            }
          );
        }
      );
    }
  );
});

// READ
router.get("/case-rents", (_req: Request, res: Response) => {
  const query = "SELECT * FROM case_rents";
  db.all<CaseRent[]>(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// UPDATE
router.put("/case-rents/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    radicado,
    escritura,
    document_date,
    protocolista,
    observaciones,
  }: Partial<CaseRent> = req.body;
  const last_modified = new Date().toISOString();

  const currentQuery = "SELECT * FROM case_rents WHERE id = ?";
  db.get<CaseRent>(currentQuery, [id], (err, currentRow) => {
    if (err) {
      return res.status(500).json({
        error: "Error al obtener los datos actuales del registro.",
      });
    }

    if (!currentRow) {
      return res.status(404).json({ error: "El registro no existe." });
    }

    const updatedData: CaseRent = {
      creation_date: currentRow.creation_date,
      document_date: document_date || currentRow.document_date,
      escritura: escritura || currentRow.escritura,
      radicado: radicado || currentRow.radicado,
      protocolista: protocolista || currentRow.protocolista,
      observaciones:
        observaciones !== undefined ? observaciones : currentRow.observaciones,
    };

    const radicadoQuery =
      "SELECT id, protocolista FROM case_rents WHERE radicado = ? AND id != ?";
    db.get<Pick<CaseRent, "id" | "protocolista">>(
      radicadoQuery,
      [updatedData.radicado, id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: "Error al verificar el radicado." });
        }
        if (row) {
          return res.status(400).json({
            error: `El radicado ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
          });
        }

        const escrituraQuery =
          "SELECT id, protocolista FROM case_rents WHERE escritura = ? AND document_date = ? AND id != ?";
        db.get<Pick<CaseRent, "id" | "protocolista">>(
          escrituraQuery,
          [updatedData.escritura, updatedData.document_date, id],
          (err, row) => {
            if (err) {
              return res.status(500).json({
                error:
                  "Error al verificar la escritura y la fecha del documento.",
              });
            }
            if (row) {
              return res.status(400).json({
                error: `La escritura ya existe en la fila ${row.id} y pertenece al protocolista ${row.protocolista}.`,
              });
            }

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
                  return res.status(500).json({
                    error: "Error al actualizar el registro.",
                  });
                }
                res.json({ success: true, updatedRows: this.changes });
              }
            );
          }
        );
      }
    );
  });
});

// DELETE
router.delete("/case-rents/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const query = "DELETE FROM case_rents WHERE id = ?";
  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deletedRows: this.changes });
  });
});

// MOVE TO FINISHED
router.post("/move-to-finished/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const selectQuery = `
    SELECT * FROM case_rents
    WHERE id = ? AND status = "in_progress"`;

  db.get<CaseRent>(selectQuery, [id], (err, caseToMove) => {
    if (err) {
      console.error("Error al obtener el caso:", err);
      return res.status(500).json({ error: "Error al obtener el caso." });
    }

    if (!caseToMove) {
      return res.status(404).json({
        error: "Caso no encontrado o ya finalizado.",
      });
    }

    const insertQuery = `
      INSERT INTO case_rents_finished (
        id,
        creation_date,
        document_date,
        escritura,
        radicado,
        protocolista,
        observaciones,
        last_modified,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'finished')`;

    db.run(
      insertQuery,
      [
        caseToMove.id,
        caseToMove.creation_date,
        caseToMove.document_date,
        caseToMove.escritura,
        caseToMove.radicado,
        caseToMove.protocolista,
        caseToMove.observaciones,
        new Date().toISOString(),
      ],
      (err) => {
        if (err) {
          console.error("Error al mover el caso a finalizados:", err);
          return res.status(500).json({
            error: "Error al mover el caso a finalizados.",
          });
        }

        const deleteQuery = "DELETE FROM case_rents WHERE id = ?";
        db.run(deleteQuery, [id], (err) => {
          if (err) {
            console.error("Error al eliminar el caso:", err);
            return res.status(500).json({
              error: "Error al eliminar el caso de la tabla original.",
            });
          }
          res.status(200).json({
            message: "Caso movido a finalizados con éxito.",
          });
        });
      }
    );
  });
});

export default router;