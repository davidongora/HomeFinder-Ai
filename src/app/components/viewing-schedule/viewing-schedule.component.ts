import { Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
// import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-viewing-schedule',
  standalone: true,
  imports: [TitleCasePipe, CommonModule],
  // MatDialogModule],
  template: `
  <div class="viewing-schedule p-4">
    <h3 class="font-bold mb-2">Your Scheduled Viewings</h3>
    <div *ngFor="let viewing of viewings()" class="mb-2 p-2 border rounded">
      <p><strong>{{ viewing.propertyName }}</strong></p>
      <p>{{ viewing.day | titlecase }} at {{ viewing.time }}</p>
      <p class="text-sm">Status: {{ viewing.status }}</p>
    </div>
  </div>
`
})
export class ViewingScheduleComponent {

  productService = inject(ProductService);

  constructor(
    // public dialogRef: MatDialogRef<ViewingScheduleComponent>
  ) { }

  // Optional: Close dialog method
  closeDialog(): void {
    // this.dialogRef.close();
  }

  viewings = this.productService.scheduledViewings;

}
