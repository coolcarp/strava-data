import { Component } from '@angular/core';
import { Output } from "../output/output";
import { Config } from "../config/config";

@Component({
  selector: 'app-sidebar',
  imports: [Output, Config],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

}
