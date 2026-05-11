import { Component } from '@angular/core';
import { MapA } from "../components/map/map";

import { Overlay } from "../components/overlay/overlay";

@Component({
  selector: 'app-heatmap',
  imports: [MapA, Overlay],
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css',
})
export class Heatmap {

}
