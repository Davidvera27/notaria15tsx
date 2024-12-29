import db from '../config/db'; // Asegúrate de tener la conexión a la base de datos configurada
import { Caserents } from '../interface/Caserents'; // Importa la interfaz renombrada

// Función para validar si el radicado ya existe en la base de datos
export const ValidarRadicadoExistente = (radicado: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Consulta SQL para verificar si el radicado ya existe
    const query = 'SELECT id, protocolista FROM case_rents WHERE radicado = ?';
    db.get(query, [radicado], (err, row) => {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(row); // Si no hay error, devolvemos la fila encontrada
    });
  });
};

// Función para validar si la combinación de escritura y fecha ya existe
export const ValidarEscrituraExistente = (escritura: string, document_date: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Consulta SQL para verificar si la combinación de escritura y fecha ya existe
    const query = 'SELECT id FROM case_rents WHERE escritura = ? AND document_date = ?';
    db.get(query, [escritura, document_date], (err, row) => {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(row); // Si no hay error, devolvemos la fila encontrada
    });
  });
};

// Función para insertar un nuevo caso de renta en la base de datos
export const insertarCasoRentas = (record: Caserents): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Desestructuración de los datos del registro a insertar
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified } = record;

    // Consulta SQL para insertar un nuevo registro
    const insertQuery = `
      INSERT INTO case_rents (creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(insertQuery, [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified], function (err) {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(this.lastID); // Si la inserción es exitosa, devolvemos el ID del nuevo registro
    });
  });
};

// Función para obtener todos los casos de renta desde la base de datos
export const ObtenerTodoCasosRentas = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // Consulta SQL para obtener todos los registros de la tabla case_rents
    const query = 'SELECT * FROM case_rents';
    db.all(query, [], (err, rows) => {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(rows); // Si no hay error, devolvemos todas las filas obtenidas
    });
  });
};

// Función para actualizar un caso de renta existente en la base de datos
export const ActualizarCasoRentas = (id: number, record: Caserents): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Desestructuración de los datos del registro a actualizar
    const { creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified } = record;

    // Consulta SQL para actualizar el registro específico por ID
    const query = `
      UPDATE case_rents
      SET creation_date = ?, document_date = ?, escritura = ?, radicado = ?, protocolista = ?, observaciones = ?, last_modified = ?
      WHERE id = ?
    `;
    db.run(query, [creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified, id], function (err) {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(this.changes); // Si la actualización es exitosa, devolvemos el número de filas modificadas
    });
  });
};

// Función para eliminar un caso de renta de la base de datos
export const deleteCaseRent = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Consulta SQL para eliminar un registro específico por ID
    const query = 'DELETE FROM case_rents WHERE id = ?';
    db.run(query, [id], function (err) {
      if (err) return reject(err); // Si hay un error, lo rechazamos
      resolve(this.changes); // Si la eliminación es exitosa, devolvemos el número de filas eliminadas
    });
  });
};