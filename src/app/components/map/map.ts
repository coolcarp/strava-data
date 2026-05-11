import { Component, effect, inject } from '@angular/core';
import { State } from '../../state';

import {color, Deck} from '@deck.gl/core';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import {MapView} from '@deck.gl/core';
import maplibregl from 'maplibre-gl';
import {MapboxOverlay} from '@deck.gl/mapbox';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapA {
  private state = inject(State);

  private map;
  private currentLayerGroup;
  private deckOverlay;

  // protected createRouteLinesLeaflet() {
  //   if (this.currentLayerGroup)
  //     this.currentLayerGroup.remove();
  //   this.currentLayerGroup = L.layerGroup()
  //   for (const list of this.state.activityPoints()) {
  //     var polyline = L.polyline(list, {
  //       color: '#00ffbf',//'#ffbb00',
  //       weight: 3,
  //       //opacity: 0.1,//this.state.transparency(), // TODO try gl segments instead, low opactiy, no additive color.
  //       smoothFactor: 1,
  //       className: 'activity-line'
  //     }).addTo(this.currentLayerGroup);
  //   }
  //   //this.currentLayerGroup.addTo(this.map);
  //   this.map.addLayer(this.currentLayerGroup);
  // }

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

      radiusPixels: Math.max(5, Math.min(50, this.state.config().radius / Math.pow(2, 15 - this.state.config().mapZoom))),
      intensity: this.state.config().intensity,
      threshold: this.state.config().threshold
    });

    this.deckOverlay.setProps({
      layers: [layer]
    });
    
    console.log("zoom", this.state.config().mapZoom, "\npower:", 15 - this.state.config().mapZoom, "\ntotal:", Math.pow(2, 15 - this.state.config().mapZoom))
  }

  constructor() {
    effect(() => {
      this.createRouteHeatmap(); //TODO this should only be done for the heatmap route OBVS
    });
  }

  ngOnInit() {
    const defaultCenter: [number, number] = [this.state.center().longitude, this.state.center().latitude];

    // Create map
    this.map = new maplibregl.Map({
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: defaultCenter,
      zoom: this.state.config().mapZoom,
      container: 'map',
      attributionControl: false,
    });
    this.map.on("zoomend", (e) => {
      console.log("setting zoom")
      this.state.config.update((v) => {
        return {...v, mapZoom: this.map.getZoom()}
      });
    });

    this.deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: []
    });
    this.map.addControl(this.deckOverlay);
  }
  
}
