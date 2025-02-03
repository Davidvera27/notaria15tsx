import { Router, Request, Response } from "express";
import db from "../database/db";

const router = Router();

interface Record {
  volume: string;
  book: string;
  initial_deed: string;
  final_deed: string;
  fol: string;
  month: string;
  creation_date: string;
  first_acto: string;
  first_grantor: string;
  first_receiver: string;
  first_acto_date: string;
  second_acto: string;
  second_grantor: string;
  second_receiver: string;
  second_acto_date: string;
}

// CREATE RECORD
router.post("/create-record", (req: Request, res: Response) => {
  const {
    volume,
    book,
    initial_deed,
    final_deed,
    fol,
    month,
    creation_date,
    first_acto,
    first_grantor,
    first_receiver,
    first_acto_date,
    second_acto,
    second_grantor,
    second_receiver,
    second_acto_date,
  }: Record = req.body;

  const currentDate = new Date().toISOString().split("T")[0];

  // Date validations
  if (new Date(first_acto_date) >= new Date(second_acto_date)) {
    return res.status(400).json({
      error: "La fecha del primer acto debe ser anterior a la fecha del segundo acto.",
    });
  }
  if (new Date(creation_date) > new Date(currentDate)) {
    return res.status(400).json({
      error: "La fecha de creación no puede ser futura.",
    });
  }

  // Deed validations
  if (!/^[0-9]{1,5}$/.test(initial_deed) || !/^[0-9]{1,5}$/.test(final_deed)) {
    return res.status(400).json({
      error:
        "Las escrituras deben ser números de hasta 5 dígitos sin caracteres especiales o letras.",
    });
  }
  if (parseInt(initial_deed) >= parseInt(final_deed)) {
    return res.status(400).json({
      error: "La escritura inicial debe ser menor que la escritura final.",
    });
  }

  const insertQuery = `
    INSERT INTO records (
      volume,
      book,
      initial_deed,
      final_deed,
      fol,
      month,
      creation_date,
      first_acto,
      first_grantor,
      first_receiver,
      first_acto_date,
      second_acto,
      second_grantor,
      second_receiver,
      second_acto_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    insertQuery,
    [
      volume,
      book,
      initial_deed,
      final_deed,
      fol,
      month,
      creation_date,
      first_acto,
      first_grantor,
      first_receiver,
      first_acto_date,
      second_acto,
      second_grantor,
      second_receiver,
      second_acto_date,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );

  //FETCH DATA
  router.get("/records", (req: Request, res: Response) => {
    const selectQuery = `SELECT * FROM records`;
  
    db.all(selectQuery, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(rows);
    });
  });
});

export default router;