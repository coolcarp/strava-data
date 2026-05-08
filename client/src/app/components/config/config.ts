import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { Query, State } from '../../state';
import { form, Field, required, email } from '@angular/forms/signals'
import { Decoder, Stream, Profile, Utils } from '@garmin/fitsdk';
import JSZip from 'jszip';
import { XMLParser } from "fast-xml-parser";
import { PercentPipe } from '@angular/common';


@Component({
  selector: 'app-config',
  imports: [Field, PercentPipe],
  templateUrl: './config.html',
  styleUrl: './config.css',
})
export class Config {
  private http = inject(HttpClient);
  protected state = inject(State);
  protected ratio = computed(() => {return this.state.currentActivity() / this.state.totalActivities()});

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log(this.state.queryModel())
    
  }

  protected onTransparencyChanged(event) {
    this.state.transparency.set(event.target.value);
    console.log(event.target.value)
  }

  protected async onFileSelected(event: Event) {
    const inputElement = <HTMLInputElement>event.target;
    const file: File | undefined = inputElement.files?.[0];
    if (file) {
        const fname = file.name;
        console.log(fname);
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
        });
        const semiConst =  180 / Math.pow(2, 31);
        this.state.currentActivity.set(0);
        this.state.totalActivities.set(Object.keys(zipContent.files).length);
        let activityPoints = [];
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('arraybuffer');
            if (filename.startsWith('activities')) {
              //console.log(`File: ${filename}, Size: ${content.byteLength}`);
              if (filename.endsWith('.gpx')) {
                
                const text = new TextDecoder().decode(content);
                const json = parser.parse(text);
                const lngLngPts = json.gpx.trk.trkseg.trkpt
                  .map((e) => {return [parseFloat(e.lat), parseFloat(e.lon)]})
                activityPoints.push(lngLngPts);
              } else if (filename.endsWith('.fit.gz')) {
                const stream = new Blob([content]).stream();
                const decompressedStream = stream.pipeThrough(
                  new DecompressionStream('gzip')
                );
                const decompressed = await new Response(decompressedStream).arrayBuffer();
                const decoder = new Decoder(Stream.fromByteArray(decompressed));
                const { messages, errors } = decoder.read();
                //console.log(messages)
                const lngLngPts = messages.recordMesgs
                  .map((e) => {return [e.positionLat * semiConst, e.positionLong * semiConst]})
                  .filter((lli) => {return lli[0] !== undefined && !Number.isNaN(lli[0])});
                activityPoints.push(lngLngPts);
              } else if (filename.endsWith('.tcx.gz')) {
                const stream = new Blob([content]).stream();
                const decompressedStream = stream.pipeThrough(
                  new DecompressionStream('gzip')
                );
                const decompressed = await new Response(decompressedStream).arrayBuffer();
                const text = new TextDecoder().decode(decompressed);
                const json = parser.parse(text);
                console.log("TCX", json)
                const lngLngPts = [];
                let laps: any | any[] = json.TrainingCenterDatabase.Activities.Activity.Lap;
                if (!Array.isArray(laps))
                  laps = [laps];
                laps.forEach((lap) => {
                  lngLngPts.concat(lap.Track)
                })
                lngLngPts.map((e) => {return [parseFloat(e.Position.LatitudeDegrees), parseFloat(e.Position.LongitudeDegrees)]})
                activityPoints.push(lngLngPts);
              }
            }
          }
          this.state.currentActivity.update((v) => {return v + 1});
        }
        this.state.activityPoints.set(activityPoints);
    }
  }
}
