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
  private fromPin: L.Marker | undefined;

  constructor() {
    let markers: L.Marker[] = []
    effect(() => {
      for (const marker of markers) {
        marker.removeFrom(this.map!);
      }
      for (const [buildingId, result] of this.state.results().entries()) {
        const marker = L.marker([result.lat, result.long]);
        marker.addTo(this.map!);
        marker.bindPopup(result.room.map(room => room.name).join('<br />'));
        marker.bindTooltip(result.name);
        markers.push(marker);
      }
    });
    // Update fromPin pos 
    effect(() => {
      this.fromPin!.setLatLng([this.state.queryModel().latitude, this.state.queryModel().longitude]);
    });
  }

  ngOnInit() {
    const defaultCenter: LatLngExpression = [this.state.queryForm.latitude().value(), this.state.queryForm.longitude().value()];
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
    // Make marker
    this.fromPin = L.marker(defaultCenter, {
      draggable: true
    });
    
    this.fromPin.addTo(this.map);
    this.fromPin.getElement()!.style.filter = "hue-rotate(100deg)"; // make red
    // Connect click event
    this.map.on('click', this.onMapClick.bind(this));
    // Connect pin move event
    this.fromPin.on('dragend', this.onPinDragEnd.bind(this))
  }

  private onMapClick(e: LeafletMouseEvent) {
    this.state.queryForm.latitude().value.set(e.latlng.lat);
    this.state.queryForm.longitude().value.set(e.latlng.lng);
  }

  private onPinDragEnd() {
    this.state.queryForm.latitude().value.set(this.fromPin!.getLatLng().lat);
    this.state.queryForm.longitude().value.set(this.fromPin!.getLatLng().lng);
  }
  
}
