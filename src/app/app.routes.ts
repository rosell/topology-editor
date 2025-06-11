import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./app').then(c => c.App),
		children: [
			{
				path: 'main',
				loadChildren: () => import('./main/main.routes').then(m => m.MAIN_ROUTES)
			},
			{
				path: '',
				redirectTo: 'main',
				pathMatch: 'full'
			},
			{
				path: '**',
				redirectTo: 'main'
			}
		]
	}
];
