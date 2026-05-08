import { Component, inject, model, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Map } from "./components/map/map";
import { Sidebar } from "./components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Map, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  
}
