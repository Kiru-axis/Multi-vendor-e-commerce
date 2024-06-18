import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, inject, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  imports: [NgClass, NgStyle, NgIf, FormsModule, RouterLink],
})
export class AdminLoginComponent implements OnInit {
  form = viewChild<NgForm>('form');
  authService = inject(AuthService);

  // to be bound with ngModel on the template driven form
  signInform: { userEmail: string; userPassword: string } = {
    userEmail: 'admin@gmail.com',
    userPassword: '123456',
  };

  ngOnInit() {}

  login() {
    if (this.form()?.invalid) {
      return;
    }
    this.authService.login$.next({
      email: this.form()?.value.userEmail as string,
      password: this.form()?.value.userPassword as string,
    });
  }
}
