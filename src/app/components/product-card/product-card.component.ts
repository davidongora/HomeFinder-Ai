import { Component, inject, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { NgOptimizedImage, CurrencyPipe, CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe],
  templateUrl: './product-card.component.html',
  // styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;

  productService = inject(ProductService);

  onAddToCartClicked(product: Product) {
    this.productService.addToCart(product);
  }

  onAddToScheduledViewingClicked(product: Product) {
    console.log('Adding to scheduled viewing:', product);
    this.productService.scheduledViewings.update((viewings) => {
      return [...viewings, {
        propertyId: product.id,
        propertyName: product.name,
        day: '',
        time: '',
        status: 'pending'
      }];
    });
  }
}
