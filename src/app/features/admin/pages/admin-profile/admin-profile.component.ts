import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';
import { Countries } from '@app/shared';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
  imports: [ReactiveFormsModule, NgIf, NgClass, NgStyle],
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public authService = inject(AuthService);
  user = this.authService.selectAuthUser();

  countries = Countries;

  form = this.fb.group({
    name: '',
    mobNumber: '',
    age: 0,
    dob: '',
    email: '',
    password: '',
    language: '',
    gender: '',
    role: '',
    aboutYou: '',
    uploadPhoto: null,
    address: this.fb.group({
      addLine1: '',
      addLine2: '',
      city: '',
      state: '',
      zipCode: 0,
    }),
  });

  ngOnInit() {
    if (this.user) {
      this.form.patchValue({
        name: this.user.name,
        mobNumber: this.user.mobNumber,
        age: this.user.age,
        dob: this.user.dob,
        email: this.user.email,
        password: this.user.password,
        gender: this.user.gender,
        aboutYou: this.user.aboutYou,
        // uploadPhoto: this.user.uploadPhoto,
        address: {
          addLine1: this.user?.address?.addLine1,
          addLine2: this.user?.address?.addLine2,
          city: this.user?.address?.city,
          state: this.user?.address?.state,
          zipCode: this.user?.address?.zipCode,
        },
      });
    }
  }

  get rf() {
    // return this.userProfileForm.controls;
    return this.form.controls;
  }

  get addr() {
    return this.form.controls.address.controls;
  }

  updateProfile() {
    if (this.user) {
      const fd = this.form.value;
      this.userService.updateUser$.next({
        // use the user data as a fallback
        request: {
          id: this.user.id,
          dto: {
            name: fd.name || this.user.name,
            role: this.user.role,
            gender: fd.gender || this.user.gender,
            age: fd.age || this.user.age,
            dob: fd.dob || this.user.dob,
            email: fd.email || this.user.email,
            password: fd.password || this.user.password,
            mobNumber: fd.mobNumber || this.user.mobNumber,
            language: (fd.language as any) || this.user.language,
            uploadPhoto: (fd.uploadPhoto as any) || this.user.uploadPhoto,
            aboutYou: fd.aboutYou || this.user.aboutYou,
            address: {
              addLine1:
                (fd.address?.addLine1 as string) ||
                (this.user.address?.addLine1 as string),
              addLine2:
                (fd.address?.addLine2 as string) ||
                (this.user.address?.addLine2 as string),
              state:
                (fd.address?.state as string) ||
                (this.user.address?.state as string),
              city:
                (fd.address?.city as string) ||
                (this.user.address?.city as string),
              zipCode:
                (fd.address?.zipCode as number) ||
                (this.user.address?.zipCode as number),
            },
          },
        },
      });
    }
  }
}
