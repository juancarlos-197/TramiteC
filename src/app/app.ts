import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TramitesService } from './services/tramites';
import { NavbarComponent } from './components/navbar';
import { FctCrudComponent } from './components/fct-crud';
import { CftCrudComponent } from './components/cft-crud';
import { CetSearchComponent } from './components/cet-search';
import { TramitePreviewComponent } from './components/tramite-preview';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NavbarComponent,
    FctCrudComponent,
    CftCrudComponent,
    CetSearchComponent,
    TramitePreviewComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly service = inject(TramitesService);
}
