import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AiService } from '../../services/ai.service';
import { ProductService } from '../../services/product.service';
import { Message } from '../../models/message.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-agent-window',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './agent-window.component.html',
  styleUrl: './agent-window.component.css'
})
export class AgentWindowComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;


  private readonly aiService = inject(AiService);
  readonly productService = inject(ProductService);
  readonly messageHistory = signal<Message[]>([
    { text: 'Hello! I\'m your HomeFinder AI  assistant. How can I help you today?', isUser: false }
  ]);
  readonly productList = signal<Product[]>([]);

  userInput: string = '';
  showViewings = false;
  constructor() {
    this.productList.set(this.productService.getProducts());
  }

  clearCart(): void {
    this.productList.set([]);

    // Call service method to clear cart if it exists
    if (typeof this.productService.clearCart === 'function') {
      this.productService.clearCart();
    }

    // Add confirmation message to chat
    this.messageHistory.update((history) => [
      ...history,
      { isUser: false, text: 'Your cart has been cleared.' }
    ]);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error while scrolling:', err);
    }
  }

  async sendMessage(): Promise<void> {
    if (this.userInput.trim() === '') return;

    // Add user message
    this.messageHistory.update(history => [
      ...history,
      { text: this.userInput, isUser: true }
    ]);

    const userQuestion = this.userInput;
    this.userInput = '';

    try {
      const response = await this.aiService.askAgent(userQuestion);
      this.messageHistory.update(history => [
        ...history,
        { isUser: false, text: response }
      ]);

      // Scroll to bottom after update
      setTimeout(() => this.scrollToBottom(), 0);
    } catch (error) {
      this.messageHistory.update(history => [
        ...history,
        { isUser: false, text: "Sorry, I encountered an error. Please try again." }
      ]);
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }


  public options = [
    { label: 'Clear Cart' },
    { label: 'View Products' },
    { label: 'Find an agent by name' },
    { label: 'Schedule house viewing' },
    { label: 'Swahili search' },
    { label: 'Compare houses' },
    { label: 'Price extremes' },
    { label: 'Average prices' },
    { label: 'Nearby amenities' },
    { label: 'New arrivals' },
    { label: 'Negotiation help' },
    { label: 'Save favorites' },
    { label: 'Similar properties' }
  ];


  public async handleClickOption(option: { label: string }): Promise<void> {
    this.userInput = option.label

    await this.sendMessage();
  }


}
