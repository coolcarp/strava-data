import { Component, effect, inject } from '@angular/core';
import L, { DragEndEventHandlerFn, LatLngExpression, LatLngTuple, LayersControlEvent, LayersControlEventHandlerFn, LeafletEventHandlerFn, LeafletMouseEvent, LocationEvent } from 'leaflet';
import { State } from '../../state';

import {Deck} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {MapView} from '@deck.gl/core';
import {LeafletLayer} from 'deck.gl-leaflet';

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
      //this.currentLayerGroup.addTo(this.map);
      const layer = new PathLayer({
        id: 'PathLayer',
        data: this.currentLayerGroup.toGeoJSON() as any,

        getColor: d => {
          const hex = d.color;
          // convert to RGB
          return hex.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16));
        },
        getPath: d => d.path,
        getWidth: 100,
        pickable: true
      });

      const deckLayer = new LeafletLayer({
          
          layers: [
            layer
          ]
      });
      this.map.addLayer(deckLayer);

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
