import { Component, OnInit, signal } from '@angular/core';
import { PizzeriaService } from '../pizzeria.service';

@Component({
  selector: 'app-detalle-pedido',
  imports: [],
  templateUrl: './detalle-pedido.html',
})
export class DetallePedido implements OnInit {
  // id de la fila seleccionada en la tabla
  seleccionado = signal<number | null>(null);

  constructor(public servicio: PizzeriaService) {}

  ngOnInit(): void {
    this.servicio.cargarDetalle();
  }

  seleccionar(id: number): void {
    this.seleccionado.set(id);
  }

  // ---------- Botón Quitar ----------
  quitar(): void {
    const id = this.seleccionado();

    if (id === null) {
      this.servicio.mostrarFlash('error', 'Selecciona una pizza de la tabla para quitarla');
      return;
    }

    this.servicio.quitarPizza(id).subscribe({
      next: (resp) => {
        if (resp?.exito === false) {
          this.servicio.mostrarFlash('error', resp.mensaje || 'No se pudo quitar la pizza');
          return;
        }
        this.seleccionado.set(null);
        this.servicio.cargarDetalle();
      },
      error: (error) => {
        this.servicio.mostrarFlash(
          'error',
          error.error?.mensaje || 'Ocurrió un error al quitar la pizza'
        );
      },
    });
  }

  // ---------- Botón Terminar ----------
  terminar(): void {
    const cliente = this.servicio.cliente();

    if (!cliente.valido) {
      this.servicio.mostrarFlash('error', 'Completa correctamente los datos del cliente');
      return;
    }

    if (this.servicio.detalle().length === 0) {
      this.servicio.mostrarFlash('error', 'Agrega al menos una pizza al pedido');
      return;
    }

    this.servicio
      .terminarPedido({
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        fecha: cliente.fecha,
      })
      .subscribe({
        next: (resp) => {
          if (resp?.exito === false) {
            this.servicio.mostrarFlash('error', resp.mensaje || 'No se pudo guardar el pedido');
            return;
          }

          this.servicio.mostrarFlash('ok', resp.mensaje);
          this.servicio.detalle.set([]);
          this.seleccionado.set(null);
          this.servicio.pedidoTerminado$.next(cliente.fecha);
        },
        error: (error) => {
          this.servicio.mostrarFlash(
            'error',
            error.error?.mensaje || 'Ocurrió un error al guardar el pedido'
          );
        },
      });
  }
}
