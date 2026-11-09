import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  ClientePedido,
  DetalleItem,
  FlashMensaje,
  PizzaNueva,
} from './pizzeria-utl';

@Injectable({
  providedIn: 'root',
})
export class PizzeriaService {
  private readonly baseUrl = 'http://127.0.0.1:5000/api';

  // ---------- Estado compartido entre los componentes ----------
  cliente = signal<ClientePedido>({
    nombre: '',
    direccion: '',
    telefono: '',
    fecha: '',
    valido: false,
  });
  detalle = signal<DetalleItem[]>([]);
  total = computed(() =>
    this.detalle().reduce((suma, d) => suma + d.subtotal, 0)
  );
  flash = signal<FlashMensaje | null>(null);
  pedidoTerminado$ = new Subject<string>(); // emite la fecha del pedido

  private flashTimer: any;

  constructor(private http: HttpClient) {}

  // ---------- Mensajes tipo Flash ----------
  mostrarFlash(tipo: 'ok' | 'error', texto: string): void {
    this.flash.set({ tipo, texto });
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.flash.set(null), 6000);
  }

  // ---------- Pedido en curso ----------
  getDetalle(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pedidos/detalle/`);
  }

  cargarDetalle(): void {
    this.getDetalle().subscribe({
      next: (resp) => this.detalle.set(resp.detalle ?? []),
      error: () =>
        this.mostrarFlash('error', 'No se pudo cargar el detalle del pedido'),
    });
  }

  agregarPizza(datos: PizzaNueva): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/pedidos/detalle/`, datos);
  }

  quitarPizza(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/pedidos/detalle/${id}`);
  }

  terminarPedido(datos: {
    nombre: string;
    direccion: string;
    telefono: string;
    fecha: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/pedidos/terminar/`, datos);
  }

  // ---------- Consultas de ventas ----------
  getVentasDia(dia: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/ventas/dia/${encodeURIComponent(dia)}/`
    );
  }

  getVentasMes(mes: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/ventas/mes/${encodeURIComponent(mes)}/`
    );
  }

  getDetalleVenta(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ventas/${id}/detalle/`);
  }
}
