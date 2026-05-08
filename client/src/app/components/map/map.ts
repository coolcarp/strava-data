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
  private currentLayerGroup: L.LayerGroup | undefined;

  constructor() {
    effect(() => {
      if (this.currentLayerGroup)
        this.currentLayerGroup.remove();
      this.currentLayerGroup = L.layerGroup()
      for (const list of this.state.activityPoints()) {
        var polyline = L.polyline(list, {
          color: '#ffbb00',
          weight: 3,
          opacity: this.state.transparency(),
          smoothFactor: 1,
          className: 'activity-line'
        }).addTo(this.currentLayerGroup);
      }
      this.currentLayerGroup.addTo(this.map);
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
    L.tileLayer('https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=7YM5b5b7Yf0rqZ3g1pXC', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(this.map);
  }
  
}
