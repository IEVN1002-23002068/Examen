import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PizzeriaService } from '../pizzeria.service';
import { VentaResumen } from '../pizzeria-utl';

@Component({
  selector: 'app-ventas',
  imports: [ReactiveFormsModule],
  templateUrl: './ventas.html',
})
export class Ventas implements OnInit, OnDestroy {
  formGroup!: FormGroup;
  private subs = new Subscription();

  private readonly dias = [
    'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
  ];

  consultado = signal(false);
  titulo = signal('');
  ventas = signal<VentaResumen[]>([]);
  totalAcumulado = signal(0);

  constructor(
    private fb: FormBuilder,
    private servicio: PizzeriaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      tipo: ['dia'],
      valor: ['', Validators.required],
    });

    // Al regresar del detalle se recupera la consulta anterior;
    // si no hay, se muestran las ventas del día de hoy
    const params = this.route.snapshot.queryParamMap;
    const tipo = params.get('tipo');
    const valor = params.get('valor');

    if (tipo && valor) {
      this.formGroup.patchValue({ tipo, valor });
    } else {
      this.formGroup.patchValue({ tipo: 'dia', valor: this.diaDe(new Date()) });
    }
    this.ejecutar();

    // Cuando se termina un pedido, se muestran las ventas de ese día
    this.subs.add(
      this.servicio.pedidoTerminado$.subscribe((fecha) => {
        const [anio, mes, dia] = fecha.split('-').map(Number);
        this.formGroup.patchValue({
          tipo: 'dia',
          valor: this.diaDe(new Date(anio, mes - 1, dia)),
        });
        this.ejecutar();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private diaDe(fecha: Date): string {
    return this.dias[fecha.getDay()];
  }

  // ---------- Botón Consultar ----------
  consultar(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.ejecutar();

    // Se guarda la consulta en la URL para poder regresar del detalle
    const { tipo, valor } = this.formGroup.getRawValue();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo, valor: String(valor).trim() },
      replaceUrl: true,
    });
  }

  private ejecutar(): void {
    const { tipo, valor } = this.formGroup.getRawValue();
    const texto = String(valor).trim();

    const peticion =
      tipo === 'dia'
        ? this.servicio.getVentasDia(texto)
        : this.servicio.getVentasMes(texto);

    peticion.subscribe({
      next: (resp) => {
        if (resp?.exito === false) {
          this.limpiarResultados();
          this.servicio.mostrarFlash('error', resp.mensaje || 'No se pudo realizar la consulta');
          return;
        }

        this.ventas.set(resp.ventas ?? []);
        this.totalAcumulado.set(resp.total ?? 0);
        this.titulo.set(
          tipo === 'dia' ? `Ventas del día: ${texto}` : `Ventas del mes: ${texto}`
        );
        this.consultado.set(true);
      },
      error: (error) => {
        this.limpiarResultados();
        this.servicio.mostrarFlash(
          'error',
          error.error?.mensaje || 'Ocurrió un error al consultar las ventas'
        );
      },
    });
  }

  // Abre la ventana de detalle de la venta (única que cambia de pantalla)
  verDetalle(id: number): void {
    const { tipo, valor } = this.formGroup.getRawValue();
    this.router.navigate(['/ventas/detalle', id], {
      queryParams: { tipo, valor: String(valor).trim() },
    });
  }

  private limpiarResultados(): void {
    this.consultado.set(false);
    this.ventas.set([]);
    this.totalAcumulado.set(0);
    this.titulo.set('');
  }
}
