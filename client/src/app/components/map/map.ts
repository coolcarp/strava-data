import { Component, effect, inject } from '@angular/core';
import L, { DragEndEventHandlerFn, LatLngExpression, LatLngTuple, LayersControlEvent, LayersControlEventHandlerFn, LeafletEventHandlerFn, LeafletMouseEvent, LocationEvent } from 'leaflet';
import { State } from '../../state';

import 'leaflet.heat';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map {
  private state = inject(State);

  private map: L.Map | undefined;
  private heatLayer: any | undefined;

  constructor() {
    effect(() => {
      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
      }
      this.heatLayer = (L as any).heatLayer(this.state.fitRecord(), {
        radius: 5, 
        blur: 5,
        maxZoom: 1
      }).addTo(this.map);
    });
  }

  ngOnInit() {
    const defaultCenter: LatLngExpression = [this.state.center().latitude, this.state.center().longitude];
    // Create map
    this.map = L.map('map', {
      center: defaultCenter,
      zoom: 15
    });
    // Add openstreetmap image
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }
  
}
