import { Component, inject, model, signal, ViewChild } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  
}
