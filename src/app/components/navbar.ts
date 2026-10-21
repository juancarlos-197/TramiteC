import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from '../services/tramites';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <!-- Upper branding & Global context bar -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-500/20">
              <mat-icon class="text-white text-[22px]">account_tree</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-bold text-slate-900 tracking-tight leading-none">Diseñador de Trámites</h1>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                  FCT &amp; CFT v2.6
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Gestión de Fichas de Control y Configuración de Campos</p>
            </div>
          </div>

          <!-- Active FCT Context Selector -->
          <div class="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
              <mat-icon class="text-slate-400 text-sm">folder_open</mat-icon>
              <span class="font-medium text-slate-600">Trámite Activo:</span>
            </div>
            
            <select
              [value]="service.selectedFCTCode()"
              (change)="onSelectFCT($event)"
              class="bg-white border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer max-w-[260px] truncate"
            >
              @for (f of service.fctList(); track f.Codigo) {
                <option [value]="f.Codigo">
                  [{{ f.CdgEm }}] {{ f.Codigo }} - {{ f.Descripcion }}
                </option>
              }
            </select>

            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              {{ service.selectedFCTCftList().length }} campos
            </span>
          </div>

          <!-- Utility actions -->
          <div class="flex items-center gap-2">
            <button
              (click)="exportData()"
              title="Exportar configuración completa en JSON"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <mat-icon class="text-slate-500 text-sm">file_download</mat-icon>
              <span class="hidden sm:inline">Exportar</span>
            </button>

            <label
              title="Importar configuración desde JSON"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <mat-icon class="text-slate-500 text-sm">file_upload</mat-icon>
              <span class="hidden sm:inline">Importar</span>
              <input type="file" accept=".json" (change)="importData($event)" class="hidden" />
            </label>

            <button
              (click)="resetDefaults()"
              title="Restablecer datos originales de prueba"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <mat-icon class="text-slate-400 text-sm">restart_alt</mat-icon>
              <span class="hidden lg:inline">Restablecer</span>
            </button>
          </div>

        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center space-x-1 sm:space-x-4 border-t border-slate-100 overflow-x-auto py-1">
          <button
            (click)="setTab('fct')"
            [class]="service.activeTab() === 'fct'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            class="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <mat-icon [class]="service.activeTab() === 'fct' ? 'text-blue-600' : 'text-slate-400'" class="text-base">view_list</mat-icon>
            <span>1. FCT - Diseñador de Trámites</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {{ service.fctList().length }}
            </span>
          </button>

          <button
            (click)="setTab('cft')"
            [class]="service.activeTab() === 'cft'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            class="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <mat-icon [class]="service.activeTab() === 'cft' ? 'text-blue-600' : 'text-slate-400'" class="text-base">dashboard_customize</mat-icon>
            <span>2. CFT - Campos del Trámite</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
              {{ service.selectedFCTCftList().length }}
            </span>
          </button>

          <button
            (click)="setTab('cet')"
            [class]="service.activeTab() === 'cet'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            class="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <mat-icon [class]="service.activeTab() === 'cet' ? 'text-blue-600' : 'text-slate-400'" class="text-base">manage_search</mat-icon>
            <span>3. Buscador CET (Catálogo)</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {{ service.cetList().length }}
            </span>
          </button>

          <button
            (click)="setTab('preview')"
            [class]="service.activeTab() === 'preview'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            class="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <mat-icon [class]="service.activeTab() === 'preview' ? 'text-emerald-600' : 'text-slate-400'" class="text-base">preview</mat-icon>
            <span>4. Vista Previa en Vivo</span>
          </button>
        </div>

      </div>
    </header>

    <!-- Notification Toast / Banner -->
    @if (notification()) {
      <div class="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs animate-bounce">
        <mat-icon class="text-emerald-400 text-base">check_circle</mat-icon>
        <span>{{ notification() }}</span>
      </div>
    }
  `
})
export class NavbarComponent {
  readonly service = inject(TramitesService);
  readonly notification = signal<string | null>(null);

  setTab(tab: 'fct' | 'cft' | 'cet' | 'preview') {
    this.service.activeTab.set(tab);
  }

  onSelectFCT(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectFCT(val);
  }

  showToast(message: string) {
    this.notification.set(message);
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }

  exportData() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(this.service.exportConfig());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `disenador_tramites_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Configuración exportada correctamente.');
  }

  importData(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const res = this.service.importConfig(text);
        if (res.success) {
          this.showToast(res.message);
        } else {
          alert(res.message);
        }
      };
      reader.readAsText(file);
      target.value = '';
    }
  }

  resetDefaults() {
    if (confirm('¿Desea restablecer todos los datos a la configuración inicial por defecto?')) {
      this.service.resetDefaults();
      this.showToast('Datos restablecidos a la configuración inicial.');
    }
  }
}
