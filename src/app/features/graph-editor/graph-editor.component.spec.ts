import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphEditor } from './graph-editor.component'; // Adjusted class name
import { CytoscapeModule } from 'ngx-cytoscape'; // May not be needed if we mock heavily
import { ElementDefinition, Core } from 'cytoscape';
// import { NO_ERRORS_SCHEMA } from '@angular/core'; // For ignoring unknown elements

// Mock for Cytoscape Core instance
const mockCyInstance = {
  add: jasmine.createSpy('add').and.callFake((elements: ElementDefinition[]) => {
    // console.log('mockCy.add called with:', elements);
    return { // Mock the collection returned by add
      length: Array.isArray(elements) ? elements.length : 1,
      // Add other collection methods if needed by the component
    };
  }),
  fit: jasmine.createSpy('fit'),
  center: jasmine.createSpy('center'),
  on: jasmine.createSpy('on'),
  nodes: jasmine.createSpy('nodes').and.callFake((selector?: string) => {
    // Return a mock collection that has removeClass
    return {
      addClass: jasmine.createSpy('addClass'),
      removeClass: jasmine.createSpy('removeClass'),
      id: () => selector ? selector.substring(1) : 'mockNodeId', // Simple id mock
      // Add other methods if called by the component on a node collection
    };
  }),
  edges: jasmine.createSpy('edges').and.returnValue({
    length: 0 // Mock initial edge count
  }),
  layout: jasmine.createSpy('layout').and.returnValue({
    run: jasmine.createSpy('run')
  }),
  // Add any other methods of Core that your component uses directly
};

