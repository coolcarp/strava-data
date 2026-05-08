import { Injectable, signal } from '@angular/core';
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
}
