import { computed, Injectable, signal } from '@angular/core';
import { form, min, required, schema } from '@angular/forms/signals';

export type Room = {
  id: string,
  name: string
}

export type Result = {
  lat: number,
  long: number,
  name: string,
  room: Room[]
}

export type Query = Map<string, Result>

export type QueryConfig = {
  data: File
}

export type DefaultCenter = {
  latitude: number,
  longitude: number,
}

@Injectable({
  providedIn: 'root',
})
export class State {
  public results = signal<Query>(new Map());

  public center = signal<DefaultCenter>({
    latitude: 29.64802716074872,
    longitude: -82.350090444088,
  });

  public queryModel = signal<QueryConfig>({
    data: new File([], "test")
  });
  public queryForm = form(this.queryModel, (schemaPath) => {
    // min(schemaPath.roomCount, 1)
    required(schemaPath.data)
    // required(schemaPath.longitude)
  });

  public activityPoints = signal([]);
  public activityPointsDeck = computed(() => {
    const points = this.activityPoints().flat();
    return points.map(p => ({
      position: [p[1], p[0]],
      weight: 1
    }))
  });

  public totalActivities = signal(0);
  public currentActivity = signal(0);

  public config = signal({
    intensity: 1,
    threshold: 0.02,
    radius: 10,
    mapZoom: 15,
  });

}
