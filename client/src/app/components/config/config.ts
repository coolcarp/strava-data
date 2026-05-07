import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, model, signal } from '@angular/core';
import { Query, State } from '../../state';
import { form, Field, required, email } from '@angular/forms/signals'



@Component({
  selector: 'app-config',
  imports: [Field],
  templateUrl: './config.html',
  styleUrl: './config.css',
})
export class Config {
  private http = inject(HttpClient);
  protected state = inject(State);
  private serverApi = 'http://localhost:5000/api/query';

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log(this.state.queryModel())
    this.http.post(this.serverApi, this.state.queryModel()).subscribe(result => {
      console.log(result);
      this.state.results.set(new Map(Object.entries(result)))
    })
  }

  protected onClickLocation(event: PointerEvent) { // TODO loading animation for buttons
    event.preventDefault();
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
        console.log(position);
        this.state.queryForm.latitude().value.set(position.coords.latitude);
        this.state.queryForm.longitude().value.set(position.coords.longitude);
      }, (error: GeolocationPositionError) => {
        console.log(error);
      })
    } else {
      console.log("Cannot get location")
    }
  }
}
