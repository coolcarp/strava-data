import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Heatmap } from './heatmap/heatmap';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'heatmap', component: Heatmap}, 
];