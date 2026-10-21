import { Injectable, signal, computed } from '@angular/core';
import { FCT, CET, CFT, HistorialCFT } from '../models/tramite.models';

const SEED_FCT: FCT[] = [
  {
    CdgEm: 'EMP01',
    Codigo: 'FCT-SOL-001',
    CdgTpc: 'TPC-SOLICITUD',
    CdgPCr: 'PCR-VENTANILLA',
    CodigoPH: 'PH-ROOT-001',
    Tipo: 'SOLICITUD',
    Creacion: '2026-01-15',
    CdgPe: 'UNICO',
    Desde: '2026-01-01',
    Hasta: '2026-12-31',
    Estado: 'ACTIVO',
    Descripcion: 'Solicitud de Licencia de Funcionamiento Comercial',
  },
  {
    CdgEm: 'EMP01',
    Codigo: 'FCT-LIQ-002',
    CdgTpc: 'TPC-LIQUIDACION',
    CdgPCr: 'PCR-PORTAL-WEB',
    CodigoPH: 'PH-FIN-002',
    Tipo: 'LIQUIDACION',
    Creacion: '2026-02-10',
    CdgPe: 'MENSUAL',
    Desde: '2026-02-01',
    Hasta: '2027-01-31',
    Estado: 'ACTIVO',
    Descripcion: 'Liquidación de Tasas Municipales y Servicios',
  },
  {
    CdgEm: 'EMP02',
    Codigo: 'FCT-DEC-003',
    CdgTpc: 'TPC-DECLARACION',
    CdgPCr: 'PCR-SISTEMA-INTEGRADO',
    CodigoPH: 'PH-TRIB-003',
    Tipo: 'DECLARACION',
    Creacion: '2026-03-05',
    CdgPe: 'ANUAL',
    Desde: '2026-03-01',
    Hasta: '2026-11-30',
    Estado: 'INACTIVO',
    Descripcion: 'Declaración Jurada Anual de Ingresos y Actividades',
    MotivoInactivacion: 'Reemplazado por nueva resolución tributaria 2026-B',
  },
  {
    CdgEm: 'EMP01',
    Codigo: 'FCT-REG-004',
    CdgTpc: 'TPC-REGISTRO',
    CdgPCr: 'PCR-MOVIL',
    CodigoPH: 'PH-CEN-004',
    Tipo: 'REGISTRO',
    Creacion: '2026-04-12',
    CdgPe: 'UNICO',
    Desde: '2026-04-01',
    Hasta: '2028-12-31',
    Estado: 'ACTIVO',
    Descripcion: 'Registro Único de Proveedores y Contratistas',
  }
];

