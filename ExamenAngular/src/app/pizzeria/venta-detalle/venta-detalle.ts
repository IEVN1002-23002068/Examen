import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { PizzeriaService } from '../pizzeria.service';
import { DetalleItem, VentaResumen } from '../pizzeria-utl';
import { Aviso } from '../aviso/aviso';

@Component({
  selector: 'app-venta-detalle',
  imports: [RouterLink, Aviso],
  templateUrl: './venta-detalle.html',
})
export class VentaDetalle implements OnInit {
  venta = signal<VentaResumen | null>(null);
  detalle = signal<DetalleItem[]>([]);

  // Consulta anterior, para regresar a ella
  queryParams: Params = {};

  constructor(
    private route: ActivatedRoute,
    private servicio: PizzeriaService
  ) {}

  ngOnInit(): void {
    this.queryParams = this.route.snapshot.queryParams;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.servicio.getDetalleVenta(id).subscribe({
      next: (resp) => {
        if (resp?.exito === false) {
          this.servicio.mostrarFlash('error', resp.mensaje || 'No se pudo consultar el detalle');
          return;
        }
        this.venta.set(resp.venta);
        this.detalle.set(resp.detalle ?? []);
      },
      error: (error) => {
        this.servicio.mostrarFlash(
          'error',
          error.error?.mensaje || 'Ocurrió un error al consultar el detalle'
        );
      },
    });
  }
}
