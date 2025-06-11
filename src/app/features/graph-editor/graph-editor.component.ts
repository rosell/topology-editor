import { Component, OnInit } from '@angular/core';
import cytoscape, { Core, ElementDefinition, LayoutOptions, Stylesheet } from 'cytoscape';

@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.css']
})
export class GraphEditor implements OnInit { // Ensured class name is GraphEditor

  private nodeCounter = 0;
  public cy: Core | undefined;
  public graphData: ElementDefinition[] = [];
  public layout: LayoutOptions = { name: 'grid' }; // Keep layout or adjust as needed
  public style: Stylesheet[] = [];
  public selectedSourceNodeId: string | null = null;
  public selectedTargetNodeId: string | null = null;
  private edgeCounter = 0;

  constructor() { }

  ngOnInit(): void {
    // Define Node and Edge data with types
    this.graphData = [
      // Nodes
      { data: { id: 'n1', label: 'Node 1 (C0)', type: 'C0' } },
      { data: { id: 'n2', label: 'Node 2 (C1)', type: 'C1' } },
      { data: { id: 'n3', label: 'Node 3 (C2)', type: 'C2' } },
      { data: { id: 'n4', label: 'Node 4 (C0)', type: 'C0' } },

      // Edges
      { data: { id: 'e1', source: 'n1', target: 'n2', label: 'N1->N2 (data)', type: 'data' } },
      { data: { id: 'e2', source: 'n2', target: 'n3', label: 'N2->N3 (control)', type: 'control' } },
      { data: { id: 'e3', source: 'n1', target: 'n3', label: 'N1->N3 (data)', type: 'data' } },
      { data: { id: 'e4', source: 'n4', target: 'n1', label: 'N4->N1 (control)', type: 'control' } }
    ];

    this.layout = {
      name: 'cose', // Changed to cose for better automatic layout with more nodes
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    };

    this.style = [
      // Default Node Style (fallback)
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'width': '60px',
          'height': '60px',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '10px',
          'color': '#fff', // Label color
          'text-outline-width': 2,
          'text-outline-color': '#888'
        }
      },
      // Node Type C0
      {
        selector: "node[type='C0']",
        style: {
          'background-color': '#FF5733', // Example: Orange
          'shape': 'rectangle'
        }
      },
      // Node Type C1
      {
        selector: "node[type='C1']",
        style: {
          'background-color': '#33FF57', // Example: Green
          'shape': 'ellipse'
        }
      },
      // Node Type C2
      {
        selector: "node[type='C2']",
        style: {
          'background-color': '#3357FF', // Example: Blue
          'shape': 'round-triangle'
        }
      },
      // Default Edge Style (fallback)
      {
        selector: 'edge',
        style: {
          'label': 'data(label)',
          'font-size': '8px',
          'width': 2,
          'curve-style': 'bezier', // or 'straight', 'haystack', etc.
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5
        }
      },
      // Edge Type 'data'
      {
        selector: "edge[type='data']",
        style: {
          'line-color': '#007bff', // Example: Blue
          'target-arrow-color': '#007bff',
          'line-style': 'solid'
        }
      },
      // Edge Type 'control'
      {
        selector: "edge[type='control']",
        style: {
          'line-color': '#28a745', // Example: Green
          'target-arrow-color': '#28a745',
          'line-style': 'dashed'
        }
      },
      {
        selector: '.selected-source',
        style: {
          'border-width': '4px',
          'border-color': '#FFD700', // Gold
          'border-style': 'solid'
        }
      },
      {
        selector: '.selected-target',
        style: {
          'border-width': '4px',
          'border-color': '#ADFF2F', // GreenYellow
          'border-style': 'solid'
        }
      }
    ];
  }

  onCyReady(cy: Core): void {
    this.cy = cy;
    console.log('Cytoscape instance ready for edge creation:', this.cy);
    this.cy.fit();
    this.cy.center();

    this.cy.on('tap', 'node', (event) => {
      const tappedNode = event.target;
      const tappedNodeId = tappedNode.id();

      if (!this.selectedSourceNodeId) {
        // First node selected as source
        this.selectedSourceNodeId = tappedNodeId;
        tappedNode.addClass('selected-source');
        // Clear target if any was previously selected
        if (this.selectedTargetNodeId) {
          this.cy?.nodes(`#${this.selectedTargetNodeId}`).removeClass('selected-target');
          this.selectedTargetNodeId = null;
        }
        console.log(`Source node selected: ${this.selectedSourceNodeId}`);
      } else if (this.selectedSourceNodeId && this.selectedSourceNodeId !== tappedNodeId) {
        // Second, different node selected as target
        // Clear previous target selection class if any
        if (this.selectedTargetNodeId) {
            this.cy?.nodes(`#${this.selectedTargetNodeId}`).removeClass('selected-target');
        }
        this.selectedTargetNodeId = tappedNodeId;
        tappedNode.addClass('selected-target');
        console.log(`Target node selected: ${this.selectedTargetNodeId}`);
      } else if (this.selectedSourceNodeId === tappedNodeId) {
        // Tapped on the source node again, deselect it
        tappedNode.removeClass('selected-source');
        this.selectedSourceNodeId = null;
        // Also clear target if source is deselected
        if (this.selectedTargetNodeId) {
          this.cy?.nodes(`#${this.selectedTargetNodeId}`).removeClass('selected-target');
          this.selectedTargetNodeId = null;
        }
        console.log('Source node deselected.');
      }
      // Important for Angular to pick up changes for button disabling
      // This might need ApplicationRef.tick() or NgZone.run() if changes are not detected
      // For now, let's assume basic property changes are detected.
    });
  }

  createEdge(type: 'data' | 'control'): void {
    if (!this.cy) {
      console.error('Cytoscape instance not available.');
      return;
    }
    if (!this.selectedSourceNodeId || !this.selectedTargetNodeId) {
      console.error('Source or target node not selected.');
      return;
    }

    if (this.edgeCounter === 0 && this.cy.edges().length > 0) {
        this.edgeCounter = this.cy.edges().length;
    }
    this.edgeCounter++;
    const newEdgeId = 'e_custom_' + this.edgeCounter;
    const label = `${this.selectedSourceNodeId}->${this.selectedTargetNodeId} (${type})`;

    const newEdge: ElementDefinition = {
      data: {
        id: newEdgeId,
        source: this.selectedSourceNodeId,
        target: this.selectedTargetNodeId,
        label: label,
        type: type
      }
    };

    this.cy.add(newEdge);
    console.log(`Added edge: ${newEdgeId} from ${this.selectedSourceNodeId} to ${this.selectedTargetNodeId} of type ${type}`);

    // Clear selections
    this.cy.nodes(`#${this.selectedSourceNodeId}`).removeClass('selected-source');
    this.cy.nodes(`#${this.selectedTargetNodeId}`).removeClass('selected-target');
    this.selectedSourceNodeId = null;
    this.selectedTargetNodeId = null;

    // Optional: re-run layout
    // this.cy.layout(this.layout).run();
  }

  addNode(type: 'C0' | 'C1' | 'C2'): void {
    if (!this.cy) {
      console.error('Cytoscape instance not available.');
      return;
    }

    // Initialize counter if it's the first custom node (sample nodes might have specific IDs)
    // A robust way is to find max numeric ID from existing nodes if they follow a pattern like 'n_custom_X'
    // For simplicity, we'll just increment from the initial sample nodes count if not already done.
    if (this.nodeCounter === 0 && this.cy.nodes().length > 0) {
        this.nodeCounter = this.cy.nodes().length;
    }
    this.nodeCounter++;
    const newNodeId = 'n' + this.nodeCounter;
    const label = `Node ${this.nodeCounter} (${type})`;

    const newNode: ElementDefinition = {
      data: { id: newNodeId, label: label, type: type }
    };

    this.cy.add(newNode);
    console.log(`Added node: ${newNodeId} of type ${type}`);

    // Optionally, re-run layout. The 'cose' layout might adapt, but an explicit run can be smoother.
    // this.cy.layout(this.layout).run(); // Or just this.cy.layout({ name: 'cose', ...this.layout }).run();
    // For frequent additions, consider a more optimized layout update or a manual trigger by the user.
    // For now, let the existing cose layout try to adapt or call fit.
    this.cy.fit(undefined, 30); // Fit with padding
  }
}
