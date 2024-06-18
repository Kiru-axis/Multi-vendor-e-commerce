import { JsonPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { IRegisterRequest, Role } from '@app/models';
import { Countries } from '@app/shared';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgStyle, NgClass, NgIf, RouterLink, JsonPipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  fb = inject(FormBuilder);

  countries = Countries;

  public authService = inject(AuthService);

  form = this.fb.group({
    name: ['Anna', Validators.required],
    mobNumber: ['123456667', Validators.required],
    age: [24, Validators.required],
    dob: ['12/04/2000', Validators.required],
    email: ['anna@gmail.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
    language: ['', Validators.required],
    gender: ['female', Validators.required],
    agreetc: [false, Validators.required],
    role: ['seller', Validators.required],
    aboutYou: [null],
    uploadPhoto: [null],
    address: this.fb.group({
      addLine1: ['Metro', Validators.required],
      addLine2: [null],
      city: ['Binam', Validators.required],
      state: ['Alzan', Validators.required],
      zipCode: [45690, Validators.required],
    }),
  });

  ngOnInit() {}

  get rf() {
    return this.form.controls;
  }

  get addr() {
    return this.form.controls.address.controls;
  }

  register() {
    if (this.form.invalid) {
      (Object as any).values(this.form.controls).forEach((control: any) => {
        control.markAsTouched();
      });
      return;
    }

    const f = this.form.value;
    const formData: IRegisterRequest = {
      name: f.name as string,
      mobNumber: f.mobNumber as string,
      age: f.age as number,
      dob: f.dob as string,
      email: f.email as string,
      password: f.password as string,
      language: f.language as any,
      gender: f.gender as string,
      agreetc: f.agreetc as boolean,
      aboutYou: f.gender,
      uploadPhoto: f.uploadPhoto,
      role: f.role as Role,
      address: {
        city: f.address?.city as string,
        addLine1: f.address?.addLine1 as string,
        zipCode: f.address?.zipCode as number,
        state: f.address?.state as string,
        addLine2: f.address?.addLine2,
      },
    };
    this.authService.register$.next({ ...formData });
  }
}
