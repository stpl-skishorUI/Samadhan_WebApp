import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CitizenMasterRoutingModule } from './citizen-master-routing.module';
import { CitizenMasterComponent } from './citizen-master.component';
import { MaterialModule } from 'src/app/shared/AngularMaterialModule/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    CitizenMasterComponent
  ],
  imports: [
    CommonModule,
    CitizenMasterRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class CitizenMasterModule { }
