import { Component, OnInit } from '@angular/core';
import { FFlowExecution } from "@foblex/flow";

@Component({
  selector: 'app-graph-editor', // This selector was used in the previous implementation
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.css']
})
export class GraphEditor implements OnInit { // Class name was GraphEditor

  public flowEvents!: FFlowExecution;

  constructor() { }

  ngOnInit(): void {
    this.flowEvents = new FFlowExecution();
    console.log('FFlowExecution initialized:', this.flowEvents);
  }
}
