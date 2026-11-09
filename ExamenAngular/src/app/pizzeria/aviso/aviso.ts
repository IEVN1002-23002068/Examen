import { Component } from '@angular/core';
import { PizzeriaService } from '../pizzeria.service';

@Component({
  selector: 'app-aviso',
  imports: [],
  templateUrl: './aviso.html',
})
export class Aviso {
  constructor(public servicio: PizzeriaService) {}
}
