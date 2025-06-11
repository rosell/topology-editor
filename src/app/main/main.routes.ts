import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./main').then(c => c.Main),
	},
  {
    path: 'editor',
    loadChildren: () => import('../features/graph-editor/graph-editor-module').then(m => m.GraphEditorModule)
  }
];
