import express from "express";
import db from "../database/db";

const router = express.Router();

interface Case {
  id: number;
  creation_date: string;
  document_date: string;
  escritura: string;
  radicado: string;
  protocolista: number;
  protocolista_name?: string;
  protocolista_last_name?: string;
  protocolista_email?: string;
  observaciones?: string;
  last_modified: string;
  status: string;
}


// Validar si el radicado o escritura ya existen
const validateDuplicates = async (
  radicado: string,
  escritura: string,
  document_date: string,
  id: number | null = null
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const queries = [
      {
        query: "SELECT id FROM case_rents WHERE radicado = ? AND id != ?",
        params: [radicado, id],
      },
      {
        query: "SELECT id FROM case_rents WHERE escritura = ? AND document_date = ? AND id != ?",
        params: [escritura, document_date, id],
      },
    ];

    let hasDuplicates = false;

    queries.forEach(({ query, params }, index) => {
      db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        }
        if (row) {
          hasDuplicates = true;
        }

        if (index === queries.length - 1) {
          resolve(hasDuplicates);
        }
      });
    });
  });
};

// Obtener todos los casos finalizados
router.get("/case-rents-finished", async (_req, res) => {
  try {
    const query = `
      SELECT 
        cr.id,
        cr.creation_date,
        cr.document_date,
        cr.escritura,
        cr.radicado,
        cr.protocolista AS protocolista_id,
        pr.complete_name AS protocolista_name,
        pr.last_name AS protocolista_last_name,
        pr.email AS protocolista_email,
        cr.observaciones,
        cr.last_modified
      FROM case_rents cr
      LEFT JOIN protocolist_rents pr ON cr.protocolista = pr.id
      WHERE cr.status = 'finished'
    `;
    db.all(query, [], (err, rows: Case[]) => {
      if (err) {
        console.error("Error fetching finished cases:", err);
        return res.status(500).json({ error: "Error fetching finished cases" });
      }
      res.json(
        rows.map((row) => ({
          ...row,
          protocolista_name: row.protocolista_name || "Desconocido",
          protocolista_last_name: row.protocolista_last_name || "Desconocido",
          protocolista_email: row.protocolista_email || "Desconocido",
        }))
      );
    });
  } catch (error) {
    console.error("Error fetching finished cases:", error);
    res.status(500).json({ error: "Error fetching finished cases" });
  }
});

// Crear un caso finalizado (se utiliza para nuevos casos con estado 'finished')
router.post("/case-rents-finished", async (req, res) => {
  const {
    creation_date,
    document_date,
    escritura,
    radicado,
    protocolista,
    observaciones,
  } = req.body;
  const last_modified = new Date().toISOString();

  try {
    const hasDuplicates = await validateDuplicates(radicado, escritura, document_date);

    if (hasDuplicates) {
      return res.status(400).json({ error: "El radicado o la escritura ya existen." });
    }

    const query = `INSERT INTO case_rents (
      creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'finished')`;

    db.run(
      query,
      [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified],
      function (err) {
        if (err) {
          console.error("Error al agregar caso finalizado:", err);
          return res.status(500).json({ error: "Error al agregar caso finalizado" });
        }
        res.status(200).json({ id: this.lastID });
      }
    );
  } catch (error) {
    console.error("Error al agregar caso finalizado:", error);
    res.status(500).json({ error: "Error al agregar caso finalizado" });
  }
});

// Actualizar un caso finalizado
router.put("/case-rents-finished/:id", async (req, res) => {
  const { id } = req.params;
  const {
    creation_date,
    document_date,
    escritura,
    radicado,
    protocolista,
    observaciones,
  } = req.body;
  const last_modified = new Date().toISOString();

  try {
    const hasDuplicates = await validateDuplicates(radicado, escritura, document_date, Number(id));

    if (hasDuplicates) {
      return res.status(400).json({ error: "El radicado o la escritura ya existen." });
    }

    const query = `
      UPDATE case_rents
      SET creation_date = ?, document_date = ?, escritura = ?, radicado = ?, protocolista = ?, observaciones = ?, last_modified = ?, status = 'finished'
      WHERE id = ?`;

    db.run(
      query,
      [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified, id],
      function (err) {
        if (err) {
          console.error("Error al actualizar caso finalizado:", err);
          return res.status(500).json({ error: "Error al actualizar caso finalizado" });
        }
        res.status(200).json({ updatedRows: this.changes });
      }
    );
  } catch (error) {
    console.error("Error al actualizar caso finalizado:", error);
    res.status(500).json({ error: "Error al actualizar caso finalizado" });
  }
});

// Enviar correo sin mover casos
router.post("/case-rents-finished/send-email", async (req, res) => {
  const { id } = req.body;

  try {
    const query = `
      SELECT 
        cr.id,
        cr.escritura,
        cr.radicado,
        cr.document_date,
        pr.complete_name AS protocolista_name,
        pr.last_name AS protocolista_last_name,
        pr.email AS protocolista_email
      FROM case_rents cr
      LEFT JOIN protocolist_rents pr ON cr.protocolista = pr.id
      WHERE cr.id = ? AND cr.status = 'finished'`;

    db.get(query, [id], (err, row: Case) => {
      if (err) {
        console.error("Error fetching case for email:", err);
        return res.status(500).json({ error: "Error fetching case for email" });
      }

      if (!row) {
        return res.status(404).json({ error: "Caso no encontrado" });
      }

      console.log(`Correo enviado a ${row.protocolista_email}:
        Estimado(a) ${row.protocolista_name} ${row.protocolista_last_name},
        Se le informa sobre un caso finalizado:
        - Número de escritura: ${row.escritura}
        - Número de radicado: ${row.radicado}
        - Fecha del documento: ${row.document_date}
      `);

      res.status(200).json({ message: "Correo enviado correctamente" });
    });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ error: "Error al enviar correo" });
  }
});

// Eliminar un caso finalizado
router.delete("/case-rents-finished/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM case_rents WHERE id = ? AND status = 'finished'`;
    db.run(query, [id], function (err) {
      if (err) {
        console.error("Error al eliminar caso finalizado:", err);
        return res.status(500).json({ error: "Error al eliminar caso finalizado" });
      }
      res.status(200).json({ message: "Caso eliminado correctamente" });
    });
  } catch (error) {
    console.error("Error al eliminar caso finalizado:", error);
    res.status(500).json({ error: "Error al eliminar caso finalizado" });
  }
});

export default router;
