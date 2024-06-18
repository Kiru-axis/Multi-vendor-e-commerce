import { DatePipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { CustomerService } from '@app/core/services/customer.service';
import { IProduct, IUser, Role, Status } from '@app/models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { ToastrService } from 'ngx-toastr';
// @ts-ignore
let jQuery = window['$'];

const PARAGRAPH = `  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident quasi
  repellat suscipit debitis aperiam dolores, asperiores, vel atque tempore
  aspernatur saepe expedita beatae eum? Perferendis vitae facilis nostrum nisi
  debitis.`;

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [
    NgStyle,
    DatePipe,
    RouterLink,
    FontAwesomeModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
  ],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.scss',
})
export class SellerDashboardComponent {
  public authService = inject(AuthService);
  public customerService = inject(CustomerService);
  toastr = inject(ToastrService);
  fb = inject(FormBuilder);

  icons = {
    edit: faEdit,
    del: faTrashAlt,
  };

  user = this.authService.selectAuthUser() as IUser;

  // modal modifiers
  modalHeader = '';
  addProductIntent = false;
  editProductIntent = false;

  // on popup,populate the form with these before calling update
  editingProduct!: IProduct;

  // combined form
  addEditProductForm = this.fb.group({
    name: ['', Validators.required],
    uploadPhoto: ['', Validators.required],
    productDesc: ['', Validators.required],
    mrp: ['', Validators.required],
    dp: ['', Validators.required],
    status: ['', Validators.required],
  });

  get rf() {
    return this.addEditProductForm.controls;
  }

  // opening popups
  onOpenAddProductModal() {
    // all the modal modifiers have to be updated
    this.modalHeader = 'Add New Product';
    this.addProductIntent = true;
    this.editProductIntent = false;

    // patch the form for faster development but delete before deploying
    this.addEditProductForm.patchValue({
      name: 'Product',
      uploadPhoto: 'assets/images/img4.jpg',
      productDesc: PARAGRAPH,
      mrp: '100',
      dp: '50',
      status: 'publish',
    });
  }

  onOpenEditProductModal(productId: string) {
    // all the modal modifiers have to be updated
    this.modalHeader = 'Edit Product';
    this.addProductIntent = false;
    this.editProductIntent = true;

    // get the product;
    this.customerService.getSingleProduct$.next({ productId });

    setTimeout(() => {
      this.editingProduct =
        this.customerService.selectSingleProduct() as IProduct;

      this.addEditProductForm.patchValue({
        name: this.editingProduct.name,
        uploadPhoto: this.editingProduct.uploadPhoto,
        productDesc: this.editingProduct.productDesc,
        mrp: this.editingProduct.mrp.toString(),
        dp: this.editingProduct.dp.toString(),
        status: this.editingProduct.status,
      });
    }, 100);
  }

  // server calls
  addNewProduct() {
    // only sellers and admins can create  products
    if (this.user?.role === Role.seller || this.user?.role == Role.admin) {
      if (this.addEditProductForm.invalid) {
        (Object as any)
          .values(this.addEditProductForm.controls)
          .forEach((control: any) => {
            control.markAsTouched();
          });

        return;
      }

      const fd = this.addEditProductForm.value;
      const product: IProduct = {
        id: Math.floor(Math.random() * 100)
          .toFixed(0)
          .toString(),
        name: fd.name as string,
        uploadPhoto: fd.uploadPhoto as string,
        productDesc: fd.productDesc as string,
        mrp: Number(fd.mrp),
        dp: Number(fd.dp),
        status: fd.status as Status,
        sellerId: this.user.id,
      };

      this.customerService.addNewProduct$.next(product);
      this.addEditProductForm.reset();
      jQuery('#productCrudModal').modal('toggle');
    } else {
      this.toastr.error('You cannot perform these operation');
      return;
    }
  }

  // edit
  updateProduct() {
    if (this.addEditProductForm.invalid) {
      (Object as any)
        .values(this.addEditProductForm.controls)
        .forEach((control: any) => {
          control.markAsTouched();
        });

      return;
    }

    const fd = this.addEditProductForm.getRawValue();

    this.customerService.editProduct$.next({
      req: {
        dto: {
          ...this.editingProduct,
          name: String(fd.name),
          mrp: Number(fd.mrp),
          dp: Number(fd.dp),
          uploadPhoto: String(fd.uploadPhoto),
          status: fd.status as Status,
          productDesc: String(fd.productDesc),
        },
        productId: this.editingProduct.id,
      },
    });

    this.addEditProductForm.reset();
    jQuery('#productCrudModal').modal('toggle');
  }

  // delete
  deleteProduct(id: string) {
    let confirm_action = confirm(
      'Do you want to delete the product ID: ' + id + '?'
    );
    if (confirm_action == true) {
      this.customerService.deleteProduct$.next({ productId: id });
    } else {
      this.toastr.info('Deletion cancelled');
    }
  }
}
