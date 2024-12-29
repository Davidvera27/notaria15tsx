export interface Caserents {
    id?: number; // Identificador único
    creation_date: string; // Fecha de creación (en formato YYYY-MM-DD)
    document_date: string; // Fecha del documento (en formato YYYY-MM-DD)
    escritura: string; // Número de escritura
    radicado: string; // Número de radicado
    protocolista: string; // Nombre del protocolista
    observaciones: string; // Observaciones adicionales
    last_modified: string; // Última modificación (en formato ISO 8601)
  }