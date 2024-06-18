import { FormGroup } from '@angular/forms';

export const markFormGroupTouched = (formGroup: FormGroup) => {
  (Object as any).values(formGroup.controls).forEach((control: any) => {
    control.markAsTouched();

    // for nested form groups
    if (control.controls) {
      markFormGroupTouched(control);
    }
  });
};
