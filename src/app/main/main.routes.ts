import { Routes } from '@angular/router';

export const MAIN_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () => import('./main').then(c => c.Main),
	}
];
