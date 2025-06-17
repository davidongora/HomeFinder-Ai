import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ViewingScheduleComponent } from "../viewing-schedule/viewing-schedule.component";

// import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CurrencyPipe,
    // ViewingScheduleComponent,
    CommonModule,
    // MatDialogModule,
  ],

  templateUrl: './navbar.component.html',
  // styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  productService = inject(ProductService);
  viewings = this.productService.scheduledViewings;
  viewingsCount = this.productService.scheduledViewings().length;

  // constructor(private dialog: MatDialog) { }

  // openViewingsDialog(): void {
  //   this.dialog.open(ViewingScheduleComponent, {
  //     width: '80vw', // Adjust width
  //     maxHeight: '90vh', // Adjust height
  //     panelClass: 'custom-dialog-container', // Optional styling
  //     disableClose: false, // Allow closing by clicking outside
  //     autoFocus: false,
  //   });
  // }


  // In agent-window.component.ts
  showViewings = false;
  clearCart(): void {
    this.productService.clearCart();
  }

  clearSchedule(): void {
    this.productService.clearSchedule();
  }


}

