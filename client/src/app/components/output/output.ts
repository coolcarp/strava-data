import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { State } from '../../state';



@Component({
  selector: 'app-output',
  imports: [KeyValuePipe],
  templateUrl: './output.html',
  styleUrl: './output.css',
})
export class Output {
  protected state = inject(State); // TODO sort by distance in the output html
}