const SEED_CET: CET[] = [
  {
    Codigo: 'CET_TIPO_DOC',
    Tipo: 'SELECT',
    Nombre: 'Tipo de Documento de Identidad',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 10,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'DOM_TIPOS_IDENTIFICACION',
    Descripcion: 'Selector del documento oficial: DNI, Pasaporte, Cédula, RUC',
    ValoresDominio: ['DNI', 'Cédula de Identidad', 'RUC / NIT', 'Pasaporte', 'Carné de Extranjería']
  },
  {
    Codigo: 'CET_NUM_DOC',
    Tipo: 'INPUT',
    Nombre: 'Número de Identificación / Documento',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 20,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'ALFANUMERICO_SIN_ESPACIOS',
    Descripcion: 'Dígitos alfanuméricos identificatorios del ciudadano o empresa'
  },
  {
    Codigo: 'CET_NOM_RAZON',
    Tipo: 'INPUT',
    Nombre: 'Nombres y Apellidos o Razón Social',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 150,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'TEXTO_GENERAL',
    Descripcion: 'Nombre completo del titular o denominación jurídica'
  },
  {
    Codigo: 'CET_EMAIL_CORR',
    Tipo: 'INPUT',
    Nombre: 'Correo Electrónico de Notificación',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 100,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'FORMATO_EMAIL',
    Descripcion: 'Buzón electrónico para casillero de notificaciones oficiales'
  },
  {
    Codigo: 'CET_TEL_MOVIL',
    Tipo: 'INPUT',
    Nombre: 'Teléfono Móvil de Contacto',
    Obligatorio: 'N',
    TipoDato: 'VARCHAR',
    LongDato: 15,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'FORMATO_TELEFONO',
    Descripcion: 'Número móvil para envío de alertas y códigos SMS'
  },
  {
    Codigo: 'CET_FEC_SOLICITUD',
    Tipo: 'DATE',
    Nombre: 'Fecha de Presentación del Trámite',
    Obligatorio: 'S',
    TipoDato: 'DATE',
    LongDato: 10,
    LongDec: 0,
    Acceso: 'CONTROLADO',
    Visible: 'S',
    Dominio: 'FECHA_ACTUAL',
    Descripcion: 'Fecha fijada por el sistema al momento de radicar'
  },
  {
    Codigo: 'CET_DIR_ESTABLEC',
    Tipo: 'TEXTAREA',
    Nombre: 'Dirección o Ubicación del Establecimiento',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 250,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'TEXTO_DIRECCION',
    Descripcion: 'Ubicación física exacta sujeta a inspección técnica'
  },
  {
    Codigo: 'CET_ZONA_SECTOR',
    Tipo: 'SELECT',
    Nombre: 'Sector o Jurisdicción Zonal',
    Obligatorio: 'S',
    TipoDato: 'VARCHAR',
    LongDato: 30,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'DOM_ZONAS_URBANAS',
    Descripcion: 'Zonificación territorial y catastral municipal',
    ValoresDominio: ['Zona Centro Histórico', 'Sector Norte Comercial', 'Sector Sur Industrial', 'Zona Este Residencial', 'Valle / Periferia']
  },
  {
    Codigo: 'CET_MONTO_CAPITAL',
    Tipo: 'NUMBER',
    Nombre: 'Capital Declarado o Monto Solicitado',
    Obligatorio: 'S',
    TipoDato: 'NUMBER',
    LongDato: 14,
    LongDec: 2,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'MONEDA_DECIMAL_POSITIVO',
    Descripcion: 'Valor patrimonial o monto base para cálculo arancelario'
  },
  {
    Codigo: 'CET_ARCH_RUC_PDF',
    Tipo: 'FILE',
    Nombre: 'Adjunto de Documento Probatorio / Ficha',
    Obligatorio: 'S',
    TipoDato: 'BLOB',
    LongDato: 0,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'ARCHIVOS_PDF_JPG_MAX5MB',
    Descripcion: 'Archivo digital escaneado formato PDF o JPG (máximo 5MB)'
  },
  {
    Codigo: 'CET_ACEPTA_TERMINOS',
    Tipo: 'CHECKBOX',
    Nombre: 'Declaración Jurada de Veracidad y Consentimiento',
    Obligatorio: 'S',
    TipoDato: 'BOOLEAN',
    LongDato: 1,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'SI_NO',
    Descripcion: 'Aceptación expresa de términos y responsabilidades legales'
  },
  {
    Codigo: 'CET_OBSERVACIONES',
    Tipo: 'TEXTAREA',
    Nombre: 'Observaciones Adicionales del Solicitante',
    Obligatorio: 'N',
    TipoDato: 'TEXT',
    LongDato: 500,
    LongDec: 0,
    Acceso: 'ESCRITURA',
    Visible: 'S',
    Dominio: 'TEXTO_LIBRE',
    Descripcion: 'Comentarios libres o aclaraciones previas al análisis'
  }
];

