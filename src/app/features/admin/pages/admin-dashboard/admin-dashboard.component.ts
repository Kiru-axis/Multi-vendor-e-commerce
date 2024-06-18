import { CommonModule, DatePipe, NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faEye, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, NgStyle, NgClass, DatePipe, FontAwesomeModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  public adminService = inject(AdminService);
  private toastr = inject(ToastrService);
  icons = {
    edit: faEdit,
    del: faTrashAlt,
    view: faEye,
  };

  deleteUser(id: any) {
    this.adminService.deleteUser$.next({ id });
  }

  deleteProduct(id: string) {
    let confirm_action = confirm(
      'Do you want to delete the product ID: ' + id + '?'
    );
    if (confirm_action == true) {
      this.adminService.deleteProduct$.next({ productId: id });
    } else {
      this.toastr.info('Deletion cancelled');
    }
  }
}
