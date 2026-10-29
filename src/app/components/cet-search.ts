import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../services/tramites';
import { CET, CFT } from '../models/tramite.models';

@Component({
  selector: 'app-cet-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="space-y-6">

      <!-- Header & Destination FCT Selection Bar -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700">
                <mat-icon class="text-lg">travel_explore</mat-icon>
              </span>
              <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                 CET — Buscador diseñador de Trámites
              </h2>
            </div>
            <p class="text-xs text-slate-500 mt-1 max-w-2xl">
            </p>
          </div>

          
        </div>

    
      </div>

      <!-- 5.1 Interfaz de Búsqueda con Filtros Exigidos:
           (Código, Tipo, Nombre, Obligatorio, TipoDato, LongDato, LongDec, Acceso, Visible, Dominio) -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <mat-icon class="text-slate-500 text-base">filter_list</mat-icon>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtros de Búsqueda </h3>
          </div>

          <button
            (click)="limpiarFiltros()"
            class="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            
          </button>
        </div>

        <!-- 10 Specified Filters Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <!-- 1. Filtro Código -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Código</label>
            <input
              type="text"
              [value]="filtroCodigo()"
              (input)="filtroCodigo.set($any($event.target).value)"
              placeholder="Ej. CODIGO-CRÉDITO-001"
              class="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- 2. Filtro Nombre -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              [value]="filtroNombre()"
              (input)="filtroNombre.set($any($event.target).value)"
              placeholder="Buscar por nombre..."
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <!-- 3. Filtro Tipo -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Tipo </label>
            <select
              [value]="filtroTipo()"
              (change)="filtroTipo.set($any($event.target).value)"
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Crédito</option>
              <option value="INPUT">Ahorro</option>
            </select>
          </div>

          <!-- 4. Filtro Obligatorio -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Obligatorio</label>
            <select
              [value]="filtroObligatorio()"
              (change)="filtroObligatorio.set($any($event.target).value)"
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="S">S (Sí)</option>
              <option value="N">N (No)</option>
            </select>
          </div>

          <!-- 5. Filtro TipoDato -
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">TipoDato</label>
            <select
              [value]="filtroTipoDato()"
              (change)="filtroTipoDato.set($any($event.target).value)"
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los tipos de dato</option>
              <option value="VARCHAR"> </option>
              <option value="NUMBER"></option>
            
            </select>
          </div>->

          <!-- 6. Filtro LongDato 
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">LongDato</label>
            <input
              type="text"
              [value]="filtroLongDato()"
              (input)="filtroLongDato.set($any($event.target).value)"
              placeholder="Ej. 20, 100..."
              class="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>-->

          <!-- 7. Filtro LongDec --
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">LongDec</label>
            <input
              type="text"
              [value]="filtroLongDec()"
              (input)="filtroLongDec.set($any($event.target).value)"
              placeholder="Ej. 0, 2..."
              class="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>-->

          <!-- 8. Filtro Acceso -
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Acceso</label>
            <select
              [value]="filtroAcceso()"
              (change)="filtroAcceso.set($any($event.target).value)"
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="ESCRITURA">ESCRITURA</option>
              <option value="LECTURA">LECTURA</option>
              <option value="CONTROLADO">CONTROLADO</option>
            </select>
          </div>-->

          <!-- 9. Filtro Visible -
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Visible</label>
            <select
              [value]="filtroVisible()"
              (change)="filtroVisible.set($any($event.target).value)"
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="S">S (Visible)</option>
              <option value="N">N (Oculto)</option>
            </select>
          </div>-->

          <!-- 10. Filtro Dominio --
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">Dominio</label>
            <input
              type="text"
              [value]="filtroDominio()"
              (input)="filtroDominio.set($any($event.target).value)"
              placeholder="Buscar dominio..."
              class="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>-->

        <!-- Tabla de Resultados CET --
        <div class="overflow-x-auto rounded-xl border border-slate-200 mt-4">
          <table class="min-w-full divide-y divide-slate-200 text-left text-xs bg-white">
            <thead class="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" class="py-3 px-3 text-center w-8">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    (change)="toggleSelectAll($event)"
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th scope="col" class="py-3 px-3.5">Código CET</th>
                <th scope="col" class="py-3 px-3.5">Nombre y Descripción</th>
                <th scope="col" class="py-3 px-3.5">Tipo</th>
                <th scope="col" class="py-3 px-3.5">TipoDato (Long / Dec)</th>
                <th scope="col" class="py-3 px-3.5">Obligatorio</th>
                <th scope="col" class="py-3 px-3.5">Acceso / Visible</th>
                <th scope="col" class="py-3 px-3.5">Dominio</th>
                <th scope="col" class="py-3 px-3.5 text-center">Estado en FCT</th>
                <th scope="col" class="py-3 px-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
              @for (item of cetFiltrados(); track item.Codigo) {
                @let assignedSeq = getAssignedSequence(item.Codigo);
                <tr
                  [class.bg-slate-50]="assignedSeq !== null"
                  class="hover:bg-slate-50/80 transition-colors"
                >
                  <!-- Checkbox Selección múltiple --
                  <td class="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      [checked]="selectedCETS().has(item.Codigo)"
                      (change)="toggleSelection(item.Codigo)"
                      class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  <!-- Código CET --
                  <td class="py-3 px-3.5 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                    {{ item.Codigo }}
                  </td>

                  <!-- Nombre y Descripción --
                  <td class="py-3 px-3.5 max-w-xs">
                    <p class="font-semibold text-slate-900">{{ item.Nombre }}</p>
                    @if (item.Descripcion) {
                      <span class="text-[10px] text-slate-400 block line-clamp-1">{{ item.Descripcion }}</span>
                    }
                  </td>

                  <!-- Tipo --
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {{ item.Tipo }}
                    </span>
                  </td>

                  <!-- TipoDato (Long / Dec) --
                  <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                    <span class="font-bold text-slate-700">{{ item.TipoDato }}</span>
                    <span class="text-slate-400"> ({{ item.LongDato }}{{ item.LongDec ? ',' + item.LongDec : '' }})</span>
                  </td>

                  <!-- Obligatorio --
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    @if (item.Obligatorio === 'S') {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Sí (S)
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        No (N)
                      </span>
                    }
                  </td>

                  <!-- Acceso / Visible --
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-600">
                    <div>{{ item.Acceso }}</div>
                    <span class="text-[10px] text-slate-400">Vis: {{ item.Visible }}</span>
                  </td>

                  <!-- Dominio --
                  <td class="py-3 px-3.5 max-w-[140px] truncate font-mono text-[11px] text-slate-600" [title]="item.Dominio">
                    {{ item.Dominio }}
                  </td>

                  <!-- Estado en FCT activo --
                  <td class="py-3 px-3.5 text-center whitespace-nowrap">
                    @if (assignedSeq !== null) {
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <mat-icon class="text-xs text-emerald-600">done_all</mat-icon>
                        Secuencia {{ assignedSeq }}
                      </span>
                    } @else {
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        Disponible
                      </span>
                    }
                  </td>

                  <!-- Acción: Asignar al FCT --
                  <td class="py-3 px-3.5 text-right whitespace-nowrap">
                    @if (assignedSeq !== null) {
                      <button
                        (click)="service.activeTab.set('cft')"
                        class="text-xs font-semibold text-slate-500 hover:text-blue-700 hover:underline cursor-pointer"
                      >
                        Ver en CFT
                      </button>
                    } @else {
                      <button
                        (click)="openAssignDialog(item)"
                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <mat-icon class="text-sm">add</mat-icon>
                        <span>Asignar</span>
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="py-12 text-center text-slate-400">
                    <mat-icon class="text-4xl text-slate-300">manage_search</mat-icon>
                    <p class="text-sm font-medium text-slate-600 mt-2">No se encontraron elementos CET que coincidan con los filtros.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
          <span>Mostrando {{ cetFiltrados().length }} de {{ service.cetList().length }} elementos de catálogo</span>
          <span class="text-[11px] text-slate-400">Seleccione uno o varios campos para agregarlos directamente a {{ service.selectedFCTCode() }}</span>
        </div>-->

      </div>

      <!-- ========================================== -->
      <!-- MODAL ASIGNAR CET A FCT (CONFIRMACIÓN)    -->
      <!-- ========================================== -->
      @if (assignModalItem(); as item) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <mat-icon class="text-lg">post_add</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">Asignar Campo a FCT</h3>
                  <p class="text-[11px] font-mono text-slate-500">{{ item.Codigo }} &rarr; {{ service.selectedFCTCode() }}</p>
                </div>
              </div>

              <button
                (click)="assignModalItem.set(null)"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <mat-icon class="text-xl">close</mat-icon>
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
              
              <div>
                <label class="block font-semibold text-slate-700 mb-1">
                  Etiqueta Visible en el Formulario <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [value]="assignCustomLabel()"
                  (input)="assignCustomLabel.set($any($event.target).value)"
                  class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span class="text-[10px] text-slate-400 mt-1 block">Puede personalizar la etiqueta con la que el usuario final verá este campo.</span>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">
                  Obligatoriedad en este Trámite <span class="text-rose-500">*</span>
                </label>
                <select
                  [value]="assignObligatoriedad()"
                  (change)="assignObligatoriedad.set($any($event.target).value)"
                  class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OBLIGATORIO">OBLIGATORIO</option>
                  <option value="OPCIONAL">OPCIONAL</option>
                  <option value="CONDICIONAL">CONDICIONAL</option>
                  <option value="DESHABILITADO">DESHABILITADO</option>
                </select>
                <span class="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1 block border border-amber-200">
                  Regla del sistema: La obligatoriedad es un parámetro obligatorio.
                </span>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <div class="flex justify-between">
                  <span class="text-slate-400">Tipo de Control:</span>
                  <span class="font-semibold">{{ item.Tipo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Tipo de Dato:</span>
                  <span class="font-semibold">{{ item.TipoDato }} ({{ item.LongDato }})</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Dominio Asignado:</span>
                  <span class="font-semibold font-mono">{{ item.Dominio }}</span>
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  (click)="assignModalItem.set(null)"
                  class="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  (click)="confirmAssignSingle(item)"
                  class="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Confirmar y Asignar
                </button>
              </div>

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CetSearchComponent {
  readonly service = inject(TramitesService);

  // 10 Specified Filters
  readonly filtroCodigo = signal<string>('');
  readonly filtroTipo = signal<string>('');
  readonly filtroNombre = signal<string>('');
  readonly filtroObligatorio = signal<string>('');
  readonly filtroTipoDato = signal<string>('');
  readonly filtroLongDato = signal<string>('');
  readonly filtroLongDec = signal<string>('');
  readonly filtroAcceso = signal<string>('');
  readonly filtroVisible = signal<string>('');
  readonly filtroDominio = signal<string>('');

  // Multi-selection state
  readonly selectedCETS = signal<Set<string>>(new Set());

  // Modal Assignment Dialog
  readonly assignModalItem = signal<CET | null>(null);
  readonly assignCustomLabel = signal<string>('');
  readonly assignObligatoriedad = signal<CFT['Obligatoriedad']>('OBLIGATORIO');

  // Filtered CET list
  readonly cetFiltrados = computed(() => {
    const list = this.service.cetList();
    const c = this.filtroCodigo().trim().toLowerCase();
    const t = this.filtroTipo().trim().toLowerCase();
    const n = this.filtroNombre().trim().toLowerCase();
    const o = this.filtroObligatorio().trim().toUpperCase();
    const td = this.filtroTipoDato().trim().toUpperCase();
    const ld = this.filtroLongDato().trim();
    const ldec = this.filtroLongDec().trim();
    const a = this.filtroAcceso().trim().toUpperCase();
    const v = this.filtroVisible().trim().toUpperCase();
    const dom = this.filtroDominio().trim().toLowerCase();

    return list.filter(item => {
      if (c && !item.Codigo.toLowerCase().includes(c)) return false;
      if (t && item.Tipo.toLowerCase() !== t) return false;
      if (n && !item.Nombre.toLowerCase().includes(n) && (!item.Descripcion || !item.Descripcion.toLowerCase().includes(n))) return false;
      if (o && item.Obligatorio !== o) return false;
      if (td && item.TipoDato !== td) return false;
      if (ld && String(item.LongDato) !== ld) return false;
      if (ldec && String(item.LongDec) !== ldec) return false;
      if (a && item.Acceso !== a) return false;
      if (v && item.Visible !== v) return false;
      if (dom && !item.Dominio.toLowerCase().includes(dom)) return false;
      return true;
    });
  });

  onSelectFCT(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectFCT(val);
  }

  getAssignedSequence(codigoCET: string): number | null {
    const activeFCTCode = this.service.selectedFCTCode();
    const cft = this.service.cftList().find(c => c.CdgFTr === activeFCTCode && c.CdgCET === codigoCET);
    return cft ? cft.Secuencia : null;
  }

  limpiarFiltros() {
    this.filtroCodigo.set('');
    this.filtroTipo.set('');
    this.filtroNombre.set('');
    this.filtroObligatorio.set('');
    this.filtroTipoDato.set('');
    this.filtroLongDato.set('');
    this.filtroLongDec.set('');
    this.filtroAcceso.set('');
    this.filtroVisible.set('');
    this.filtroDominio.set('');
  }

  toggleSelection(code: string) {
    this.selectedCETS.update(set => {
      const copy = new Set(set);
      if (copy.has(code)) copy.delete(code);
      else copy.add(code);
      return copy;
    });
  }

  isAllSelected(): boolean {
    const current = this.cetFiltrados();
    return current.length > 0 && current.every(c => this.selectedCETS().has(c.Codigo));
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      const allCodes = this.cetFiltrados().map(c => c.Codigo);
      this.selectedCETS.set(new Set(allCodes));
    } else {
      this.selectedCETS.set(new Set());
    }
  }

  clearSelection() {
    this.selectedCETS.set(new Set());
  }

  openAssignDialog(item: CET) {
    this.assignModalItem.set(item);
    this.assignCustomLabel.set(item.Nombre);
    this.assignObligatoriedad.set(item.Obligatorio === 'S' ? 'OBLIGATORIO' : 'OPCIONAL');
  }

  confirmAssignSingle(item: CET) {
    const res = this.service.assignCETToFCT(
      this.service.selectedFCTCode(),
      item,
      this.assignCustomLabel(),
      this.assignObligatoriedad()
    );
    if (res.success) {
      this.assignModalItem.set(null);
    } else {
      alert(res.message);
    }
  }

  assignBatchToActiveFCT() {
    const activeFCT = this.service.selectedFCTCode();
    const selectedCodes = Array.from(this.selectedCETS());
    let addedCount = 0;

    for (const code of selectedCodes) {
      const cet = this.service.cetList().find(c => c.Codigo === code);
      if (cet) {
        const res = this.service.assignCETToFCT(activeFCT, cet);
        if (res.success) addedCount++;
      }
    }

    this.selectedCETS.set(new Set());
    alert(`Se agregaron exitosamente ${addedCount} campos al trámite ${activeFCT}.`);
    this.service.activeTab.set('cft');
  }
}
