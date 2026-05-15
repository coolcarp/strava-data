import { computed, Injectable, signal } from '@angular/core';
import { form, min, required, schema } from '@angular/forms/signals';

import { XMLParser } from 'fast-xml-parser';
import { Decoder, Stream, Profile, Utils } from '@garmin/fitsdk';
import JSZip from 'jszip';

export type DefaultCenter = {
  latitude: number,
  longitude: number,
}

@Injectable({
  providedIn: 'root',
})
export class State {
  public importFinished = signal(false);

  public center = signal<DefaultCenter>({
    latitude: 29.64802716074872,
    longitude: -82.350090444088,
  });

  public heatmapPoints = signal([]);
  public activity = signal({
    recordMesgs: []
  });

  public heatmapPointsDeck = computed(() => {
    const points = this.heatmapPoints().flat(2);
    return points.map(p => ({
      position: p,
      weight: 1
    }))
  });

  public totalActivities = signal(0);
  public currentActivity = signal(0);
  public ratio = computed(() => {return this.currentActivity() / this.totalActivities()});

  public config = signal({
    intensity: 1,
    threshold: 0.02,
    radius: 10,
    mapZoom: 15,

    activity_width: 10,
    activity_resolution: 0.00001,
    activity_metric: "heartRate",
  });

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
    console.log("GPX", json);
    return json;
  }

  private gpxToPoints(json) {
    const latLngPts = json.gpx.trk.trkseg.trkpt
      .map((e) => {return [parseFloat(e.lon), parseFloat(e.lat)]})
    return latLngPts;
  }

  private readonly semiConst =  180 / Math.pow(2, 31);
  protected async fromFitGz(content: ArrayBuffer) {
    const decompressed = await this.decompressGzip(content);
    const decoder = new Decoder(Stream.fromByteArray(decompressed));
    const { messages, errors } = decoder.read();
    console.log("FIT", messages)
    return messages;
  }

  protected fitToPoints(json) {
    const latLngPts = json.recordMesgs
      .map((e) => {return [e.positionLong * this.semiConst, e.positionLat * this.semiConst]})
      .filter((lli) => {return lli[0] !== undefined && !Number.isNaN(lli[0])});
    return latLngPts;
  }

  protected fitToStd(json) {
    for (let i = 0; i < json.recordMesgs.length; i++) {
      json.recordMesgs[i].positionLong = json.recordMesgs[i].positionLong * this.semiConst;
      json.recordMesgs[i].positionLat = json.recordMesgs[i].positionLat * this.semiConst;
    }
    return json;
  }

  private fitMsgValid(msg) {
    return msg.positionLong !== undefined && !Number.isNaN(msg.positionLong) 
  }

  public msgsToSegs(msgs) {
    let segs = [];
    let prevMsg = undefined;
    for (const msg of msgs) {
      const isValid = this.fitMsgValid(msg)
      if (prevMsg && isValid) {
        segs.push({
          msg: msg,
          to: [msg.positionLong, msg.positionLat],
          from: [prevMsg.positionLong, prevMsg.positionLat]
        })
      } 
      if (isValid) {
        prevMsg = msg;
      }
    }
    return segs;
  }

  protected async fromTcxGz(content: ArrayBuffer) {
    const decompressed = await this.decompressGzip(content);
    const text = this.textDecoder.decode(decompressed);
    const json = this.parser.parse(text);
    console.log("TCX", json)
    return json;
  }

  protected tcxToPoints(json) {
    const lngLngPts = [];
    let laps: any | any[] = json.TrainingCenterDatabase.Activities.Activity.Lap;
    if (!Array.isArray(laps))
      laps = [laps];
    laps.forEach((lap) => {
      lngLngPts.concat(lap.Track)
    })
    lngLngPts.map((e) => {return [parseFloat(e.Position.LongitudeDegrees), parseFloat(e.Position.LatitudeDegrees)]})
    return lngLngPts;
  }

  protected async parseFile(content: ArrayBuffer, filename: string) {
    console.log("fname", filename)
    if (filename.endsWith(".zip")) {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(content);
      const [newFilename, zipEntry] = Object.entries(zipContent.files)[0];
      return this.parseFile(await zipEntry.async('arraybuffer'), newFilename)
    } else if (filename.endsWith(".gz")) {
      const decompressed = await this.decompressGzip(content);
      return this.parseFile(decompressed, filename.substring(0, filename.length - 3));
    } else if (filename.endsWith(".fit")) {
      const decoder = new Decoder(Stream.fromByteArray(content));
      const { messages, errors } = decoder.read();
      console.log("FIT", messages)
      return messages;
    } else if (filename.endsWith(".tcx")) {
      const text = this.textDecoder.decode(content);
      const json = await this.parser.parse(text);
      console.log("TCX", json)
      return json;
    } else if (filename.endsWith(".gpx")) {
      const text = this.textDecoder.decode(content);
      const json = await this.parser.parse(text);
      console.log("GPX", json);
      return json;
    }
  }

  public async parseStravaBackup(file: File) {
    const start = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    this.currentActivity.set(0);
    this.totalActivities.set(Object.keys(zipContent.files).length);
    let activityPoints = [];
    for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
      this.currentActivity.update((v) => {return v + 1});

      if (zipEntry.dir) continue;
      const content = await zipEntry.async('arraybuffer');
      if (!filename.startsWith('activities')) continue;

      //console.log(`File: ${filename}, Size: ${content.byteLength}`);
      if (filename.endsWith('.gpx')) {
        activityPoints.push([this.gpxToPoints(this.fromGpx(content))]);
      } else if (filename.endsWith('.fit.gz')) {
        activityPoints.push([this.fitToPoints(await this.fromFitGz(content))]);
      } else if (filename.endsWith('.tcx.gz')) {
        activityPoints.push([this.tcxToPoints(await this.fromTcxGz(content))]);
      }
    }
    this.heatmapPoints.set(activityPoints);
    this.importFinished.set(true);
    console.log("Time taken:", Date.now() - start); // Time taken: 8445
  }

  public async parseActivity(file: File) {
    const filename = file.name;
    const content = await file.arrayBuffer();
    //console.log(`File: ${filename}, Size: ${content.byteLength}`);
    const parsed = await this.parseFile(content, filename);
    const std = this.fitToStd(parsed); // TODO format others to STD
    console.log("Test", std);
    this.activity.set(std);
    this.importFinished.set(true);
  }

}
