import { Component } from '@angular/core';
import { MapA } from "../components/map/map";
import { Sidebar } from "../components/sidebar/sidebar";

@Component({
  selector: 'app-heatmap',
  imports: [MapA, Sidebar],
  templateUrl: './heatmap.html',
  styleUrl: './heatmap.css',
})
export class Heatmap {

}
