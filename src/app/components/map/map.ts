import { Component, effect, inject, input } from '@angular/core';
import { State } from '../../state';

import {Deck} from '@deck.gl/core';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import maplibregl from 'maplibre-gl';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {LineLayer, PathLayer} from '@deck.gl/layers';
import simplify from 'simplify-js';

// Source - https://stackoverflow.com/a/17243070
// Posted by Paul S., modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-16, License - CC BY-SA 3.0

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v): [number, number, number] {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        r * 255,
        g * 255,
        b * 255
    ];
}


@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapA {
  private state = inject(State);

  private map;
  private deckOverlay;

  public dataReady = input<string>();

  protected createHeatmap() {
    const layer = new HeatmapLayer({
      id: 'heat',

      data: this.state.heatmapPointsDeck(),
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

  protected createActivity() {
    const tolerance = this.state.config().activity_resolution * (Math.pow(2, 15 - this.state.config().mapZoom));
    console.log(tolerance)
    const activity: any = this.state.activity();
    console.log("activity", activity)
    const simplifiedMsgs = simplify(activity.recordMesgs, tolerance);
    const segments = this.state.msgsToSegs(simplifiedMsgs);
    console.log(segments);

    const tempRatio =  d => (d.msg.temperature - activity.sessionMesgs[0].minTemperature) / (activity.sessionMesgs[0].maxTemperature - activity.sessionMesgs[0].minTemperature);
    const speedRatio = d => d.msg.enhancedSpeed / activity.sessionMesgs[0].maxSpeed;
    const hrRatio = d => (d.msg.heartRate - activity.sessionMesgs[0].avgHeartRate) / (activity.sessionMesgs[0].maxHeartRate - activity.sessionMesgs[0].avgHeartRate);
    const powerRatio = d => d.msg.power / activity.sessionMesgs[0].maxPower;
    const cadenceRatio = d => d.msg.cadence / activity.sessionMesgs[0].maxCadence;
    const layer = new LineLayer({ // TODO outline layer, slightly bigger
      id: 'LineLayer',
      data: segments, //this.state.activity() as any,
      
      getColor: d => this.state.config().activity_metric == "heartRate" ?  [255, 255 - 255 * hrRatio(d), 255 - 255 * hrRatio(d)]
        : this.state.config().activity_metric == "power" ? HSVtoRGB(powerRatio(d), 1, 1)
        : this.state.config().activity_metric == "speed" ? [255 * speedRatio(d)**2, 0, 255 - 255 * speedRatio(d)**2]
        : this.state.config().activity_metric == "elevation" ? [255, 0, 255]
        : this.state.config().activity_metric == "cadence" ? HSVtoRGB(cadenceRatio(d), 1, 1)
        : this.state.config().activity_metric == "temperature" ? [100 + 155 * tempRatio(d), 100 + 155 * tempRatio(d), 0]
        : [0, 255, 0],
      //getColor: d => [255 * tempRatio(d), 255 * tempRatio(d), 0],
      getSourcePosition: d => d.from,
      getTargetPosition: d => d.to,
      getWidth: this.state.config().activity_width,
      widthUnits: 'meters',
      widthMinPixels: 5,
      widthMaxPixels: 20,
      pickable: true,
    });

    this.deckOverlay.setProps({
      layers: [layer]
    });
  }

  constructor() {
    effect(() => {
      this[this.dataReady()]();
    })
    // effect(() => {
    //   this.createHeatmap(); //TODO this should only be done for the heatmap route OBVS
    // });

    // effect(() => {
    //   this.createActivity();
    // });
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
      layers: [],
      getTooltip: ({object}) => object && `${this.state.config().activity_metric}: ${Math.round(object.msg[this.state.config().activity_metric])}` // TODO units
    });
    this.map.addControl(this.deckOverlay);
  }
  
}
