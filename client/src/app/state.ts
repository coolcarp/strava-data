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
  latitude: number,
  longitude: number,
  day: string,
  period: string,
  roomCount: number
}

@Injectable({
  providedIn: 'root',
})
export class State {
  public results = signal<Query>(new Map());

  public queryModel = signal<QueryConfig>({
    latitude: 29.64802716074872,
    longitude: -82.350090444088,
    day: "M",
    period: "1",
    roomCount: 10
  });
  public queryForm = form(this.queryModel, (schemaPath) => {
    min(schemaPath.roomCount, 1)
    required(schemaPath.latitude)
    required(schemaPath.longitude)
  });
}
