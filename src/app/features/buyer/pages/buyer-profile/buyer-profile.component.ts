import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';
import { IUser } from '@app/models';
import { Countries, StorageService } from '@app/shared';

@Component({
  selector: 'app-buyer-profile',
  standalone: true,
  templateUrl: './buyer-profile.component.html',
  styleUrl: './buyer-profile.component.scss',
  imports: [CommonModule, ReactiveFormsModule],
})
export class BuyerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private storage = inject(StorageService);
  user = this.authService.selectAuthUser();

  // necessary to prevent data loss on page refresh.
  // The data loss happens because the owner is set when entering the profile page from other routes &
  //  not on the profile page itself
  owner = this.storage.get<IUser | null>('profile');

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
    if (this.owner?.id != this.user?.id) {
      this.form.disable();
    }

    if (this.owner) {
      this.form.patchValue({
        name: this.owner?.name,
        mobNumber: this.owner?.mobNumber,
        age: this.owner?.age,
        dob: this.owner?.dob,
        email: this.owner?.email,
        password: this.owner?.password,
        gender: this.owner?.gender,
        aboutYou: this.owner?.aboutYou,
        // uploadPhoto: this.owner?.uploadPhoto,
        address: {
          addLine1: this.owner?.address?.addLine1,
          addLine2: this.owner?.address?.addLine2,
          city: this.owner?.address?.city,
          state: this.owner?.address?.state,
          zipCode: this.owner?.address?.zipCode,
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
    if (this.user?.id === this.owner?.id) {
      const fd = this.form.value;
      this.userService.updateUser$.next({
        // use the user data as a fallback
        request: {
          id: this.owner?.id as string,
          dto: {
            name: fd.name || this.owner?.name,
            role: this.owner?.role,
            gender: fd.gender || this.owner?.gender,
            age: fd.age || this.owner?.age,
            dob: fd.dob || this.owner?.dob,
            email: fd.email || this.owner?.email,
            password: fd.password || this.owner?.password,
            mobNumber: fd.mobNumber || this.owner?.mobNumber,
            language: (fd.language as any) || this.owner?.language,
            uploadPhoto: (fd.uploadPhoto as any) || this.owner?.uploadPhoto,
            aboutYou: fd.aboutYou || this.owner?.aboutYou,
            address: {
              addLine1:
                (fd.address?.addLine1 as string) ||
                (this.owner?.address?.addLine1 as string),
              addLine2:
                (fd.address?.addLine2 as string) ||
                (this.owner?.address?.addLine2 as string),
              state:
                (fd.address?.state as string) ||
                (this.owner?.address?.state as string),
              city:
                (fd.address?.city as string) ||
                (this.owner?.address?.city as string),
              zipCode:
                (fd.address?.zipCode as number) ||
                (this.owner?.address?.zipCode as number),
            },
          },
        },
      });
    }
  }
}
