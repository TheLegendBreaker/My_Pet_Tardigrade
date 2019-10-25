import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameMenuComponent } from './game';


const routes: Routes = [
	{
		path: '',
		component: GameMenuComponent,
		pathMatch: 'full',
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
