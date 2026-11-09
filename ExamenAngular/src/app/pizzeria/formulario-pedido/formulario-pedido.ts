import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { PizzeriaService } from '../pizzeria.service';
import { PizzaNueva } from '../pizzeria-utl';

@Component({
  selector: 'app-formulario-pedido',
  imports: [ReactiveFormsModule],
  templateUrl: './formulario-pedido.html',
})
export class FormularioPedido implements OnInit, OnDestroy {
  formGroup!: FormGroup;
  private subs = new Subscription();

  tamanos = [
    { valor: 'Chica', precio: 40 },
    { valor: 'Mediana', precio: 80 },
    { valor: 'Grande', precio: 120 },
  ];

  ingredientes = [
    { control: 'jamon', nombre: 'Jamón', precio: 10 },
    { control: 'pina', nombre: 'Piña', precio: 10 },
    { control: 'champinones', nombre: 'Champiñones', precio: 10 },
  ];

  constructor(
    private fb: FormBuilder,
    public servicio: PizzeriaService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      // Datos del cliente
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9\-\s]{7,15}$/)]],
      fecha: [this.hoy(), Validators.required],
      // Datos de la pizza
      tamano: ['', Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      numPizzas: [null, [Validators.required, Validators.min(1)]],
    });

    // Cada cambio se comparte con el componente "Terminar"
    this.publicarCliente();
    this.subs.add(this.formGroup.valueChanges.subscribe(() => this.publicarCliente()));

    // Al terminar el pedido se limpia el formulario
    this.subs.add(
      this.servicio.pedidoTerminado$.subscribe(() => {
        this.formGroup.reset(this.valoresIniciales());
        this.publicarCliente();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private valoresIniciales() {
    return {
      nombre: '',
      direccion: '',
      telefono: '',
      fecha: this.hoy(),
      tamano: '',
      jamon: false,
      pina: false,
      champinones: false,
      numPizzas: null,
    };
  }

  private hoy(): string {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  private publicarCliente(): void {
    const c = this.formGroup.controls;
    this.servicio.cliente.set({
      nombre: (c['nombre'].value ?? '').trim(),
      direccion: (c['direccion'].value ?? '').trim(),
      telefono: (c['telefono'].value ?? '').trim(),
      fecha: c['fecha'].value ?? '',
      valido:
        c['nombre'].valid &&
        c['direccion'].valid &&
        c['telefono'].valid &&
        c['fecha'].valid,
    });
  }

  invalido(nombre: string): boolean {
    const control = this.formGroup.get(nombre);
    return !!control && control.invalid && control.touched;
  }

  // ---------- Botón Agregar ----------
  agregar(): void {
    const c = this.formGroup.controls;

    if (c['tamano'].invalid || c['numPizzas'].invalid) {
      c['tamano'].markAsTouched();
      c['numPizzas'].markAsTouched();
      return;
    }

    const v = this.formGroup.getRawValue();
    const datos: PizzaNueva = {
      tamano: v.tamano,
      ingredientes: this.ingredientes
        .filter((i) => v[i.control])
        .map((i) => i.nombre),
      num_pizzas: Number(v.numPizzas),
    };

    this.servicio.agregarPizza(datos).subscribe({
      next: (resp) => {
        if (resp?.exito === false) {
          this.servicio.mostrarFlash('error', resp.mensaje || 'No se pudo agregar la pizza');
          return;
        }

        this.servicio.cargarDetalle();

        // Se limpian solo los datos de la pizza
        this.formGroup.patchValue({
          tamano: '',
          jamon: false,
          pina: false,
          champinones: false,
          numPizzas: null,
        });
        c['tamano'].markAsUntouched();
        c['numPizzas'].markAsUntouched();
      },
      error: (error) => {
        this.servicio.mostrarFlash(
          'error',
          error.error?.mensaje || 'Ocurrió un error al agregar la pizza'
        );
      },
    });
  }
}
