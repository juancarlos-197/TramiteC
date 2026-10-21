import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../services/tramites';
import { FCT } from '../models/tramite.models';

@Component({
  selector: 'app-fct-crud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="space-y-6">

      <!-- Header & Stats Summary -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700">
                <mat-icon class="text-lg">description</mat-icon>
              </span>
              <h2 class="text-xl font-bold text-slate-900 tracking-tight">FCT — Ficha de Control de Trámites</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1 max-w-2xl">
              Catálogo maestro de trámites, vigencias, dependencias jerárquicas y procesos generadores.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="openCreateModal()"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <mat-icon class="text-base text-slate-500">add</mat-icon>
              <span>Crear </span>
            </button>
          </div>
        </div>

        <!-- Quick Metrics KPI Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div class="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
            <span class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Trámites FCT</span>
            <div class="text-xl font-bold text-slate-900 mt-1">{{ totalFCTs() }}</div>
          </div>
          <div class="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <span class="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Activos en Vigencia</span>
            <div class="text-xl font-bold text-emerald-700 mt-1">{{ totalActivos() }}</div>
          </div>
          <div class="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
            <span class="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Inactivos / Bajas</span>
            <div class="text-xl font-bold text-amber-700 mt-1">{{ totalInactivos() }}</div>
          </div>
          <div class="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
            <span class="text-[11px] font-medium text-blue-700 uppercase tracking-wider">Empresas Registradas</span>
            <div class="text-xl font-bold text-blue-700 mt-1">{{ totalEmpresas() }}</div>
          </div>
        </div>
      </div>

      <!-- 2. Leer / Consultar FCT: 2.1 Búsqueda y 2.2 Filtros -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        <!-- Search Bar Row -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <!-- 2.1 Búsqueda Rápida -->
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <mat-icon class="text-slate-400 text-lg">search</mat-icon>
            </div>
            <input
              type="text"
              [value]="filtroBusqueda()"
              (input)="onSearchInput($event)"
              placeholder="2.1 Buscar por Código (ej. FCT-SOL-001), descripción, empresa o tipo..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
            @if (filtroBusqueda()) {
              <button
                (click)="filtroBusqueda.set('')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <mat-icon class="text-base">close</mat-icon>
              </button>
            }
          </div>

          <!-- 2.2 Toggle Filtros Avanzados -->
          <div class="flex items-center gap-2">
            <button
              (click)="toggleFiltrosAvanzados()"
              [class]="filtrosAbiertos() ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-200'"
              class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <mat-icon class="text-base">tune</mat-icon>
              <span>2.2 Filtros Avanzados</span>
              @if (filtrosActivosCount() > 0) {
                <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {{ filtrosActivosCount() }}
                </span>
              }
            </button>

            @if (filtrosActivosCount() > 0 || filtroBusqueda()) {
              <button
                (click)="limpiarFiltros()"
                class="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 border border-transparent rounded-xl transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <mat-icon class="text-sm">filter_alt_off</mat-icon>
                <span class="hidden sm:inline">Limpiar</span>
              </button>
            }
          </div>
        </div>

        <!-- 2.2 Panel de Filtros Desplegable -->
        @if (filtrosAbiertos()) {
          <div class="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3">
            <!-- Filtro Empresa CdgEm -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">CdgEm (Empresa)</label>
              <select
                [value]="filtroEmpresa()"
                (change)="filtroEmpresa.set($any($event.target).value)"
                class="w-full bg-white text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todas las empresas</option>
                <option value="EMP01">EMP01 - Matriz Central</option>
                <option value="EMP02">EMP02 - Sucursal Regional</option>
              </select>
            </div>

            <!-- Filtro Tipo -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Formulario</label>
              <select
                [value]="filtroTipo()"
                (change)="filtroTipo.set($any($event.target).value)"
                class="w-full bg-white text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="SOLICITUD">SOLICITUD</option>
                <option value="LIQUIDACION">LIQUIDACION</option>
                <option value="DECLARACION">DECLARACION</option>
                <option value="REGISTRO">REGISTRO</option>
                <option value="NOTIFICACION">NOTIFICACION</option>
              </select>
            </div>

            <!-- Filtro Estado -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Estado</label>
              <select
                [value]="filtroEstado()"
                (change)="filtroEstado.set($any($event.target).value)"
                class="w-full bg-white text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>

            <!-- Filtro Fecha Desde -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Vigencia Desde</label>
              <input
                type="date"
                [value]="filtroFechaDesde()"
                (change)="filtroFechaDesde.set($any($event.target).value)"
                class="w-full bg-white text-xs border border-slate-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <!-- Filtro Fecha Hasta -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Vigencia Hasta</label>
              <input
                type="date"
                [value]="filtroFechaHasta()"
                (change)="filtroFechaHasta.set($any($event.target).value)"
                class="w-full bg-white text-xs border border-slate-300 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        }

        <!-- 2. Tabla de FCTs (Diseño Blanco Puro y Alta Densidad) -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200 text-left text-xs bg-white">
            <thead class="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" class="py-3 px-3.5">CdgEm</th>
                <th scope="col" class="py-3 px-3.5">Codigo</th>
                <th scope="col" class="py-3 px-3.5">Tipo</th>
                <th scope="col" class="py-3 px-3.5">CdgTpc</th>
                <th scope="col" class="py-3 px-3.5">CgdPCr</th>
                <th scope="col" class="py-3 px-3.5">CdgPH</th>
                <th scope="col" class="py-3 px-3.5">Creacion</th>
                <th scope="col" class="py-3 px-3.5">CdgPe</th>
                <th scope="col" class="py-3 px-3.5">Desde</th>
                <th scope="col" class="py-3 px-3.5">Hasta</th>
                <th scope="col" class="py-3 px-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
              @for (item of fctFiltrados(); track item.Codigo) {
                <tr
                  [class.bg-blue-50]="service.selectedFCTCode() === item.Codigo"
                  class="hover:bg-slate-50/80 transition-colors"
                >
                  <!-- CdgEm -->
                  <td class="py-3 px-3.5 font-mono text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {{ item.CdgEm }}
                    </span>
                  </td>

                  <!-- Codigo -->
                  <td class="py-3 px-3.5 font-mono text-xs font-bold text-blue-700 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                      <button
                        (click)="selectAndNavigateCFT(item.Codigo)"
                        title="Seleccionar trámite y ver campos"
                        class="hover:underline flex items-center gap-1 text-blue-700 font-semibold cursor-pointer"
                      >
                        {{ item.Codigo }}
                      </button>
                      @if (service.selectedFCTCode() === item.Codigo) {
                        <span class="w-2 h-2 rounded-full bg-blue-600" title="Trámite activo en sesión"></span>
                      }
                    </div>
                  </td>

                  <!-- Tipo -->
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-100 text-slate-800 border-slate-200">
                      {{ item.Tipo }}
                    </span>
                  </td>

                  <!-- CdgTpc -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-600">
                    {{ item.CdgTpc }}
                  </td>

                  <!-- CgdPCr -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-600">
                    {{ item.CdgPCr }}
                  </td>

                  <!-- CdgPH -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-600">
                    {{ item.CodigoPH || '—' }}
                  </td>

                  <!-- Creacion -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-600">
                    {{ item.Creacion }}
                  </td>

                  <!-- CdgPe -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-600">
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-50 text-slate-600 border border-slate-200">
                      {{ item.CdgPe }}
                    </span>
                  </td>

                  <!-- Desde -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-600">
                    <div class="flex items-center gap-1">
                      <mat-icon class="text-xs text-slate-400">calendar_today</mat-icon>
                      <span>{{ item.Desde }}</span>
                    </div>
                  </td>

                  <!-- Hasta -->
                  <td class="py-3 px-3.5 whitespace-nowrap text-[11px] text-slate-600">
                    <div class="flex items-center gap-1">
                      <mat-icon class="text-xs text-slate-400">event</mat-icon>
                      <span>{{ item.Hasta || '—' }}</span>
                    </div>
                  </td>

                  <!-- Acciones -->
                  <td class="py-3 px-3.5 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <!-- 3. Editar FCT -->
                      <button
                        (click)="openEditModal(item)"
                        title="3. Modificar FCT (Código bloqueado)"
                        class="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <mat-icon class="text-base">edit</mat-icon>
                      </button>

                      <!-- 4. Eliminar / Inactivar FCT -->
                      <button
                        (click)="openDeleteModal(item)"
                        title="4. Inactivar o Eliminar FCT"
                        class="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <mat-icon class="text-base">delete_outline</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="11" class="py-12 text-center text-slate-400">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <mat-icon class="text-4xl text-slate-300">search_off</mat-icon>
                      <p class="text-sm font-medium text-slate-600">No se encontraron trámites con los filtros especificados.</p>
                      <button
                        (click)="limpiarFiltros()"
                        class="mt-1 text-xs text-blue-600 hover:underline cursor-pointer"
                      >
                        Restablecer filtros de búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
          <span>Mostrando {{ fctFiltrados().length }} de {{ service.fctList().length }} trámites FCT</span>
          <span class="text-[11px] text-slate-400">Restricción: Códigos identificadores son inmutables en actualización</span>
        </div>

      </div>

      <!-- ========================================== -->
      <!-- 1. MODAL: CREAR / 3. EDITAR FCT           -->
      <!-- ========================================== -->
      @if (modalFormOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2.5">
                <div [class]="isEditing() ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'" class="w-8 h-8 rounded-lg flex items-center justify-center">
                  <mat-icon class="text-lg">{{ isEditing() ? 'edit_note' : 'post_add' }}</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">
                    {{ isEditing() ? 'Editar ' : 'Crear ' }}
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

            <!-- Validation Error Alert -->
            @if (formErrorMsg()) {
              <div class="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <mat-icon class="text-rose-600 text-base mt-0.5">error_outline</mat-icon>
                <div>
                  <strong class="font-semibold">Error de validación:</strong>
                  <p class="mt-0.5">{{ formErrorMsg() }}</p>
                </div>
              </div>
            }

            <!-- Form Content -->
            <form [formGroup]="fctForm" (ngSubmit)="saveFCT()" class="p-6 space-y-4">
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <!-- Codigo (Identificador Único) -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Codigo
                  </label>
                  <input
                    type="text"
                    formControlName="Codigo"
                    placeholder="Ej. FCT-SOL-005"
                    [attr.disabled]="isEditing() ? true : null"
                    [class.bg-slate-100]="isEditing()"
                    [class.cursor-not-allowed]="isEditing()"
                    class="w-full text-xs font-mono uppercase bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  @if (fctForm.get('Codigo')?.touched && fctForm.get('Codigo')?.invalid) {
                    <p class="text-[10px] text-rose-600 mt-1">El código es obligatorio y debe tener al menos 3 caracteres.</p>
                  }
                </div>

                <!-- CdgEm -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Empresa
                  </label>
                  <select
                    formControlName="CdgEm"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMP01">EMP01 - Corporación Principal</option>
                    <option value="EMP02">EMP02 - Sucursal Regional</option>
                    <option value="EMP03">EMP03 - División Servicios</option>
                  </select>
                </div>

                <!-- CdgTpc -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    CdgTpc
                  </label>
                  <input
                    type="text"
                    formControlName="CdgTpc"
                    placeholder="Ej. TPC-SOLICITUD"
                    class="w-full text-xs font-mono uppercase bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- CdgPCr -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    CdgPCr
                  </label>
                  <input
                    type="text"
                    formControlName="CdgPCr"
                    placeholder="Ej. PCR-VENTANILLA-DIGITAL"
                    class="w-full text-xs font-mono uppercase bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- CodigoPH -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    CodigoPH
                  </label>
                  <input
                    type="text"
                    formControlName="CodigoPH"
                    placeholder="Ej. PH-ROOT-001"
                    class="w-full text-xs font-mono uppercase bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Tipo -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo
                  </label>
                  <select
                    formControlName="Tipo"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SOLICITUD">SOLICITUD</option>
                    <option value="LIQUIDACION">LIQUIDACION</option>
                    <option value="DECLARACION">DECLARACION</option>
                    <option value="REGISTRO">REGISTRO</option>
                    <option value="NOTIFICACION">NOTIFICACION</option>
                  </select>
                </div>

                <!-- CdgPe -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    CdgPe
                  </label>
                  <select
                    formControlName="CdgPe"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UNICO">UNICO</option>
                    <option value="MENSUAL">MENSUAL</option>
                    <option value="ANUAL">ANUAL</option>
                    <option value="SEMESTRAL">SEMESTRAL</option>
                    <option value="TRIMESTRAL">TRIMESTRAL</option>
                  </select>
                </div>

                <!-- Creacion -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Creacion
                  </label>
                  <input
                    type="date"
                    formControlName="Creacion"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Desde -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Desde
                  </label>
                  <input
                    type="date"
                    formControlName="Desde"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Hasta -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    Hasta
                  </label>
                  <input
                    type="date"
                    formControlName="Hasta"
                    class="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              <!-- Footer Buttons -->
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
                  class="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Aceptar
                </button>
              </div>

            </form>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- 2.3 MODAL DETALLE DE FCT                   -->
      <!-- ========================================== -->
      @if (detalleModalItem(); as item) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <mat-icon class="text-lg">info</mat-icon>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">2.3 Ficha Técnica Detallada — FCT</h3>
                  <p class="text-[11px] text-slate-500 font-mono">{{ item.Codigo }}</p>
                </div>
              </div>

              <button
                (click)="detalleModalItem.set(null)"
                class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <mat-icon class="text-xl">close</mat-icon>
              </button>
            </div>

            <div class="p-6 space-y-5">
              
              <!-- Quick Info Badge Banner -->
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span class="text-[11px] text-slate-500 block">Denominación</span>
                  <h4 class="text-sm font-bold text-slate-900">{{ item.Descripcion }}</h4>
                </div>
                <div>
                  @if (item.Estado === 'ACTIVO') {
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      ACTIVO
                    </span>
                  } @else {
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                      INACTIVO
                    </span>
                  }
                </div>
              </div>

              <!-- Technical Fields Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">CdgEm (Empresa)</span>
                  <p class="font-bold font-mono text-slate-800 mt-0.5">{{ item.CdgEm }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Tipo Formulario</span>
                  <p class="font-bold text-slate-800 mt-0.5">{{ item.Tipo }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">CdgPe (Período)</span>
                  <p class="font-bold text-slate-800 mt-0.5">{{ item.CdgPe }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">CdgTpc (Tipo Proceso)</span>
                  <p class="font-bold font-mono text-slate-800 mt-0.5">{{ item.CdgTpc }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">CdgPCr (Creador)</span>
                  <p class="font-bold font-mono text-slate-800 mt-0.5">{{ item.CdgPCr }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">CodigoPH (Padre)</span>
                  <p class="font-bold font-mono text-slate-800 mt-0.5">{{ item.CodigoPH || 'N/A' }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Fecha Creación</span>
                  <p class="font-bold text-slate-800 mt-0.5">{{ item.Creacion }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Vigencia Desde</span>
                  <p class="font-bold text-slate-800 mt-0.5">{{ item.Desde }}</p>
                </div>

                <div class="p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Vigencia Hasta</span>
                  <p class="font-bold text-slate-800 mt-0.5">{{ item.Hasta }}</p>
                </div>
              </div>

              @if (item.MotivoInactivacion) {
                <div class="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <span class="font-bold block">Motivo de Inactivación registrado:</span>
                  <p class="mt-0.5">{{ item.MotivoInactivacion }}</p>
                </div>
              }

              <!-- Summary of Assigned CFT fields -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h5 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <mat-icon class="text-sm text-blue-600">view_compact</mat-icon>
                    Campos CFT Asignados ({{ getCamposCount(item.Codigo) }})
                  </h5>
                  <button
                    (click)="selectAndNavigateCFT(item.Codigo)"
                    class="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Ir a Configurar Campos &rarr;
                  </button>
                </div>

                <div class="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-2 space-y-1.5">
                  @for (cft of getCFTsForItem(item.Codigo); track cft.Secuencia) {
                    <div class="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                      <div class="flex items-center gap-2">
                        <span class="w-5 h-5 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600 flex items-center justify-center">
                          {{ cft.Secuencia }}
                        </span>
                        <span class="font-medium text-slate-800">{{ cft.Etiqueta }}</span>
                        <span class="text-[10px] font-mono text-slate-400">{{ cft.CdgCET }}</span>
                      </div>
                      <span [class]="cft.Obligatoriedad === 'OBLIGATORIO' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-100 border-slate-200'" class="px-1.5 py-0.5 rounded text-[10px] font-semibold border">
                        {{ cft.Obligatoriedad }}
                      </span>
                    </div>
                  } @empty {
                    <p class="text-xs text-slate-400 text-center py-4">No tiene campos CFT asignados aún.</p>
                  }
                </div>
              </div>

            </div>

            <div class="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
              <button
                (click)="detalleModalItem.set(null)"
                class="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ========================================== -->
      <!-- 4. MODAL: ELIMINAR / CONFIRMAR INACTIVACIÓN -->
      <!-- ========================================== -->
      @if (deleteModalItem(); as item) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div class="p-6">
          
              <h3 class="text-base font-bold text-slate-900 text-center">¿Está seguro de Eliminar?</h3>
              <p class="text-xs text-slate-500 text-center mt-1">
                ¿Qué acción desea eliminar?
              </p>

         
             

              <div class="mt-6 flex flex-col gap-2">
           
                <!-- 4.1 Eliminar Definitivamente -->
                <button
                  (click)="confirmarEliminacionFisica(item.Codigo)"
                  class="w-full py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <mat-icon class="text-base">delete_forever</mat-icon>
                  <span>Eliminar Definitivamente )</span>
                </button>

                <button
                  (click)="closeDeleteModal()"
                  class="w-full py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class FctCrudComponent {
  readonly service = inject(TramitesService);

  // Filters State (2.1 & 2.2)
  readonly filtroBusqueda = signal<string>('');
  readonly filtroEmpresa = signal<string>('');
  readonly filtroTipo = signal<string>('');
  readonly filtroEstado = signal<string>('');
  readonly filtroFechaDesde = signal<string>('');
  readonly filtroFechaHasta = signal<string>('');
  readonly filtrosAbiertos = signal<boolean>(false);

  // Modals State
  readonly modalFormOpen = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly formErrorMsg = signal<string | null>(null);

  readonly detalleModalItem = signal<FCT | null>(null);
  readonly deleteModalItem = signal<FCT | null>(null);
  readonly motivoInactivacionInput = signal<string>('');

  // Reactive Form
  readonly fctForm = new FormGroup({
    CdgEm: new FormControl('EMP01', [Validators.required]),
    Codigo: new FormControl('', [Validators.required, Validators.minLength(3)]),
    CdgTpc: new FormControl('TPC-SOLICITUD', [Validators.required]),
    CdgPCr: new FormControl('PCR-VENTANILLA', [Validators.required]),
    CodigoPH: new FormControl('PH-ROOT-001'),
    Tipo: new FormControl('SOLICITUD', [Validators.required]),
    Creacion: new FormControl(new Date().toISOString().split('T')[0], [Validators.required]),
    CdgPe: new FormControl('UNICO', [Validators.required]),
    Desde: new FormControl('2026-01-01', [Validators.required]),
    Hasta: new FormControl('2026-12-31', [Validators.required]),
    Estado: new FormControl<'ACTIVO' | 'INACTIVO'>('ACTIVO'),
    Descripcion: new FormControl('')
  });

  // KPIs
  readonly totalFCTs = computed(() => this.service.fctList().length);
  readonly totalActivos = computed(() => this.service.fctList().filter(f => f.Estado === 'ACTIVO').length);
  readonly totalInactivos = computed(() => this.service.fctList().filter(f => f.Estado === 'INACTIVO').length);
  readonly totalEmpresas = computed(() => new Set(this.service.fctList().map(f => f.CdgEm)).size);

  // Active filters count
  readonly filtrosActivosCount = computed(() => {
    let count = 0;
    if (this.filtroEmpresa()) count++;
    if (this.filtroTipo()) count++;
    if (this.filtroEstado()) count++;
    if (this.filtroFechaDesde()) count++;
    if (this.filtroFechaHasta()) count++;
    return count;
  });

  // Filtered FCTs
  readonly fctFiltrados = computed(() => {
    const list = this.service.fctList();
    const query = this.filtroBusqueda().trim().toLowerCase();
    const emp = this.filtroEmpresa();
    const tipo = this.filtroTipo();
    const estado = this.filtroEstado();
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();

    return list.filter(item => {
      // 2.1 Búsqueda rápida
      if (query) {
        const match =
          item.Codigo.toLowerCase().includes(query) ||
          item.Descripcion.toLowerCase().includes(query) ||
          item.CdgEm.toLowerCase().includes(query) ||
          item.Tipo.toLowerCase().includes(query) ||
          (item.CdgTpc && item.CdgTpc.toLowerCase().includes(query));
        if (!match) return false;
      }

      // 2.2 Filtros
      if (emp && item.CdgEm !== emp) return false;
      if (tipo && item.Tipo !== tipo) return false;
      if (estado && item.Estado !== estado) return false;
      if (desde && item.Desde < desde) return false;
      if (hasta && item.Hasta > hasta) return false;

      return true;
    });
  });

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.filtroBusqueda.set(val);
  }

  toggleFiltrosAvanzados() {
    this.filtrosAbiertos.update(v => !v);
  }

  limpiarFiltros() {
    this.filtroBusqueda.set('');
    this.filtroEmpresa.set('');
    this.filtroTipo.set('');
    this.filtroEstado.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
  }

  getCamposCount(codigo: string): number {
    return this.service.cftList().filter(c => c.CdgFTr === codigo).length;
  }

  getCFTsForItem(codigo: string) {
    return this.service.cftList().filter(c => c.CdgFTr === codigo).sort((a, b) => a.Secuencia - b.Secuencia);
  }

  selectAndNavigateCFT(codigo: string) {
    this.service.selectFCT(codigo);
    this.service.activeTab.set('cft');
  }

  // 1. Crear FCT
  openCreateModal() {
    this.isEditing.set(false);
    this.formErrorMsg.set(null);
    this.fctForm.reset({
      CdgEm: 'EMP01',
      Codigo: `FCT-TRM-00${this.service.fctList().length + 1}`,
      CdgTpc: 'TPC-SOLICITUD',
      CdgPCr: 'PCR-VENTANILLA',
      CodigoPH: 'PH-ROOT-001',
      Tipo: 'SOLICITUD',
      Creacion: new Date().toISOString().split('T')[0],
      CdgPe: 'UNICO',
      Desde: '2026-01-01',
      Hasta: '2026-12-31',
      Estado: 'ACTIVO',
      Descripcion: ''
    });
    this.fctForm.get('Codigo')?.enable();
    this.modalFormOpen.set(true);
  }

  // 3. Editar FCT
  openEditModal(item: FCT) {
    this.isEditing.set(true);
    this.formErrorMsg.set(null);
    this.fctForm.setValue({
      CdgEm: item.CdgEm,
      Codigo: item.Codigo,
      CdgTpc: item.CdgTpc,
      CdgPCr: item.CdgPCr,
      CodigoPH: item.CodigoPH || '',
      Tipo: item.Tipo,
      Creacion: item.Creacion,
      CdgPe: item.CdgPe,
      Desde: item.Desde,
      Hasta: item.Hasta,
      Estado: item.Estado,
      Descripcion: item.Descripcion
    });
    // Restricción: El código identificador único del FCT no debe ser modificable
    this.fctForm.get('Codigo')?.disable();
    this.modalFormOpen.set(true);
  }

  closeFormModal() {
    this.modalFormOpen.set(false);
    this.formErrorMsg.set(null);
  }

  saveFCT() {
    this.formErrorMsg.set(null);

    // Get raw value so disabled Codigo is also retrieved
    const val = this.fctForm.getRawValue();

    // 1.3 Validaciones
    const desc = val.Descripcion && val.Descripcion.trim() ? val.Descripcion.trim() : (val.Codigo || 'Trámite FCT');

    if (!val.Codigo || !val.Codigo.trim()) {
      this.formErrorMsg.set('El Código del FCT es obligatorio.');
      return;
    }
    if (!val.Desde || !val.Hasta) {
      this.formErrorMsg.set('Las fechas de vigencia Desde y Hasta son requeridas.');
      return;
    }
    if (new Date(val.Desde) > new Date(val.Hasta)) {
      this.formErrorMsg.set('La fecha Desde no puede ser posterior a la fecha Hasta.');
      return;
    }

    if (this.isEditing()) {
      // 3. Modificar
      const res = this.service.updateFCT(val.Codigo, {
        CdgEm: val.CdgEm || 'EMP01',
        CdgTpc: val.CdgTpc || '',
        CdgPCr: val.CdgPCr || '',
        CodigoPH: val.CodigoPH || '',
        Tipo: val.Tipo || 'SOLICITUD',
        Creacion: val.Creacion || '',
        CdgPe: val.CdgPe || 'UNICO',
        Desde: val.Desde,
        Hasta: val.Hasta,
        Estado: val.Estado || 'ACTIVO',
        Descripcion: desc
      });

      if (!res.success) {
        this.formErrorMsg.set(res.message);
        return;
      }
    } else {
      // 1. Crear
      const res = this.service.addFCT({
        CdgEm: val.CdgEm || 'EMP01',
        Codigo: val.Codigo.trim().toUpperCase(),
        CdgTpc: val.CdgTpc || '',
        CdgPCr: val.CdgPCr || '',
        CodigoPH: val.CodigoPH || '',
        Tipo: val.Tipo || 'SOLICITUD',
        Creacion: val.Creacion || new Date().toISOString().split('T')[0],
        CdgPe: val.CdgPe || 'UNICO',
        Desde: val.Desde,
        Hasta: val.Hasta,
        Estado: val.Estado || 'ACTIVO',
        Descripcion: desc
      });

      if (!res.success) {
        this.formErrorMsg.set(res.message);
        return;
      }
    }

    this.closeFormModal();
  }

  // 2.3 Detalle
  openDetailModal(item: FCT) {
    this.detalleModalItem.set(item);
  }

  // 4. Eliminar / Inactivar
  openDeleteModal(item: FCT) {
    this.deleteModalItem.set(item);
    this.motivoInactivacionInput.set('Resolución administrativa por actualización de catálogo');
  }

  closeDeleteModal() {
    this.deleteModalItem.set(null);
    this.motivoInactivacionInput.set('');
  }

  confirmarInactivacion(codigo: string) {
    const motivo = this.motivoInactivacionInput().trim();
    if (!motivo) {
      alert('Por favor especifique un motivo formal para la inactivación.');
      return;
    }
    this.service.inactivateFCT(codigo, motivo);
    this.closeDeleteModal();
  }

  confirmarEliminacionFisica(codigo: string) {
    if (confirm(`¿Confirma eliminar definitivamente el trámite "${codigo}" y todos sus campos CFT configurados? Esta acción es irreversible.`)) {
      this.service.deleteFCT(codigo);
      this.closeDeleteModal();
    }
  }
}
