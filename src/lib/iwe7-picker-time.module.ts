import { PickerTimeComponent } from './picker-time/picker-time';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Iwe7PickerModule } from '../../../iwe7-picker/src/public_api';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    Iwe7PickerModule,
    ReactiveFormsModule
  ],
  declarations: [
    PickerTimeComponent
  ],
  exports: [
    PickerTimeComponent
  ]
})
export class Iwe7PickerTimeModule { }
