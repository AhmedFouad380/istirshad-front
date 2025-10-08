import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';

interface Option {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-shared-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-select.component.html',
  styleUrls: ['./shared-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SharedSelectComponent),
      multi: true,
    },
  ],
})
export class SharedSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: Option[] = [];
  @Input() defaultValue: string = '';
  @Input() multiSelect: boolean = false;
  @Input() errors: any = null;
  @Input() control: any;
  @Input() showErrors: boolean = false;

  value: any;
  disabled = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.value = selectElement.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