describe('GraphEditorComponent', () => { // Test suite name can remain with 'Component'
  let component: GraphEditor; // Adjusted type
  let fixture: ComponentFixture<GraphEditor>; // Adjusted type

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphEditor], // Adjusted declaration
      imports: [
        // CytoscapeModule // Importing the real module can be heavy for unit tests.
                         // If <cytoscape> component is in the template, it might be needed,
                         // or a NO_ERRORS_SCHEMA, or a mock component.
                         // For now, we are focusing on method testing.
      ],
      // schemas: [NO_ERRORS_SCHEMA] // To ignore unknown elements like <cytoscape>
    }).compileComponents();

    fixture = TestBed.createComponent(GraphEditor); // Adjusted component
    component = fixture.componentInstance;
    // It's often better to set up mocks before the first change detection
    // For methods like addNode/createEdge, we'll set component.cy directly.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize graphData, layout, and style', () => {
      component.ngOnInit(); // Manually call if not triggered by fixture.detectChanges()
      expect(component.graphData.length).toBeGreaterThan(0);
      expect(component.layout).toBeDefined();
      expect(component.layout.name).toEqual('cose'); // Or whatever default you set
      expect(component.style.length).toBeGreaterThan(0);
    });
  });

  describe('onCyReady', () => {
    it('should set the cytoscape instance and call fit and center', () => {
      const dummyCy = { ...mockCyInstance } as unknown as Core; // Use a fresh mock for this test
      // Reset spies that might be called in onCyReady
      dummyCy.fit.calls.reset();
      dummyCy.center.calls.reset();
      dummyCy.on.calls.reset();

      component.onCyReady(dummyCy);
      expect(component.cy).toBe(dummyCy);
      expect(dummyCy.fit).toHaveBeenCalled();
      expect(dummyCy.center).toHaveBeenCalled();
      expect(dummyCy.on).toHaveBeenCalledWith('tap', 'node', jasmine.any(Function));
    });
  });

  describe('addNode', () => {
    beforeEach(() => {
      // Assign the mock to the component's cy property
      component.cy = mockCyInstance as unknown as Core;
      // Reset spies for each test if they are reused
      mockCyInstance.add.calls.reset();
      mockCyInstance.fit.calls.reset();

      // Resetting the nodes spy and its chained calls
      mockCyInstance.nodes.calls.reset();
      // When nodes() is called, it returns an object; ensure its methods are also reset if they are spies.
      // However, in this mock, addClass/removeClass are created fresh each time nodes() is called.
      // So, resetting nodes itself should be enough.

      // Mock initial state for nodeCounter.
      // Ensure the mock for nodes() can return something that has a 'length' property for this setup.
      (mockCyInstance.nodes as jasmine.Spy).and.returnValue({ length: 0, addClass: jasmine.createSpy(), removeClass: jasmine.createSpy(), id: jasmine.createSpy() });
      (component as any).nodeCounter = component.cy?.nodes()?.length || 0;
    });

    it('should add a C0 node to the graph', () => {
      component.addNode('C0');
      expect(mockCyInstance.add).toHaveBeenCalled();
      const addedElement = mockCyInstance.add.calls.mostRecent().args[0] as ElementDefinition;
      expect(addedElement.data.type).toEqual('C0');
      expect(addedElement.data.id).toBeDefined();
      expect((component as any).nodeCounter).toBe(1); // Starts at 0, adds 1
      expect(mockCyInstance.fit).toHaveBeenCalled();
    });

    it('should increment nodeCounter', () => {
      const initialCounter = (component as any).nodeCounter; // Should be 0 from beforeEach
      component.addNode('C1');
      expect((component as any).nodeCounter).toEqual(initialCounter + 1);
      component.addNode('C2');
      expect((component as any).nodeCounter).toEqual(initialCounter + 2);
    });

    it('should not add a node if cy instance is not available', () => {
      component.cy = undefined;
      spyOn(console, 'error'); // Spy on console.error
      component.addNode('C0');
      expect(mockCyInstance.add).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Cytoscape instance not available.');
    });
  });

  describe('createEdge', () => {
    let mockSourceNodeSpy: jasmine.SpyObj<any>;
    let mockTargetNodeSpy: jasmine.SpyObj<any>;

    beforeEach(() => {
      component.cy = mockCyInstance as unknown as Core;
      // Reset spies
      mockCyInstance.add.calls.reset();

      // Setup for nodes spy to return specific mock objects for source and target
      mockSourceNodeSpy = jasmine.createSpyObj('sourceNode', ['removeClass']);
      mockTargetNodeSpy = jasmine.createSpyObj('targetNode', ['removeClass']);

      (mockCyInstance.nodes as jasmine.Spy).and.callFake((selector?: string) => {
        if (selector === '#n1') return mockSourceNodeSpy;
        if (selector === '#n2') return mockTargetNodeSpy;
        return jasmine.createSpyObj('node', ['removeClass', 'addClass', 'id']); // Default mock
      });
      (mockCyInstance.edges as jasmine.Spy).and.returnValue({ length: 0 });


      // Setup selected nodes
      component.selectedSourceNodeId = 'n1';
      component.selectedTargetNodeId = 'n2';
      (component as any).edgeCounter = component.cy.edges()?.length || 0;
    });

    it('should add a "data" edge to the graph', () => {
      component.createEdge('data');
      expect(mockCyInstance.add).toHaveBeenCalled();
      const addedElement = mockCyInstance.add.calls.mostRecent().args[0] as ElementDefinition;
      expect(addedElement.data.type).toEqual('data');
      expect(addedElement.data.source).toEqual('n1');
      expect(addedElement.data.target).toEqual('n2');
      expect(addedElement.data.id).toBeDefined();
      expect((component as any).edgeCounter).toBe(1); // Starts at 0, adds 1

      // Check if selections are cleared
      expect(component.selectedSourceNodeId).toBeNull();
      expect(component.selectedTargetNodeId).toBeNull();
      expect(mockCyInstance.nodes).toHaveBeenCalledWith('#n1');
      expect(mockSourceNodeSpy.removeClass).toHaveBeenCalledWith('selected-source');
      expect(mockCyInstance.nodes).toHaveBeenCalledWith('#n2');
      expect(mockTargetNodeSpy.removeClass).toHaveBeenCalledWith('selected-target');
    });

    it('should not add an edge if source or target node is not selected', () => {
      component.selectedSourceNodeId = null;
      component.selectedTargetNodeId = null;
      spyOn(console, 'error');
      component.createEdge('control');
      expect(mockCyInstance.add).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Source or target node not selected.');
    });

     it('should not add an edge if cy instance is not available', () => {
      component.cy = undefined;
      spyOn(console, 'error');
      component.createEdge('control');
      expect(mockCyInstance.add).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Cytoscape instance not available.');
    });
  });
});
