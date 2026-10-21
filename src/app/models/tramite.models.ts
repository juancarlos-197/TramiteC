export interface FCT {
  CdgEm: string;         // Código Empresa
  Codigo: string;        // Código identificador único del FCT (Inmutable en edición)
  CdgTpc: string;        // Código Tipo de Proceso
  CdgPCr: string;        // Código Proceso Creador
  CodigoPH: string;      // Código Padre / Procedimiento Hermano
  Tipo: string;          // Tipo de trámite / formulario
  Creacion: string;      // Fecha Creación (YYYY-MM-DD)
  CdgPe: string;         // Código Período / Periodicidad
  Desde: string;         // Vigencia Desde (YYYY-MM-DD)
  Hasta: string;         // Vigencia Hasta (YYYY-MM-DD)
  Estado: 'ACTIVO' | 'INACTIVO';
  Descripcion: string;   // Nombre o descripción legible
  MotivoInactivacion?: string;
}

export interface CET {
  Codigo: string;        // Código del elemento
  Tipo: string;          // Tipo de componente/control
  Nombre: string;        // Nombre descriptivo
  Obligatorio: 'S' | 'N';// Por defecto
  TipoDato: 'VARCHAR' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'BLOB' | 'TEXT';
  LongDato: number;      // Longitud total
  LongDec: number;       // Longitud decimal
  Acceso: 'LECTURA' | 'ESCRITURA' | 'CONTROLADO';
  Visible: 'S' | 'N';
  Dominio: string;       // Nombre de dominio o catálogo
  Descripcion?: string;
  ValoresDominio?: string[];
}

export interface CFT {
  CdgEm: string;         // Código Empresa
  CdgFTr: string;        // Código FCT asociado
  Secuencia: number;     // Número secuencial de orden (1, 2, 3...)
  CdgCET: string;        // Código de elemento CET
  CdgTipo: string;       // Tipo de control en el formulario
  Obligatoriedad: 'OBLIGATORIO' | 'OPCIONAL' | 'CONDICIONAL' | 'DESHABILITADO';
  Dominio: string;       // Dominio o regla
  Etiqueta: string;      // Label visible para el usuario
  Registro: 'S' | 'N';   // Editable en registro
  Mostrar: 'S' | 'N';    // Visible en pantalla
  Ayuda?: string;        // Texto de ayuda
  Placeholder?: string;  // Placeholder
}

export interface HistorialCFT {
  id: string;
  cdgEm: string;
  cdgFTr: string;
  secuencia: number;
  cdgCET: string;
  fecha: string;         // ISO timestamp o formato legible
  usuario: string;       // Usuario auditor
  accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'REORDENAR';
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  motivo?: string;
}

export interface FiltrosFCT {
  busqueda: string;
  cdgEm: string;
  tipo: string;
  cdgTpc: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
}

export interface FiltrosCET {
  codigo: string;
  tipo: string;
  nombre: string;
  obligatorio: string;
  tipoDato: string;
  longDato: string;
  longDec: string;
  acceso: string;
  visible: string;
  dominio: string;
}
