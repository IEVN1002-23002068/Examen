import { Component } from '@angular/core';
import { FormularioPedido } from './formulario-pedido/formulario-pedido';
import { DetallePedido } from './detalle-pedido/detalle-pedido';
import { Ventas } from './ventas/ventas';
import { Aviso } from './aviso/aviso';

@Component({
  selector: 'app-pizzeria',
  imports: [FormularioPedido, DetallePedido, Ventas, Aviso],
  templateUrl: './pizzeria.html',
})
export class Pizzeria {}
