import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import * as root from './root';
import * as game from './game';

@NgModule({
  declarations: [
    ...root.components,
    ...game.components,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [...root.components]
})
export class AppModule { }
