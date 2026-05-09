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

  private readonly textDecoder = new TextDecoder();
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });

  protected async decompressGzip(content: ArrayBuffer): Promise<ArrayBuffer> {
    const stream = new Blob([content]).stream();
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream('gzip')
    );
    return await new Response(decompressedStream).arrayBuffer();
  }

  protected fromGpx(content: ArrayBuffer) {
    const text = this.textDecoder.decode(content);
    const json = this.parser.parse(text);
    console.log("GPX", json)
    const latLngPts = json.gpx.trk.trkseg.trkpt
      .map((e) => {return [parseFloat(e.lat), parseFloat(e.lon)]})
    return latLngPts;
  }

  private readonly semiConst =  180 / Math.pow(2, 31);
  protected async fromFitGz(content: ArrayBuffer) {
    const decompressed = await this.decompressGzip(content);
    const decoder = new Decoder(Stream.fromByteArray(decompressed));
    const { messages, errors } = decoder.read();
    console.log("FIT", messages)
    const latLngPts = messages.recordMesgs
      .map((e) => {return [e.positionLat * this.semiConst, e.positionLong * this.semiConst]})
      .filter((lli) => {return lli[0] !== undefined && !Number.isNaN(lli[0])});
    return latLngPts;
  }

  protected async fromTcxGz(content: ArrayBuffer) {
    const decompressed = await this.decompressGzip(content);
    const text = this.textDecoder.decode(decompressed);
    const json = this.parser.parse(text);
    console.log("TCX", json)
    const lngLngPts = [];
    let laps: any | any[] = json.TrainingCenterDatabase.Activities.Activity.Lap;
    if (!Array.isArray(laps))
      laps = [laps];
    laps.forEach((lap) => {
      lngLngPts.concat(lap.Track)
    })
    lngLngPts.map((e) => {return [parseFloat(e.Position.LatitudeDegrees), parseFloat(e.Position.LongitudeDegrees)]})
    return lngLngPts;
  }

  protected async onFileSelected(event: Event) {
    const start = Date.now();
    const inputElement = <HTMLInputElement>event.target;
    const file: File | undefined = inputElement.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    this.state.currentActivity.set(0);
    this.state.totalActivities.set(Object.keys(zipContent.files).length);
    let activityPoints = [];
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      if (zipEntry.dir) continue;
      const content = await zipEntry.async('arraybuffer');
      if (!filename.startsWith('activities')) continue;

      //console.log(`File: ${filename}, Size: ${content.byteLength}`);
      if (filename.endsWith('.gpx')) {
        activityPoints.push(this.fromGpx(content));
      } else if (filename.endsWith('.fit.gz')) {
        activityPoints.push(await this.fromFitGz(content));
      } else if (filename.endsWith('.tcx.gz')) {
        activityPoints.push(await this.fromTcxGz(content));
      }
      this.state.currentActivity.update((v) => {return v + 1});
    }
    this.state.activityPoints.set(activityPoints);
    console.log("Time taken:", Date.now() - start); // Time taken: 8445
  }
  

}
