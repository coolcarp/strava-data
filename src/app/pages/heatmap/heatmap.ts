import { Component, inject } from '@angular/core';
import { MapA } from "../../components/map/map";

import { Overlay } from "../../components/overlay/overlay";
import { Config } from '../../components/config/config';
import { Upload } from '../../components/upload/upload';
import { State } from '../../state';

@Component({
  selector: 'app-heatmap',
  imports: [MapA, Overlay, Config, Upload],
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css',
})
export class Heatmap {
  protected state = inject(State);
}
