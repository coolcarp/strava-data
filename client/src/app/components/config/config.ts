import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, model, signal } from '@angular/core';
import { Query, State } from '../../state';
import { form, Field, required, email } from '@angular/forms/signals'
import { Decoder, Stream, Profile, Utils } from '@garmin/fitsdk';
import JSZip from 'jszip';
import xml2js from 'xml2js';


@Component({
  selector: 'app-config',
  imports: [Field],
  templateUrl: './config.html',
  styleUrl: './config.css',
})
export class Config {
  private http = inject(HttpClient);
  protected state = inject(State);

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log(this.state.queryModel())
    
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
        
        const semiConst =  180 / Math.pow(2, 31);
        let activityPoints = [];
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('arraybuffer');
            if (filename.startsWith('activities')) {
              //console.log(`File: ${filename}, Size: ${content.byteLength}`);
              if (filename.endsWith('.gpx')) {
                // GPS coords
                xml2js.parseString(content, (err, result) => {
                    console.dir("XML result:");
                    console.dir(result);
                });
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

              }
            }
          }
        }
        this.state.activityPoints.set(activityPoints);
    }
  }
}
