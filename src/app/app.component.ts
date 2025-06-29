import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { AgentWindowComponent } from './components/agent-window/agent-window.component';
import { ProductService } from './services/product.service';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    ProductCardComponent,
    AgentWindowComponent
  ],
  templateUrl: './app.component.html',
  // styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'bytewise';

  products: any[] = []; 

  constructor(
    public productService: ProductService
  ) {
    inject();
    this.products = this.productService.getProducts();
  }

}
