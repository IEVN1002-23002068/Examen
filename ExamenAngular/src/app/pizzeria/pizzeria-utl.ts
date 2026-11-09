export interface PizzaNueva {
  tamano: string;
  ingredientes: string[];
  num_pizzas: number;
}

export interface DetalleItem {
  id: number;
  tamano: string;
  ingredientes: string;
  num_pizzas: number;
  subtotal: number;
}

export interface ClientePedido {
  nombre: string;
  direccion: string;
  telefono: string;
  fecha: string;
  valido: boolean;
}

export interface VentaResumen {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  fecha: string;
  total: number;
}

export interface FlashMensaje {
  tipo: 'ok' | 'error';
  texto: string;
}
