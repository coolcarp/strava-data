import { Component, effect, inject } from '@angular/core';
import L, { DragEndEventHandlerFn, LatLngExpression, LatLngTuple, LayersControlEvent, LayersControlEventHandlerFn, LeafletEventHandlerFn, LeafletMouseEvent, LocationEvent } from 'leaflet';
import { State } from '../../state';

import {color, Deck} from '@deck.gl/core';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import {MapView} from '@deck.gl/core';
import {LeafletLayer} from 'deck.gl-leaflet';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapA {
  private state = inject(State);

  private map: L.Map | undefined;
  private currentLayerGroup: L.LayerGroup | undefined;
  private deckLayer;

  protected createRouteLinesLeaflet() {
    if (this.currentLayerGroup)
      this.currentLayerGroup.remove();
    this.currentLayerGroup = L.layerGroup()
    for (const list of this.state.activityPoints()) {
      var polyline = L.polyline(list, {
        color: '#00ffbf',//'#ffbb00',
        weight: 3,
        //opacity: 0.1,//this.state.transparency(), // TODO try gl segments instead, low opactiy, no additive color.
        smoothFactor: 1,
        className: 'activity-line'
      }).addTo(this.currentLayerGroup);
    }
    //this.currentLayerGroup.addTo(this.map);
    this.map.addLayer(this.currentLayerGroup);
  }

  protected createRouteHeatmap() {
    const layer = new HeatmapLayer({
      id: 'heat',

      data: this.state.activityPointsDeck(),
      colorRange: [
        [179,88,6],
        [241,163,64],
        [254,224,182],
        [216,218,235],
      ],
      colorDomain: [1, 10],

      getPosition: d => d.position,
      getWeight: d => d.weight,

      radiusPixels: Math.max(5, Math.min(50, this.state.radius() / Math.pow(2, 15 - this.state.mapZoom()))),
      intensity: this.state.intensity(),
      threshold: this.state.threshold()
    });

    this.deckLayer.setProps({
      layers: [layer]
    });
    
    console.log("zoom", this.state.mapZoom(), "\npower:", 15 - this.state.mapZoom(), "\ntotal:", Math.pow(2, 15 - this.state.mapZoom()))
  }

  constructor() {
    effect(() => {
      this.createRouteHeatmap(); //TODO this should only be done for the heatmap route OBVS
    });
  }

  ngOnInit() {
    const defaultCenter: LatLngExpression = [this.state.center().latitude, this.state.center().longitude];

    // Create map
    this.map = L.map('map', {
      center: defaultCenter,
      zoom: this.state.mapZoom()
    });
    this.map.addEventListener("zoom", (e) => {
      console.log("setting zoom")
      this.state.mapZoom.set(this.map.getZoom());
    });
    // Add openstreetmap image
    L.tileLayer('https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=7YM5b5b7Yf0rqZ3g1pXC', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(this.map);
    // Add decklayer for overlays
    this.deckLayer = new LeafletLayer({
      layers: []
    });
    this.map.addLayer(this.deckLayer);
  }
  
}
