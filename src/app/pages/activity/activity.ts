import { Component, inject } from '@angular/core';
import { Overlay } from '../../components/overlay/overlay';
import { MapA } from '../../components/map/map';
import { State } from '../../state';
import { Upload } from '../../components/upload/upload';
import { ActivityConfig } from "../../components/activity-config/activity-config";

@Component({
  selector: 'app-activity',
  imports: [Overlay, MapA, Upload, ActivityConfig],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class Activity {
  protected state = inject(State);
}
