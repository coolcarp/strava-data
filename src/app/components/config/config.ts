import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { State } from '../../state';


@Component({
  selector: 'app-config',
  imports: [],
  templateUrl: './config.html',
  styleUrl: './config.css',
})
export class Config {
  protected state = inject(State);

  protected onChanged(event) {
    this.state.config.update((v) => {
      return {...v, [event.target.id]: event.target.value}
    });
    console.log(event.target.id, event.target.value)
  }

  

}
