import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../services/tramites';
import { CFT } from '../models/tramite.models';

@Component({
  selector: 'app-cft-crud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="space-y-6">

      <!-- Top Banner - Active FCT context in pure white aesthetic -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <mat-icon class="text-xl">dashboard_customize</mat-icon>
            </div>
            @if (service.selectedFCT(); as fct) {
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-lg font-bold text-slate-900 tracking-tight">
                    CFT — Campos del Formulario de Trámite
                  </h2>
                  <span class="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {{ fct.Codigo }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ fct.Descripcion }} • Empresa: {{ fct.CdgEm }} • Tipo: {{ fct.Tipo }}
                </p>
              </div>
            }
          </div>

          <!-- Actions Group -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Selector to quickly switch between FCTs -->
            <select
              [value]="service.selectedFCTCode()"
              (change)="onFCTChange($event)"
              class="bg-white text-xs border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              @for (f of service.fctList(); track f.Codigo) {
                <option [value]="f.Codigo">
                  {{ f.Codigo }} — {{ f.Descripcion }}
                </option>
              }
            </select>

            <!-- 1. Crear CFT Manual -->
            <button
              (click)="openCreateModal()"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <mat-icon class="text-base">add_circle</mat-icon>
              <span>1. ➕ Crear</span>
            </button>

            <!-- Shortcut to Buscador CET -->
            <button
              (click)="service.activeTab.set('cet')"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <mat-icon class="text-base text-slate-500">search</mat-icon>
              <span>Añadir desde CET</span>
            </button>

            <!-- 8.3 Toggle Historial -->
            <button
              (click)="showHistorial.set(!showHistorial())"
              [class]="showHistorial() ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-white text-slate-700 border-slate-300'"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-xl shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              title="8.3 Consultar historial de modificaciones en este trámite"
            >
              <mat-icon class="text-base text-amber-600">history</mat-icon>
              <span>8.3 Historial</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800">
                {{ fctHistorial().length }}
              </span>
            </button>
          </div>

        </div>

        <!-- Metrics inside CFT -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Campos Asignados</span>
            <div class="text-lg font-bold text-slate-900 mt-0.5">{{ cftList().length }}</div>
          </div>
          <div class="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
            <span class="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Campos Obligatorios</span>
            <div class="text-lg font-bold text-rose-700 mt-0.5">{{ countObligatorios() }}</div>
          </div>
          <div class="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
            <span class="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Controles de Captura</span>
            <div class="text-lg font-bold text-blue-700 mt-0.5">{{ countRegistro() }}</div>
          </div>
          <div class="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <span class="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Visibles en Pantalla</span>
            <div class="text-lg font-bold text-emerald-700 mt-0.5">{{ countVisibles() }}</div>
          </div>
        </div>

      </div>

      <!-- 8.3 HISTORIAL AUDIT VIEW (Si está abierto) -->
      @if (showHistorial()) {
        <div class="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs animate-in fade-in duration-150">
          <div class="flex items-center justify-between pb-3 border-b border-amber-100">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <mat-icon class="text-base">history_edu</mat-icon>
              </span>
              <div>
                <h3 class="text-sm font-bold text-slate-900">8.3 Historial de Auditoría de Campos (CFT)</h3>
                <p class="text-[11px] text-slate-500">Trazabilidad de modificaciones, adiciones, reordenamiento y bajas</p>
              </div>
            </div>

            <button
              (click)="showHistorial.set(false)"
              class="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <mat-icon class="text-base">close</mat-icon>
            </button>
          </div>

          <div class="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200 text-left text-xs bg-white">
              <thead class="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th scope="col" class="py-2.5 px-3">Fecha y Hora</th>
                  <th scope="col" class="py-2.5 px-3">Usuario</th>
                  <th scope="col" class="py-2.5 px-3 text-center">Acción</th>
                  <th scope="col" class="py-2.5 px-3">Campo / Secuencia</th>
                  <th scope="col" class="py-2.5 px-3">Modificación</th>
                  <th scope="col" class="py-2.5 px-3">Valor Anterior</th>
                  <th scope="col" class="py-2.5 px-3">Valor Nuevo</th>
                  <th scope="col" class="py-2.5 px-3">Motivo / Detalle</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                @for (hist of fctHistorial(); track hist.id) {
                  <tr class="hover:bg-slate-50">
                    <td class="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">{{ hist.fecha }}</td>
                    <td class="py-2 px-3 whitespace-nowrap font-medium text-slate-800">{{ hist.usuario }}</td>
                    <td class="py-2 px-3 text-center whitespace-nowrap">
                      @switch (hist.accion) {
                        @case ('CREAR') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ALTA</span>
                        }
                        @case ('ACTUALIZAR') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">MODIF</span>
                        }
                        @case ('ELIMINAR') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">BAJA</span>
                        }
                        @case ('REORDENAR') {
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">ORDEN</span>
                        }
                      }
                    </td>
                    <td class="py-2 px-3 whitespace-nowrap font-mono text-slate-700">
                      Sec. {{ hist.secuencia }} ({{ hist.cdgCET }})
                    </td>
                    <td class="py-2 px-3 font-semibold text-slate-800">{{ hist.campoModificado }}</td>
                    <td class="py-2 px-3 text-slate-500 truncate max-w-[120px]">{{ hist.valorAnterior }}</td>
                    <td class="py-2 px-3 text-slate-900 font-medium truncate max-w-[140px]">{{ hist.valorNuevo }}</td>
                    <td class="py-2 px-3 text-slate-500 italic max-w-xs truncate">{{ hist.motivo || '—' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="py-6 text-center text-slate-400">
                      No hay registros en el historial de este trámite aún.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- 2. Leer / Consultar CFT - Lista de campos ordenados por Secuencia -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>2. 👁️ Tabla CFT — Campos Configurados</span>
              <span class="text-xs font-normal text-slate-400">(Ordenados por Secuencia)</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Utilice los controles de flecha para reorganizar el orden de captura en la interfaz ciudadana.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="service.activeTab.set('preview')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              <mat-icon class="text-base text-emerald-600">visibility</mat-icon>
              <span>Probar en Previsualizador</span>
            </button>
          </div>
        </div>

        <!-- Tabla CFT en fondo blanco nítido -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-left text-xs bg-white">
            <thead class="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" class="py-3 px-3">Trámite</th>
                <th scope="col" class="py-3 px-3.5">Elemento de trámite</th>
                <th scope="col" class="py-3 px-3.5">Tipo de elemento</th>
                <th scope="col" class="py-3 px-3.5">Obligatoriedad</th>
                <th scope="col" class="py-3 px-3.5">Valor(es) posibles</th>
                <th scope="col" class="py-3 px-3.5">Etiqueta </th>
                <th scope="col" class="py-3 px-3 text-center">Registro</th>
                <th scope="col" class="py-3 px-3 text-center">Mostrar</th>
                <th scope="col" class="py-3 px-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
              @for (item of cftList(); track item.Secuencia; let idx = $index; let total = $count) {
                <tr class="hover:bg-slate-50 transition-colors">
                          <!-- CdgFTr -->
                  <td class="py-3 px-3.5 max-w-xs">
                    <p class="font-semibold text-slate-900">{{ item.CdgFTr }}</p>
                    @if (item.CdgFTr || item.Ayuda) {
                      <span class="text-[10px] text-slate-400 block truncate">
                        {{ item.CdgFTr || item.Ayuda }}
                      </span>
                    }
                  </td>

        <!-- CdgCET -->
                  <td class="py-3 px-3.5 max-w-xs">
                    <p class="font-semibold text-slate-900">{{ item.CdgCET }}</p>
                    @if (item.CdgCET || item.Ayuda) {
                      <span class="text-[10px] text-slate-400 block truncate">
                        {{ item.CdgCET || item.Ayuda }}
                      </span>
                    }
                  </td>
                  
        <!-- Etiqueta -->
             

                 
                  <!-- CdgCET -->
                  <td class="py-3 px-3.5 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {{ item.CdgCET }}
                  </td>

                  <!-- CdgTipo -->
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {{ item.CdgTipo }}
                    </span>
                  </td>

                  <!-- Obligatoriedad -->
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    @switch (item.Obligatoriedad) {
                      @case ('OBLIGATORIO') {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                          OBLIGATORIO
                        </span>
                      }
                      @case ('OPCIONAL') {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          OPCIONAL
                        </span>
                      }
                      @case ('CONDICIONAL') {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          CONDICIONAL
                        </span>
                      }
                      @default {
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500">
                          {{ item.Obligatoriedad }}
                        </span>
                      }
                    }
                  </td>

                  <!-- Dominio -->
                  <td class="py-3 px-3.5 max-w-[130px] truncate font-mono text-[11px] text-slate-600" [title]="item.Dominio">
                    {{ item.Dominio }}
                  </td>

                  <!-- Registro ('S'/'N') -->
                  <td class="py-3 px-3 text-center whitespace-nowrap">
                    @if (item.Registro === 'S') {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">S</span>
                    } @else {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">N</span>
                    }
                  </td>

                  <!-- Mostrar ('S'/'N') -->
                  <td class="py-3 px-3 text-center whitespace-nowrap">
                    @if (item.Mostrar === 'S') {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">S</span>
                    } @else {
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">N</span>
                    }
                  </td>

                  <!-- Acciones (3. Editar / 4. Eliminar) -->
                  <td class="py-3 px-3.5 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <!-- 3. Editar CFT -->
                      <button
                        (click)="openEditModal(item)"
                        title="3. Modificar propiedades del campo"
                        class="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <mat-icon class="text-base">edit</mat-icon>
                      </button>

                      <!-- 4. Eliminar CFT -->
                      <button
                        (click)="openDeleteModal(item)"
                        title="4. Eliminar campo del trámite"
                        class="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <mat-icon class="text-base">delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="10" class="py-12 text-center text-slate-400">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <mat-icon class="text-4xl text-slate-300">layers_clear</mat-icon>
                      <p class="text-sm font-medium text-slate-600">Este trámite aún no tiene campos CFT configurados.</p>
                      <div class="flex items-center gap-3 mt-2">
                        <button
                          (click)="service.activeTab.set('cet')"
                          class="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Ir al Buscador CET para asignar campos
                        </button>
                        <button
                          (click)="openCreateModal()"
                          class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                        >
                          1. ➕ Crear Manualmente
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
          <span>Total campos en este formulario: {{ cftList().length }}</span>
          <span class="text-[11px] text-slate-400">Validación del sistema: La obligatoriedad es obligatoria</span>
        </div>

      </div>

      <!-- ========================================== -->
      <!-- 1. CREAR / 3. EDITAR CFT MODAL             -->
      <!-- ========================================== -->
      @if (modalFormOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2">
                <div [class]="isEditing() ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'" class="w-8 h-8 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-lg">{{ isEditing() ? 'edit' : 'add_box' }}</mat-icon>
                </div>
                <div>
                  
                  <h3 class="text-base font-bold text-slate-900">
                    {{ isEditing() ? ' Editar' : ' Crear' }}
                  </h3>
                
                </div>
              </div>

              <button
                (click)="closeFormModal()"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <mat-icon class="text-xl">close</mat-icon>
              </button>
            </div>

            <!-- Error banner -->
            @if (formErrorMsg()) {
              <div class="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <mat-icon class="text-rose-600 text-base mt-0.5">error</mat-icon>
                <div>
                  <strong class="font-semibold">Validación:</strong>
                  <p class="mt-0.5">{{ formErrorMsg() }}</p>
                </div>
              </div>
            }

            <form [formGroup]="cftForm" (ngSubmit)="saveCFT()" class="p-6 space-y-4">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <!-- CdgEm -->
                <div>
                  <!-- <label class="block font-semibold text-slate-700 mb-1">
                    Empresa <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="CdgEm"
                    class="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  /> -->
                </div>

                <!-- CdgFTr -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Trámite <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="CdgFTr"
                    readonly
                    class="w-full text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-600 cursor-not-allowed outline-none"
                  />
                </div>

                <!-- Secuencia 
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Secuencia <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    formControlName="Secuencia"
                    class="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
-->
                <!-- CdgCET -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Elemento de trámite <span class="text-rose-500">*</span>
                  </label>
                  <select
                    formControlName="CdgCET"
                    (change)="onCETSelectChange($event)"
                    class="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    @for (cet of service.cetList(); track cet.Codigo) {
                      <option [value]="cet.Codigo">{{ cet.Codigo }} — {{ cet.Nombre }}</option>
                    }
                  </select>
                </div>

                <!-- Etiqueta -->
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Etiqueta  <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="Etiqueta"
                    placeholder="Título del campo en el formulario..."
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- CdgTipo -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Tipo de elemento  <span class="text-rose-500">*</span>
                  </label>
                  <select
                    formControlName="CdgTipo"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INPUT">INPUT (Texto estándar)</option>
                    <option value="SELECT">SELECT (Lista desplegable)</option>
                    <option value="DATE">DATE (Selector de fecha)</option>
                    <option value="TEXTAREA">TEXTAREA (Párrafo multilinea)</option>
                    <option value="NUMBER">NUMBER (Numérico / Moneda)</option>
                    <option value="FILE">FILE (Carga de archivo adjunto)</option>
                    <option value="CHECKBOX">CHECKBOX (Casilla de verificación)</option>
                    <option value="RADIO">RADIO (Opción única)</option>
                  </select>
                </div>

                <!-- Obligatoriedad (Validación crítica exigida) -->
                <div>
                  <div class="flex items-center justify-between">
                    <label class="block font-semibold text-slate-700 mb-1">
                      Obligatoriedad <span class="text-rose-500">*</span>
                    </label>
                    <span class="text-[10px] text-rose-600 font-bold">Campo obligatorio</span>
                  </div>
                  <select
                    formControlName="Obligatoriedad"
                    class="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="OBLIGATORIO">OBLIGATORIO</option>
                    <option value="OPCIONAL">OPCIONAL</option>
                    <option value="CONDICIONAL">CONDICIONAL</option>
                    <option value="DESHABILITADO">DESHABILITADO</option>
                  </select>
                </div>

                <!-- Dominio -->
                <div class="sm:col-span-2">
                  <label class="block font-semibold text-slate-700 mb-1">
                    Dominio  <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    formControlName="Dominio"
                    placeholder="Ej. DOM_TIPOS_IDENTIFICACION, TEXTO_GENERAL, etc."
                    class="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Registro ('S'/'N') -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Registro  <span class="text-rose-500">*</span>
                  </label>
                  <select
                    formControlName="Registro"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="S">S (Permite captura / edición)</option>
                    <option value="N">N (Sólo lectura / bloqueado)</option>
                  </select>
                </div>

                <!-- Mostrar ('S'/'N') -->
                <div>
                  <label class="block font-semibold text-slate-700 mb-1">
                    Mostrar  <span class="text-rose-500">*</span>
                  </label>
                  <select
                    formControlName="Mostrar"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="S">S (Visible en formulario)</option>
                    <option value="N">N (Oculto en formulario)</option>
                  </select>
                </div>

            

              </div>

              <!-- Modal Footer -->
              <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="closeFormModal()"
                  class="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <span>{{ isEditing() ? 'Aceptar' : 'Aceptar' }}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- 4. ELIMINAR CFT MODAL                      -->
      <!-- ========================================== -->
      @if (deleteModalItem(); as item) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center">
            
            <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <mat-icon class="text-2xl">delete</mat-icon>
            </div>

            <h3 class="text-base font-bold text-slate-900">❌ Eliminar </h3>
            <p class="text-xs text-slate-500 mt-1">
              ¿Desea eliminar ?
            </p>

            <div class="mt-5 flex items-center justify-center gap-2">
              <button
                (click)="closeDeleteModal()"
                class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                (click)="confirmDelete(item)"
                class="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Eliminar 
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CftCrudComponent {
  readonly service = inject(TramitesService);

  readonly showHistorial = signal<boolean>(false);
  readonly modalFormOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly formErrorMsg = signal<string | null>(null);
  readonly deleteModalItem = signal<CFT | null>(null);

  // Form with strict Obligatoriedad validation
  readonly cftForm = new FormGroup({
    CdgEm: new FormControl('EMP01', [Validators.required]),
    CdgFTr: new FormControl('', [Validators.required]),
    Secuencia: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    CdgCET: new FormControl('CET_NUM_DOC', [Validators.required]),
    CdgTipo: new FormControl('INPUT', [Validators.required]),
    // Validación requerida explícita: "El sistema dice que la obligatoriedad es obligatoria."
    Obligatoriedad: new FormControl<CFT['Obligatoriedad']>('OBLIGATORIO', [Validators.required]),
    Dominio: new FormControl('TEXTO_GENERAL', [Validators.required]),
    Etiqueta: new FormControl('', [Validators.required, Validators.minLength(2)]),
    Registro: new FormControl<'S' | 'N'>('S', [Validators.required]),
    Mostrar: new FormControl<'S' | 'N'>('S', [Validators.required]),
    Placeholder: new FormControl('')
  });

  // Current FCT's CFT list
  readonly cftList = computed(() => this.service.selectedFCTCftList());

  // Current FCT's audit history (8.3)
  readonly fctHistorial = computed(() => {
    const fctCode = this.service.selectedFCTCode();
    return this.service.historialList().filter(h => h.cdgFTr === fctCode);
  });

  // Metrics
  readonly countObligatorios = computed(() => this.cftList().filter(c => c.Obligatoriedad === 'OBLIGATORIO').length);
  readonly countRegistro = computed(() => this.cftList().filter(c => c.Registro === 'S').length);
  readonly countVisibles = computed(() => this.cftList().filter(c => c.Mostrar === 'S').length);

  onFCTChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectFCT(val);
  }

  onCETSelectChange(event: Event) {
    const cetCode = (event.target as HTMLSelectElement).value;
    const cet = this.service.cetList().find(c => c.Codigo === cetCode);
    if (cet) {
      if (!this.cftForm.get('Etiqueta')?.value) {
        this.cftForm.patchValue({ Etiqueta: cet.Nombre });
      }
      this.cftForm.patchValue({
        CdgTipo: cet.Tipo,
        Dominio: cet.Dominio,
        Obligatoriedad: cet.Obligatorio === 'S' ? 'OBLIGATORIO' : 'OPCIONAL'
      });
    }
  }

  moveUp(idx: number) {
    if (idx > 0) {
      this.service.reorderCFT(this.service.selectedFCTCode(), idx, idx - 1);
    }
  }

  moveDown(idx: number) {
    if (idx < this.cftList().length - 1) {
      this.service.reorderCFT(this.service.selectedFCTCode(), idx, idx + 1);
    }
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.formErrorMsg.set(null);
    const activeFCT = this.service.selectedFCT();
    const currentCfts = this.service.selectedFCTCftList();
    const nextSeq = currentCfts.length > 0 ? Math.max(...currentCfts.map(c => c.Secuencia)) + 1 : 1;

    const firstCet = this.service.cetList()[0];

    this.cftForm.reset({
      CdgEm: activeFCT?.CdgEm || 'EMP01',
      CdgFTr: activeFCT?.Codigo || this.service.selectedFCTCode(),
      Secuencia: nextSeq,
      CdgCET: firstCet?.Codigo || 'CET_NUM_DOC',
      CdgTipo: firstCet?.Tipo || 'INPUT',
      Obligatoriedad: 'OBLIGATORIO',
      Dominio: firstCet?.Dominio || 'TEXTO_GENERAL',
      Etiqueta: firstCet?.Nombre || '',
      Registro: 'S',
      Mostrar: 'S',
      Placeholder: ''
    });
    this.modalFormOpen.set(true);
  }

  openEditModal(item: CFT) {
    this.isEditing.set(true);
    this.formErrorMsg.set(null);
    this.cftForm.setValue({
      CdgEm: item.CdgEm,
      CdgFTr: item.CdgFTr,
      Secuencia: item.Secuencia,
      CdgCET: item.CdgCET,
      CdgTipo: item.CdgTipo,
      Obligatoriedad: item.Obligatoriedad,
      Dominio: item.Dominio,
      Etiqueta: item.Etiqueta,
      Registro: item.Registro,
      Mostrar: item.Mostrar,
      Placeholder: item.Placeholder || ''
    });
    this.modalFormOpen.set(true);
  }

  closeFormModal() {
    this.modalFormOpen.set(false);
    this.formErrorMsg.set(null);
  }

  saveCFT() {
    this.formErrorMsg.set(null);
    const val = this.cftForm.getRawValue();

    // Requisito estricto: "Validación: El sistema dice que la obligatoriedad es obligatoria."
    if (!val.Obligatoriedad) {
      this.formErrorMsg.set('El sistema dice que la obligatoriedad es obligatoria.');
      return;
    }
    if (!val.Etiqueta || !val.Etiqueta.trim()) {
      this.formErrorMsg.set('La Etiqueta visible del campo es obligatoria.');
      return;
    }
    if (!val.CdgCET) {
      this.formErrorMsg.set('Debe seleccionar un código de elemento CET.');
      return;
    }

    if (this.isEditing()) {
      // 3. Modificar CFT
      const res = this.service.updateCFT(
        val.CdgFTr || this.service.selectedFCTCode(),
        Number(val.Secuencia),
        {
          CdgEm: val.CdgEm || 'EMP01',
          CdgTipo: val.CdgTipo || 'INPUT',
          Obligatoriedad: val.Obligatoriedad,
          Dominio: val.Dominio || 'TEXTO_GENERAL',
          Etiqueta: val.Etiqueta.trim(),
          Registro: val.Registro || 'S',
          Mostrar: val.Mostrar || 'S',
          Placeholder: val.Placeholder || ''
        }
      );

      if (!res.success) {
        this.formErrorMsg.set(res.message);
        return;
      }
    } else {
      // 1. Crear CFT
      const res = this.service.addCFT({
        CdgEm: val.CdgEm || 'EMP01',
        CdgFTr: val.CdgFTr || this.service.selectedFCTCode(),
        Secuencia: Number(val.Secuencia),
        CdgCET: val.CdgCET,
        CdgTipo: val.CdgTipo || 'INPUT',
        Obligatoriedad: val.Obligatoriedad,
        Dominio: val.Dominio || 'TEXTO_GENERAL',
        Etiqueta: val.Etiqueta.trim(),
        Registro: val.Registro || 'S',
        Mostrar: val.Mostrar || 'S',
        Placeholder: val.Placeholder || ''
      });

      if (!res.success) {
        this.formErrorMsg.set(res.message);
        return;
      }
    }

    this.closeFormModal();
  }

  // 4. Eliminar CFT
  openDeleteModal(item: CFT) {
    this.deleteModalItem.set(item);
  }

  closeDeleteModal() {
    this.deleteModalItem.set(null);
  }

  confirmDelete(item: CFT) {
    this.service.deleteCFT(item.CdgFTr, item.Secuencia);
    this.closeDeleteModal();
  }
}
