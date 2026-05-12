import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Heatmap } from './pages/heatmap/heatmap';
import { Activity } from './pages/activity/activity';

export const routes: Routes = [
  {path: '', component: Home},
  {path: 'heatmap', component: Heatmap}, 
  {path: 'activity', component: Activity}, 
];