import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pizzeria',
    loadComponent: () =>
      import('./pizzeria/pizzeria').then((c) => c.Pizzeria),
  },
  {
    path: 'ventas/detalle/:id',
    loadComponent: () =>
      import('./pizzeria/venta-detalle/venta-detalle').then((c) => c.VentaDetalle),
  },
  { path: '', redirectTo: 'pizzeria', pathMatch: 'full' },
  { path: '**', redirectTo: 'pizzeria' },
];
