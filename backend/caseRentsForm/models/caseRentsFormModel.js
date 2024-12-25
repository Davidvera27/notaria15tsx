const { getDB } = require("../../utils/dbConnection");

const getAllCases = () => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.Id, c.FechaCreacion, c.Escritura, c.Radicado, c.FechaDocumento, c.Observaciones, 
      c.ProtocolistaId, p.Nombres AS Protocolista 
      FROM CaseRentsForm c 
      JOIN Protocolist p ON c.ProtocolistaId = p.Id
    `;
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const createCase = (data) => {
  const db = getDB();
  const query = `
    INSERT INTO CaseRentsForm (Escritura, Radicado, ProtocolistaId, Observaciones, FechaDocumento, FechaCreacion)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `;
  return new Promise((resolve, reject) => {
    db.run(
      query,
      [data.Escritura, data.Radicado, data.ProtocolistaId, data.Observaciones, data.FechaDocumento],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
};

const updateCase = (id, data) => {
  const db = getDB();
  const query = `
    UPDATE CaseRentsForm
    SET Escritura = ?, Radicado = ?, ProtocolistaId = ?, Observaciones = ?, FechaDocumento = ?, FechaModificacion = datetime('now')
    WHERE Id = ?
  `;
  return new Promise((resolve, reject) => {
    db.run(
      query,
      [data.Escritura, data.Radicado, data.ProtocolistaId, data.Observaciones, data.FechaDocumento, id],
      (err) => {
        if (err) reject(err);
        else resolve({ message: "Caso actualizado exitosamente" });
      }
    );
  });
};

const deleteCase = (id) => {
  const db = getDB();
  const query = "DELETE FROM CaseRentsForm WHERE Id = ?";
  return new Promise((resolve, reject) => {
    db.run(query, [id], (err) => {
      if (err) reject(err);
      else resolve({ message: "Caso eliminado exitosamente" });
    });
  });
};

module.exports = {
  getAllCases,
  createCase,
  updateCase,
  deleteCase,
};
