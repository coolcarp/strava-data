import { Component, inject, input, output, signal } from '@angular/core';
import { State } from '../../state';
import { PercentPipe } from '@angular/common';

@Component({
  selector: 'app-upload',
  imports: [PercentPipe],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class Upload {
  protected state = inject(State);

  public acceptable = input("");
  public onFileUploaded = output<File>();
  protected importing = signal(false);

  protected async onFileSelected(event: Event) {
    const inputElement = <HTMLInputElement>event.target;
    const file: File | undefined = inputElement.files?.[0];
    if (!file) return;
    this.importing.set(true);
    this.onFileUploaded.emit(file);
  }

}
