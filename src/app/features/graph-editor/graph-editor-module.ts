import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CytoscapeModule } from 'ngx-cytoscape';
import { GraphEditor } from './graph-editor.component';

@NgModule({
  declarations: [GraphEditor],
  imports: [
    CommonModule,
    CytoscapeModule
  ],
  exports: [GraphEditor]
})
export class GraphEditorModule { }
