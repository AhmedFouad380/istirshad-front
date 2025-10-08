// src/app/shared/multi-select/multi-select.component.ts
import { Component, ElementRef, HostListener, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Option {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: Option[] = [];
  @Input() placeholder: string = 'اختر العناصر';
  @Input() maxSelect: number = 4;
  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }
  selectedValues: (string | number)[] = [];
  open: boolean = false;

  onChange = (_: any) => {};
  onTouched = () => {};
  disabled = false;

  writeValue(value: any): void {
    this.selectedValues = value || [];
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

  toggleOption(value: string | number): void {
    const exists = this.selectedValues.includes(value);
    if (exists) {
      this.selectedValues = this.selectedValues.filter((v) => v !== value);
    } else {
      if (this.selectedValues.length >= this.maxSelect) return;
      this.selectedValues.push(value);
    }
    this.onChange(this.selectedValues);
    this.onTouched();
  }

  isSelected(value: string | number): boolean {
    return this.selectedValues.includes(value);
  }

  getSelectedLabels(): string[] {
    return this.options
      .filter((option) => this.selectedValues.includes(option.value))
      .map((option) => option.label);
  }
}
