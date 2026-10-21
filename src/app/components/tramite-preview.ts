import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../services/tramites';

@Component({
  selector: 'app-tramite-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="space-y-6">

      <!-- Header & Simulator Banner -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700">
                <mat-icon class="text-lg">preview</mat-icon>
              </span>
              <h2 class="text-xl font-bold text-slate-900 tracking-tight">
                4. Simulador / Previsualizador de Formulario en Vivo
              </h2>
            </div>
            @if (fct(); as item) {
              <p class="text-xs text-slate-500 mt-1 max-w-2xl">
                Renderizado interactivo del trámite <strong class="font-mono text-slate-800">{{ item.Codigo }}</strong> basado exactamente en la secuencia y parámetros CFT configurados.
              </p>
            }
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="service.activeTab.set('cft')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">edit</mat-icon>
              <span>Editar Campos CFT</span>
            </button>
            <button
              (click)="resetSimulatedForm()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <mat-icon class="text-sm">clear_all</mat-icon>
              <span>Limpiar Formulario</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Canvas: Realistic Citizen/Customer Workflow Form Container -->
      <div class="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
        
        <!-- Official Form Header -->
        @if (fct(); as item) {
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white">
                    {{ item.Tipo || 'TRÁMITE OFICIAL' }}
                  </span>
                  <span class="text-xs text-slate-300 font-mono">{{ item.Codigo }}</span>
                </div>
                <h3 class="text-xl font-bold tracking-tight text-white">{{ item.Descripcion }}</h3>
                <p class="text-xs text-slate-300 mt-1">
                  Empresa emisora: {{ item.CdgEm }} • Vigencia: {{ item.Desde }} al {{ item.Hasta }}
                </p>
              </div>

              <div class="text-right hidden sm:block">
                <span class="text-[10px] text-slate-400 block uppercase">Código de Proceso</span>
                <span class="font-mono text-xs font-bold text-blue-300">{{ item.CdgTpc }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Submission Status Banner -->
        @if (submittedSuccess()) {
          <div class="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in">
            <mat-icon class="text-emerald-600 text-xl mt-0.5">verified</mat-icon>
            <div>
              <h4 class="text-sm font-bold text-emerald-900">¡Simulación de Radicación Exitosa!</h4>
              <p class="text-xs text-emerald-700 mt-0.5">
                Todos los campos obligatorios del trámite fueron validados satisfactoriamente según las reglas CFT.
              </p>
              @if (fct(); as item) {
                <div class="mt-2 text-[11px] font-mono text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200">
                  Radicado Nº: TMR-{{ currentTimestamp() }}-{{ item.Codigo }}
                </div>
              }
            </div>
          </div>
        }

        <!-- Active CFT Fields Rendered in Sequence -->
        <form (submit)="onSimulateSubmit($event)" class="p-6 sm:p-8 space-y-6">
          
          @if (cftFields().length === 0) {
            <div class="py-16 text-center text-slate-400 space-y-3">
              <mat-icon class="text-5xl text-slate-300">note_alt</mat-icon>
              <p class="text-sm font-medium text-slate-600">Este trámite no tiene campos asignados para renderizar.</p>
              <button
                type="button"
                (click)="service.activeTab.set('cet')"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm cursor-pointer"
              >
                Abrir Buscador CET y agregar campos
              </button>
            </div>
          } @else {
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (field of cftFields(); track field.Secuencia) {
                @if (field.Mostrar === 'S') {
                  
                  <div
                    [class.md:col-span-2]="field.CdgTipo === 'TEXTAREA' || field.CdgTipo === 'CHECKBOX' || field.CdgTipo === 'FILE'"
                    class="space-y-1.5"
                  >
                    <!-- Label with Obligatoriedad Indicator -->
                    <div class="flex items-center justify-between">
                      <label class="block text-xs font-semibold text-slate-800">
                        <span class="text-slate-400 font-mono text-[10px] mr-1">#{{ field.Secuencia }}</span>
                        {{ field.Etiqueta }}
                        @if (field.Obligatoriedad === 'OBLIGATORIO') {
                          <span class="text-rose-500 font-bold ml-0.5" title="Campo obligatorio">*</span>
                        }
                      </label>

                      <span class="text-[10px] text-slate-400 font-mono">
                        {{ field.CdgTipo }}
                      </span>
                    </div>

                    <!-- Dynamic Input based on CdgTipo -->
                    @switch (field.CdgTipo) {
                      
                      @case ('INPUT') {
                        <input
                          type="text"
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [placeholder]="field.Placeholder || 'Ingrese ' + field.Etiqueta.toLowerCase()"
                          [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                          class="w-full text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      }

                      @case ('NUMBER') {
                        <input
                          type="number"
                          step="any"
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [placeholder]="field.Placeholder || '0.00'"
                          [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                          class="w-full text-xs font-mono bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      }

                      @case ('SELECT') {
                        <select
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                          class="w-full text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="">-- Seleccione una opción --</option>
                          @for (opt of getOptionsForDominio(field.Dominio); track opt) {
                            <option [value]="opt">{{ opt }}</option>
                          }
                        </select>
                      }

                      @case ('DATE') {
                        <input
                          type="date"
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                          class="w-full text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      }

                      @case ('TEXTAREA') {
                        <textarea
                          rows="3"
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [placeholder]="field.Placeholder || 'Escriba el detalle aquí...'"
                          [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                          class="w-full text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                        ></textarea>
                      }

                      @case ('FILE') {
                        <div class="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer">
                          <mat-icon class="text-3xl text-slate-400">upload_file</mat-icon>
                          <div class="mt-1 text-xs text-slate-600 font-medium">
                            Haga clic o arrastre su archivo probatorio (PDF, JPG)
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono block mt-0.5">Dominio: {{ field.Dominio }}</span>
                          <input type="file" [required]="field.Obligatoriedad === 'OBLIGATORIO'" class="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
                        </div>
                      }

                      @case ('CHECKBOX') {
                        <div class="flex items-start gap-2.5 pt-1">
                          <input
                            type="checkbox"
                            [name]="field.CdgCET"
                            [disabled]="field.Registro !== 'S'"
                            [required]="field.Obligatoriedad === 'OBLIGATORIO'"
                            class="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <span class="text-xs text-slate-700 font-medium leading-relaxed">{{ field.Etiqueta }}</span>
                            @if (field.Placeholder) {
                              <span class="text-[10px] text-slate-400 block mt-0.5">{{ field.Placeholder }}</span>
                            }
                          </div>
                        </div>
                      }

                      @default {
                        <input
                          type="text"
                          [name]="field.CdgCET"
                          [disabled]="field.Registro !== 'S'"
                          [placeholder]="field.Placeholder || ''"
                          class="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      }

                    }

                    <!-- Help / Guide text -->
                    @if (field.Ayuda) {
                      <p class="text-[10px] text-slate-500 flex items-center gap-1">
                        <mat-icon class="text-xs text-slate-400">info</mat-icon>
                        <span>{{ field.Ayuda }}</span>
                      </p>
                    }
                  </div>

                }
              }
            </div>

            <!-- Simulation Footer Action Bar -->
            <div class="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="text-xs text-slate-500">
                Campos con <span class="text-rose-500 font-bold">*</span> son requeridos por las reglas del trámite.
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="reset"
                  (click)="submittedSuccess.set(false)"
                  class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Reiniciar
                </button>

                <button
                  type="submit"
                  class="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <mat-icon class="text-base">send</mat-icon>
                  <span>Simular Envío de Trámite</span>
                </button>
              </div>
            </div>

          }

        </form>

      </div>

    </div>
  `
})
export class TramitePreviewComponent {
  readonly service = inject(TramitesService);
  readonly submittedSuccess = signal<boolean>(false);
  readonly currentTimestamp = signal<string>(new Date().getTime().toString().slice(-6));

  readonly fct = computed(() => this.service.selectedFCT());
  readonly cftFields = computed(() => this.service.selectedFCTCftList());

  getOptionsForDominio(dominio: string): string[] {
    if (dominio === 'DOM_TIPOS_IDENTIFICACION') {
      return ['DNI / Cédula de Identidad', 'RUC / NIT Tributario', 'Pasaporte Internacional', 'Carné de Extranjería'];
    }
    if (dominio === 'DOM_ZONAS_URBANAS') {
      return ['Zona Centro Histórico', 'Sector Norte Comercial', 'Sector Sur Industrial', 'Zona Este Residencial', 'Valle / Periferia'];
    }
    if (dominio === 'SI_NO') {
      return ['Sí', 'No'];
    }
    return ['Opción 1 - Estándar', 'Opción 2 - Especial', 'Opción 3 - Excepcional'];
  }

  onSimulateSubmit(event: Event) {
    event.preventDefault();
    this.submittedSuccess.set(true);
    this.currentTimestamp.set(new Date().getTime().toString().slice(-6));
  }

  resetSimulatedForm() {
    this.submittedSuccess.set(false);
  }
}
