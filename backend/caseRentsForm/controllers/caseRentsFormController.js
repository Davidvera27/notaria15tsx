const { getDB } = require("../../utils/dbConnection");

// Obtener todos los casos
const getAllCases = (req, res) => {
  const db = getDB();
  db.all(
    `SELECT c.Id, c.FechaCreacion, c.Escritura, c.Radicado, c.FechaDocumento, c.Observaciones, 
    c.ProtocolistaId, p.Nombres AS Protocolista 
    FROM CaseRentsForm c 
    JOIN Protocolist p ON c.ProtocolistaId = p.Id`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
};

// Crear un nuevo caso
const createCase = (req, res) => {
  const { Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento } = req.body;
  if (!Escritura || !Radicado || !ProtocolistaId || !FechaDocumento) {
    return res.status(400).json({ error: "Todos los campos obligatorios deben estar llenos." });
  }

  const db = getDB();
  const query = `
    INSERT INTO CaseRentsForm (Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento, FechaCreacion)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `;
  db.run(query, [Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, message: "Caso creado exitosamente" });
    }
  });
};

// Editar un caso existente
const updateCase = (req, res) => {
  const { id } = req.params;
  const { Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento } = req.body;

  if (!Escritura || !Radicado || !ProtocolistaId || !FechaDocumento) {
    return res.status(400).json({ error: "Todos los campos obligatorios deben estar llenos." });
  }

  const db = getDB();
  const query = `
    UPDATE CaseRentsForm
    SET Escritura = ?, Radicado = ?, ProtocolistaId = ?, Observaciones = ?, FechaDocumento = ?, FechaModificacion = datetime('now')
    WHERE Id = ?
  `;
  db.run(query, [Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Caso no encontrado" });
    } else {
      res.json({ message: "Caso actualizado exitosamente" });
    }
  });
};

// Eliminar un caso
const deleteCase = (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const query = "DELETE FROM CaseRentsForm WHERE Id = ?";
  db.run(query, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Caso no encontrado" });
    } else {
      res.json({ message: "Caso eliminado exitosamente" });
    }
  });
};

module.exports = { getAllCases, createCase, updateCase, deleteCase };
