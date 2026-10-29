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
                
              </div>
              <p class="text-xs text-slate-500 mt-0.5"> </p>
            </div>
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
            <span>1. FTr- Crear y Editar  </span>
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
            <span>2. CFT - Tabla   </span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
              {{ service.selectedFCTCftList().length }}
            </span>
          </button>

        <!--  Buscador CET 


          <button
            (click)="setTab('cet')"
            [class]="service.activeTab() === 'cet'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
            class="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all whitespace-nowrap cursor-pointer"
          >
            <mat-icon [class]="service.activeTab() === 'cet' ? 'text-blue-600' : 'text-slate-400'" class="text-base">manage_search</mat-icon>
            <span>3.  CET - Buscador </span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {{ service.cetList().length }}
            </span>
          </button>-->

        
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