const SEED_CFT: CFT[] = [
  // Campos asignados al trámite FCT-SOL-001
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 1,
    CdgCET: 'CET_TIPO_DOC',
    CdgTipo: 'SELECT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'DOM_TIPOS_IDENTIFICACION',
    Etiqueta: 'Tipo de Documento del Representante',
    Registro: 'S',
    Mostrar: 'S',
    Ayuda: 'Seleccione el tipo de cédula o documento'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 2,
    CdgCET: 'CET_NUM_DOC',
    CdgTipo: 'INPUT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'ALFANUMERICO_SIN_ESPACIOS',
    Etiqueta: 'Número de Cédula o RUC',
    Registro: 'S',
    Mostrar: 'S',
    Placeholder: 'Ej: 1715489210001'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 3,
    CdgCET: 'CET_NOM_RAZON',
    CdgTipo: 'INPUT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'TEXTO_GENERAL',
    Etiqueta: 'Razón Social o Nombre del Negocio',
    Registro: 'S',
    Mostrar: 'S',
    Placeholder: 'Nombre comercial registrado'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 4,
    CdgCET: 'CET_EMAIL_CORR',
    CdgTipo: 'INPUT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'FORMATO_EMAIL',
    Etiqueta: 'Buzón Electrónico Notificaciones',
    Registro: 'S',
    Mostrar: 'S',
    Placeholder: 'correo@ejemplo.com'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 5,
    CdgCET: 'CET_ZONA_SECTOR',
    CdgTipo: 'SELECT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'DOM_ZONAS_URBANAS',
    Etiqueta: 'Jurisdicción del Establecimiento',
    Registro: 'S',
    Mostrar: 'S'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 6,
    CdgCET: 'CET_DIR_ESTABLEC',
    CdgTipo: 'TEXTAREA',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'TEXTO_DIRECCION',
    Etiqueta: 'Dirección Exacta del Local',
    Registro: 'S',
    Mostrar: 'S',
    Placeholder: 'Calle principal, número y calle secundaria'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 7,
    CdgCET: 'CET_MONTO_CAPITAL',
    CdgTipo: 'NUMBER',
    Obligatoriedad: 'OPCIONAL',
    Dominio: 'MONEDA_DECIMAL_POSITIVO',
    Etiqueta: 'Capital Inicial Declarado (USD)',
    Registro: 'S',
    Mostrar: 'S',
    Placeholder: '0.00'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 8,
    CdgCET: 'CET_ARCH_RUC_PDF',
    CdgTipo: 'FILE',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'ARCHIVOS_PDF_JPG_MAX5MB',
    Etiqueta: 'Copia Certificada de RUC / Escritura (PDF)',
    Registro: 'S',
    Mostrar: 'S'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-SOL-001',
    Secuencia: 9,
    CdgCET: 'CET_ACEPTA_TERMINOS',
    CdgTipo: 'CHECKBOX',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'SI_NO',
    Etiqueta: 'Certifico bajo juramento la autenticidad de los datos provistos',
    Registro: 'S',
    Mostrar: 'S'
  },
  // Campos asignados al trámite FCT-LIQ-002
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-LIQ-002',
    Secuencia: 1,
    CdgCET: 'CET_NUM_DOC',
    CdgTipo: 'INPUT',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'ALFANUMERICO_SIN_ESPACIOS',
    Etiqueta: 'Código de Contribuyente / Identificación',
    Registro: 'S',
    Mostrar: 'S'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-LIQ-002',
    Secuencia: 2,
    CdgCET: 'CET_MONTO_CAPITAL',
    CdgTipo: 'NUMBER',
    Obligatoriedad: 'OBLIGATORIO',
    Dominio: 'MONEDA_DECIMAL_POSITIVO',
    Etiqueta: 'Base Imponible Liquidación',
    Registro: 'S',
    Mostrar: 'S'
  },
  {
    CdgEm: 'EMP01',
    CdgFTr: 'FCT-LIQ-002',
    Secuencia: 3,
    CdgCET: 'CET_OBSERVACIONES',
    CdgTipo: 'TEXTAREA',
    Obligatoriedad: 'OPCIONAL',
    Dominio: 'TEXTO_LIBRE',
    Etiqueta: 'Detalle o Conceptos Exentos',
    Registro: 'S',
    Mostrar: 'S'
  }
];

