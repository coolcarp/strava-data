import { Component, effect, inject } from '@angular/core';
import L, { DragEndEventHandlerFn, LatLngExpression, LatLngTuple, LayersControlEvent, LayersControlEventHandlerFn, LeafletEventHandlerFn, LeafletMouseEvent, LocationEvent } from 'leaflet';
import { State } from '../../state';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class Map {
  private state = inject(State);

  private map: L.Map | undefined;

  constructor() {
    effect(() => {
      console.log(this.state.activityPoints())
      for (const list of this.state.activityPoints()) {
        var polyline = L.polyline(list, {
          color: '#551281',
          weight: 3,
          opacity: 0.5,
          smoothFactor: 1,
          className: 'activity-line'
        }).addTo(this.map);
        console.log(list)
      }
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
