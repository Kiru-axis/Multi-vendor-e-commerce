import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [RouterLink],
})
export class HeaderComponent {
  public authService = inject(AuthService);

  logout() {
    this.authService.logout$.next();
  }
}