const SEED_HISTORIAL: HistorialCFT[] = [
  {
    id: 'HIST-001',
    cdgEm: 'EMP01',
    cdgFTr: 'FCT-SOL-001',
    secuencia: 1,
    cdgCET: 'CET_TIPO_DOC',
    fecha: '2026-01-16 09:30:15',
    usuario: 'admin.disenador',
    accion: 'CREAR',
    campoModificado: 'Registro Inicial',
    valorAnterior: '—',
    valorNuevo: 'CET_TIPO_DOC en secuencia 1',
    motivo: 'Diseño inicial de trámite de licencias'
  },
  {
    id: 'HIST-002',
    cdgEm: 'EMP01',
    cdgFTr: 'FCT-SOL-001',
    secuencia: 7,
    cdgCET: 'CET_MONTO_CAPITAL',
    fecha: '2026-01-20 14:15:22',
    usuario: 'supervisor.tramites',
    accion: 'ACTUALIZAR',
    campoModificado: 'Obligatoriedad',
    valorAnterior: 'OBLIGATORIO',
    valorNuevo: 'OPCIONAL',
    motivo: 'Flexibilización de requisito para microempresas'
  },
  {
    id: 'HIST-003',
    cdgEm: 'EMP01',
    cdgFTr: 'FCT-SOL-001',
    secuencia: 8,
    cdgCET: 'CET_ARCH_RUC_PDF',
    fecha: '2026-02-01 11:05:40',
    usuario: 'admin.disenador',
    accion: 'CREAR',
    campoModificado: 'Etiqueta',
    valorAnterior: '—',
    valorNuevo: 'Copia Certificada de RUC / Escritura (PDF)',
    motivo: 'Se requiere adjunto formal'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TramitesService {
  // Reactive Signals for our entities
  readonly fctList = signal<FCT[]>([]);
  readonly cetList = signal<CET[]>([]);
  readonly cftList = signal<CFT[]>([]);
  readonly historialList = signal<HistorialCFT[]>([]);

  // Selected FCT for focused editing & preview
  readonly selectedFCTCode = signal<string>('FCT-SOL-001');

  // Currently selected FCT computed
  readonly selectedFCT = computed(() => {
    const code = this.selectedFCTCode();
    return this.fctList().find(f => f.Codigo === code) || this.fctList()[0] || null;
  });

  // CFT items for currently selected FCT, ordered by Secuencia
  readonly selectedFCTCftList = computed(() => {
    const fct = this.selectedFCT();
    if (!fct) return [];
    return this.cftList()
      .filter(c => c.CdgFTr === fct.Codigo)
      .sort((a, b) => a.Secuencia - b.Secuencia);
  });

  // Active view tab
  readonly activeTab = signal<'fct' | 'cft' | 'cet' | 'preview'>('fct');

  constructor() {
    this.initData();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private initData(): void {
    if (this.isBrowser()) {
      try {
        const storedFct = localStorage.getItem('tramites_fct');
        const storedCet = localStorage.getItem('tramites_cet');
        const storedCft = localStorage.getItem('tramites_cft');
        const storedHist = localStorage.getItem('tramites_hist');

        this.fctList.set(storedFct ? JSON.parse(storedFct) : SEED_FCT);
        this.cetList.set(storedCet ? JSON.parse(storedCet) : SEED_CET);
        this.cftList.set(storedCft ? JSON.parse(storedCft) : SEED_CFT);
        this.historialList.set(storedHist ? JSON.parse(storedHist) : SEED_HISTORIAL);
      } catch (e) {
        console.warn('Error reading from localStorage, using seed data', e);
        this.fctList.set(SEED_FCT);
        this.cetList.set(SEED_CET);
        this.cftList.set(SEED_CFT);
        this.historialList.set(SEED_HISTORIAL);
      }
    } else {
      this.fctList.set(SEED_FCT);
      this.cetList.set(SEED_CET);
      this.cftList.set(SEED_CFT);
      this.historialList.set(SEED_HISTORIAL);
    }
  }

  private persist(): void {
    if (this.isBrowser()) {
      try {
        localStorage.setItem('tramites_fct', JSON.stringify(this.fctList()));
        localStorage.setItem('tramites_cet', JSON.stringify(this.cetList()));
        localStorage.setItem('tramites_cft', JSON.stringify(this.cftList()));
        localStorage.setItem('tramites_hist', JSON.stringify(this.historialList()));
      } catch (e) {
        console.warn('Error saving to localStorage', e);
      }
    }
  }

  // --- CRUD FCT ---
  addFCT(item: FCT): { success: boolean; message: string } {
    // 1.3 Validaciones
    const code = (item.Codigo || '').trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'El Código identificador del FCT es obligatorio.' };
    }
    if (!item.CdgEm) {
      return { success: false, message: 'El campo CdgEm (Empresa) es obligatorio.' };
    }
    if (!item.CdgTpc) {
      return { success: false, message: 'El campo CdgTpc (Tipo Proceso) es obligatorio.' };
    }
    if (!item.CdgPCr) {
      return { success: false, message: 'El campo CdgPCr (Proceso Creador) es obligatorio.' };
    }
    if (!item.Tipo) {
      return { success: false, message: 'El campo Tipo de Formulario es obligatorio.' };
    }
    if (!item.Desde || !item.Hasta) {
      return { success: false, message: 'Las fechas de vigencia Desde y Hasta son obligatorias.' };
    }
    if (new Date(item.Desde) > new Date(item.Hasta)) {
      return { success: false, message: 'La fecha Desde no puede ser posterior a la fecha Hasta.' };
    }

    // Check unique code
    const exists = this.fctList().some(f => f.Codigo.toUpperCase() === code);
    if (exists) {
      return { success: false, message: `Ya existe un FCT registrado con el código "${code}". El identificador debe ser único.` };
    }

    const newItem: FCT = {
      ...item,
      Codigo: code,
      Estado: item.Estado || 'ACTIVO',
      Creacion: item.Creacion || new Date().toISOString().split('T')[0]
    };

    this.fctList.update(list => [newItem, ...list]);
    this.selectedFCTCode.set(newItem.Codigo);
    this.persist();
    return { success: true, message: `FCT "${newItem.Codigo}" registrado exitosamente.` };
  }

  updateFCT(codigo: string, updates: Partial<FCT>): { success: boolean; message: string } {
    const list = this.fctList();
    const index = list.findIndex(f => f.Codigo === codigo);
    if (index === -1) {
      return { success: false, message: `No se encontró el FCT con código ${codigo}` };
    }

    if (updates.Desde && updates.Hasta && new Date(updates.Desde) > new Date(updates.Hasta)) {
      return { success: false, message: 'La fecha Desde no puede ser posterior a la fecha Hasta.' };
    }

    // Restriction: Codigo must not be modified
    const current = list[index];
    const updated: FCT = {
      ...current,
      ...updates,
      Codigo: current.Codigo // Guarantee immutable code
    };

    this.fctList.update(all => {
      const copy = [...all];
      copy[index] = updated;
      return copy;
    });
    this.persist();
    return { success: true, message: `FCT "${codigo}" actualizado exitosamente.` };
  }

  inactivateFCT(codigo: string, motivo: string): { success: boolean; message: string } {
    const fct = this.fctList().find(f => f.Codigo === codigo);
    if (!fct) {
      return { success: false, message: 'Trámite no encontrado.' };
    }

    this.updateFCT(codigo, {
      Estado: 'INACTIVO',
      MotivoInactivacion: motivo || 'Inactivado por el administrador del sistema.'
    });

    return { success: true, message: `FCT "${codigo}" ha sido inactivado correctamente.` };
  }

  deleteFCT(codigo: string): { success: boolean; message: string } {
    const fct = this.fctList().find(f => f.Codigo === codigo);
    if (!fct) {
      return { success: false, message: 'Trámite no encontrado.' };
    }

    // Remove associated CFTs
    this.cftList.update(list => list.filter(c => c.CdgFTr !== codigo));
    this.fctList.update(list => list.filter(f => f.Codigo !== codigo));

    // Update selection if deleted was selected
    if (this.selectedFCTCode() === codigo) {
      const remaining = this.fctList();
      this.selectedFCTCode.set(remaining.length > 0 ? remaining[0].Codigo : '');
    }
    this.persist();
    return { success: true, message: `FCT "${codigo}" y sus campos asociados fueron eliminados.` };
  }

  selectFCT(codigo: string): void {
    this.selectedFCTCode.set(codigo);
  }

  // --- CRUD CFT ---
  addCFT(cft: CFT, usuario = 'admin.disenador'): { success: boolean; message: string } {
    // Validación requerida: "El sistema dice que la obligatoriedad es obligatoria."
    if (!cft.Obligatoriedad) {
      return { success: false, message: 'La Obligatoriedad es obligatoria para el campo.' };
    }
    if (!cft.CdgFTr) {
      return { success: false, message: 'Debe especificar el FCT al que pertenece el campo.' };
    }
    if (!cft.CdgCET) {
      return { success: false, message: 'Debe seleccionar un código de elemento CET.' };
    }
    if (!cft.Etiqueta || !cft.Etiqueta.trim()) {
      return { success: false, message: 'La Etiqueta visible del campo es obligatoria.' };
    }

    const currentFCTCfts = this.cftList().filter(c => c.CdgFTr === cft.CdgFTr);
    
    // Auto-compute Secuencia if not given or already exists
    let nextSeq = cft.Secuencia;
    if (!nextSeq || currentFCTCfts.some(c => c.Secuencia === nextSeq)) {
      const maxSeq = currentFCTCfts.reduce((max, c) => Math.max(max, c.Secuencia), 0);
      nextSeq = maxSeq + 1;
    }

    const newCFT: CFT = {
      ...cft,
      Secuencia: nextSeq,
      CdgEm: cft.CdgEm || 'EMP01',
      Registro: cft.Registro || 'S',
      Mostrar: cft.Mostrar || 'S'
    };

    this.cftList.update(list => [...list, newCFT]);

    // Record audit history (8.3 Historial)
    this.logHistorial({
      cdgEm: newCFT.CdgEm,
      cdgFTr: newCFT.CdgFTr,
      secuencia: newCFT.Secuencia,
      cdgCET: newCFT.CdgCET,
      usuario,
      accion: 'CREAR',
      campoModificado: 'Asignación Nuevo Campo',
      valorAnterior: '—',
      valorNuevo: `Sec ${newCFT.Secuencia}: ${newCFT.Etiqueta} [${newCFT.Obligatoriedad}]`,
      motivo: 'Alta de campo en diseño de formulario'
    });

    this.persist();
    return { success: true, message: `Campo "${newCFT.Etiqueta}" (Secuencia ${newCFT.Secuencia}) agregado exitosamente.` };
  }

  updateCFT(cdgFTr: string, secuencia: number, updates: Partial<CFT>, usuario = 'admin.disenador'): { success: boolean; message: string } {
    if (updates.Obligatoriedad === undefined && updates.Obligatoriedad !== undefined) {
      return { success: false, message: 'La Obligatoriedad es obligatoria para el campo.' };
    }

    const list = this.cftList();
    const index = list.findIndex(c => c.CdgFTr === cdgFTr && c.Secuencia === secuencia);
    if (index === -1) {
      return { success: false, message: 'Campo CFT no encontrado para actualizar.' };
    }

    const current = list[index];
    const updated: CFT = {
      ...current,
      ...updates,
      CdgFTr: current.CdgFTr, // immutable link
      Secuencia: updates.Secuencia !== undefined ? updates.Secuencia : current.Secuencia
    };

    // Calculate modified field for audit
    let changedField = 'Propiedades Generales';
    let oldVal = '';
    let newVal = '';

    if (updates.Etiqueta && updates.Etiqueta !== current.Etiqueta) {
      changedField = 'Etiqueta';
      oldVal = current.Etiqueta;
      newVal = updates.Etiqueta;
    } else if (updates.Obligatoriedad && updates.Obligatoriedad !== current.Obligatoriedad) {
      changedField = 'Obligatoriedad';
      oldVal = current.Obligatoriedad;
      newVal = updates.Obligatoriedad;
    } else if (updates.CdgTipo && updates.CdgTipo !== current.CdgTipo) {
      changedField = 'Tipo de Control (CdgTipo)';
      oldVal = current.CdgTipo;
      newVal = updates.CdgTipo;
    } else if (updates.Dominio && updates.Dominio !== current.Dominio) {
      changedField = 'Dominio';
      oldVal = current.Dominio;
      newVal = updates.Dominio;
    }

    this.cftList.update(all => {
      const copy = [...all];
      copy[index] = updated;
      return copy;
    });

    // 8.3 Historial
    this.logHistorial({
      cdgEm: updated.CdgEm,
      cdgFTr: updated.CdgFTr,
      secuencia: updated.Secuencia,
      cdgCET: updated.CdgCET,
      usuario,
      accion: 'ACTUALIZAR',
      campoModificado: changedField,
      valorAnterior: oldVal || 'Configuración previa',
      valorNuevo: newVal || 'Nueva configuración',
      motivo: 'Modificación de parámetros del campo en el formulario'
    });

    this.persist();
    return { success: true, message: `Campo "${updated.Etiqueta}" actualizado exitosamente.` };
  }

  deleteCFT(cdgFTr: string, secuencia: number, usuario = 'admin.disenador'): { success: boolean; message: string } {
    const list = this.cftList();
    const item = list.find(c => c.CdgFTr === cdgFTr && c.Secuencia === secuencia);
    if (!item) {
      return { success: false, message: 'Campo CFT no encontrado para eliminar.' };
    }

    this.cftList.update(all => all.filter(c => !(c.CdgFTr === cdgFTr && c.Secuencia === secuencia)));

    // Re-index remaining sequences for this FCT so they remain clean 1..N
    this.reindexSequences(cdgFTr);

    // 8.3 Historial
    this.logHistorial({
      cdgEm: item.CdgEm,
      cdgFTr: item.CdgFTr,
      secuencia: item.Secuencia,
      cdgCET: item.CdgCET,
      usuario,
      accion: 'ELIMINAR',
      campoModificado: 'Eliminación del campo',
      valorAnterior: `Sec ${item.Secuencia}: ${item.Etiqueta}`,
      valorNuevo: 'Eliminado del trámite',
      motivo: 'Depuración de campo en la plantilla del formulario'
    });

    this.persist();
    return { success: true, message: `Campo "${item.Etiqueta}" eliminado del trámite.` };
  }

  reorderCFT(cdgFTr: string, fromIndex: number, toIndex: number, usuario = 'admin.disenador'): void {
    const fctCfts = this.selectedFCTCftList();
    if (fromIndex < 0 || fromIndex >= fctCfts.length || toIndex < 0 || toIndex >= fctCfts.length) return;

    const listCopy = [...fctCfts];
    const [moved] = listCopy.splice(fromIndex, 1);
    listCopy.splice(toIndex, 0, moved);

    // Update sequences
    const updatedWithSeq = listCopy.map((item, idx) => ({
      ...item,
      Secuencia: idx + 1
    }));

    // Update in all CFTs
    this.cftList.update(all => {
      const otherCfts = all.filter(c => c.CdgFTr !== cdgFTr);
      return [...otherCfts, ...updatedWithSeq];
    });

    // 8.3 Historial
    this.logHistorial({
      cdgEm: moved.CdgEm,
      cdgFTr: cdgFTr,
      secuencia: toIndex + 1,
      cdgCET: moved.CdgCET,
      usuario,
      accion: 'REORDENAR',
      campoModificado: 'Secuencia de visualización',
      valorAnterior: `Posición ${fromIndex + 1}`,
      valorNuevo: `Posición ${toIndex + 1}`,
      motivo: 'Ajuste de orden de captura en formulario'
    });

    this.persist();
  }

  private reindexSequences(cdgFTr: string): void {
    this.cftList.update(all => {
      const fctItems = all.filter(c => c.CdgFTr === cdgFTr).sort((a, b) => a.Secuencia - b.Secuencia);
      const otherItems = all.filter(c => c.CdgFTr !== cdgFTr);
      const reindexed = fctItems.map((c, idx) => ({ ...c, Secuencia: idx + 1 }));
      return [...otherItems, ...reindexed];
    });
  }

  // Assign CET to selected FCT
  assignCETToFCT(cdgFTr: string, cet: CET, customLabel?: string, obligatoriedad: CFT['Obligatoriedad'] = 'OBLIGATORIO'): { success: boolean; message: string } {
    const fct = this.fctList().find(f => f.Codigo === cdgFTr);
    if (!fct) {
      return { success: false, message: 'Debe seleccionar un trámite FCT destino válido.' };
    }

    const currentFCTCfts = this.cftList().filter(c => c.CdgFTr === cdgFTr);
    // Check if already assigned
    const alreadyAssigned = currentFCTCfts.some(c => c.CdgCET === cet.Codigo);
    if (alreadyAssigned) {
      return {
        success: false,
        message: `El campo "${cet.Codigo}" ya está asignado al trámite "${cdgFTr}". Puede editar su secuencia o etiqueta en la pestaña CFT.`
      };
    }

    const maxSeq = currentFCTCfts.reduce((max, c) => Math.max(max, c.Secuencia), 0);
    const newSeq = maxSeq + 1;

    const newCFT: CFT = {
      CdgEm: fct.CdgEm,
      CdgFTr: cdgFTr,
      Secuencia: newSeq,
      CdgCET: cet.Codigo,
      CdgTipo: cet.Tipo,
      Obligatoriedad: obligatoriedad,
      Dominio: cet.Dominio,
      Etiqueta: customLabel && customLabel.trim() ? customLabel.trim() : cet.Nombre,
      Registro: 'S',
      Mostrar: 'S',
      Placeholder: cet.Descripcion || `Ingrese ${cet.Nombre.toLowerCase()}`
    };

    return this.addCFT(newCFT);
  }

  // Historial audit logger (8.3)
  private logHistorial(entry: Omit<HistorialCFT, 'id' | 'fecha'>): void {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = 'HIST-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const fullEntry: HistorialCFT = {
      ...entry,
      id,
      fecha: formattedDate
    };

    this.historialList.update(list => [fullEntry, ...list]);
  }

  // Reset to initial seed data
  resetDefaults(): void {
    this.fctList.set(SEED_FCT);
    this.cetList.set(SEED_CET);
    this.cftList.set(SEED_CFT);
    this.historialList.set(SEED_HISTORIAL);
    this.selectedFCTCode.set('FCT-SOL-001');
    this.persist();
  }

  // Export full configuration as JSON file
  exportConfig(): string {
    return JSON.stringify({
      fct: this.fctList(),
      cet: this.cetList(),
      cft: this.cftList(),
      historial: this.historialList(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // Import JSON configuration
  importConfig(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.fct) && Array.isArray(data.cft)) {
        this.fctList.set(data.fct);
        if (Array.isArray(data.cet)) this.cetList.set(data.cet);
        this.cftList.set(data.cft);
        if (Array.isArray(data.historial)) this.historialList.set(data.historial);
        if (data.fct.length > 0) this.selectedFCTCode.set(data.fct[0].Codigo);
        this.persist();
        return { success: true, message: 'Configuración restaurada con éxito.' };
      }
      return { success: false, message: 'Estructura de archivo JSON inválida.' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      return { success: false, message: 'Error al procesar el archivo JSON: ' + msg };
    }
  }
}
