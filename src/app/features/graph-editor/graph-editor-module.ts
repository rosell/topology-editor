import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FFlowModule } from "@foblex/flow";
import { GraphEditor } from './graph-editor.component';

@NgModule({
  declarations: [GraphEditor],
  imports: [
    CommonModule,
    FFlowModule
  ],
  exports: [GraphEditor]
})
export class GraphEditorModule { }
