import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GraphEditor } from './graph-editor.component'; // Adjusted to GraphEditor

describe('GraphEditor', () => { // Describe block can keep 'GraphEditorComponent' or match class
  let component: GraphEditor;
  let fixture: ComponentFixture<GraphEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphEditor] // Use actual class name
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphEditor); // Use actual class name
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
