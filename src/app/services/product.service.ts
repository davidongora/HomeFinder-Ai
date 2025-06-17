import { computed, inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  products: Product[] = require('../products/products.json');

  readonly productCart = signal<Product[]>([]);
  readonly productCartTotal = computed(() => {
    return this.productCart().reduce((acc, product) => {
      return acc + product.price
    }, 0);
  });

  readonly cartItemCount = computed(() => {
    return this.productCart().length;
  });

  // Update the scheduledViewings signal to track more information
  readonly scheduledViewings = signal<{
    propertyId: number;
    propertyName: string;
    day: string;
    time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
  }[]>([]);

  // Update the eventsCount computation
  readonly eventsCount = computed(() => {
    return this.scheduledViewings().filter(v => v.status === 'pending').length;
  });



  constructor() {
    // console.log('products', this.products)
  }
  getCart(): Product[] {
    return this.productCart();
  }

  getProducts(): Product[] {
    return this.products;
  }

  addToCart(product: Product): void {
    this.productCart.update((cart) => {
      return [...cart, product];
    });
  }

  clearCart(): boolean {
    try {
      // Check if cart has items before clearing
      const currentCart = this.productCart();
      if (currentCart.length === 0) {
        console.log('Cart is already empty');
        return false;
      }

      // Clear the cart
      this.productCart.set([]);

      // Verify cart was cleared successfully
      if (this.productCart().length === 0) {
        return true;
      } else {
        console.error('Failed to clear cart');
        return false;
      }
    } catch (error) {
      console.error('Error while clearing cart:', error);
      return false;
    }
  }

  clearSchedule(): boolean {
    try {
      const currentSchedule = this.scheduledViewings();

      if (currentSchedule.length === 0) {
        console.log('Schedule is already empty');
        return false;
      }

      this.scheduledViewings.set([]);

      if (this.scheduledViewings().length === 0) {
        return true;
      } else {
        console.error('Failed to clear schedule');
        return false;
      }
    } catch (error) {
      console.error('Error while clearing schedule:', error);
      return false;
    }
  }



  viewCart(): Product[] {
    return this.productCart();
  }

  removeOneFromCart(product: Product): void {
    this.productCart.update((cart) => {
      const index = cart.findIndex(p => p.id === product.id);
      if (index > -1) {
        cart.splice(index, 1);
      }
      return [...cart];
    });
  }

  sortProductsByPrice(ascending: boolean = true): Product[] {
    return [...this.products].sort((a, b) => {
      return ascending ? a.price - b.price : b.price - a.price;
    });
  }

  findProductsInPriceRange(minPrice: number, maxPrice: number): Product[] {
    return this.products.filter(product =>
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  compareProductPrices(productId1: number, productId2: number): {
    difference: number,
    percentageDifference: number,
    cheaperProduct: Product | null
  } {
    const product1 = this.products.find(p => p.id === productId1);
    const product2 = this.products.find(p => p.id === productId2);

    if (!product1 || !product2) {
      return { difference: 0, percentageDifference: 0, cheaperProduct: null };
    }

    const difference = Math.abs(product1.price - product2.price);
    const percentageDifference = +(difference / Math.max(product1.price, product2.price) * 100).toFixed(2);
    const cheaperProduct = product1.price < product2.price ? product1 : product2;

    return { difference, percentageDifference, cheaperProduct };
  }

  getCheapestAndMostExpensiveProducts(): { cheapest: Product, mostExpensive: Product } {
    const sortedProducts = this.sortProductsByPrice();
    return {
      cheapest: sortedProducts[0],
      mostExpensive: sortedProducts[sortedProducts.length - 1]
    };
  }

  getAveragePriceOfProducts(): number {
    if (this.products.length === 0) return 0;
    const total = this.products.reduce((acc, product) => acc + product.price, 0);
    return +(total / this.products.length).toFixed(2);
  }

  findHouseByAgents(description: string): Product[] {

    if (!description) return [];

    return this.products.filter(product =>
      product.agent.name.toLowerCase().includes(description.toLowerCase()) ||
      product.agent.agency.toLowerCase().includes(description.toLowerCase())

    );
  }

  suggestSimilarProducts(productId: number): Product[] {
    const product = this.products.find(p => p.id === productId);
    if (!product) return [];

    return this.products.filter(p =>
      p.id !== productId && p.rooms === product.rooms &&
      p.location === product.location && p.price === product.price &&
      p.agent.agency === product.agent.agency && p.type === product.type
    );
  }

  findHouseByAmenities(amenities: string[]): Product[] {
    return this.products.filter(product =>
      amenities.every(amenity => product.nearbyAmenities.includes(amenity))
    );

  }


  recentlyListedProperties(limit: number = 5): Product[] {
    // Filter products that have listing information with dates
    const productsWithDates = this.products.filter(product =>
      product.listing && product.listing.dateListed
    );

    // Sort by date, most recent first
    const sortedProducts = productsWithDates.sort((a, b) => {
      const dateA = new Date(a.listing.dateListed);
      const dateB = new Date(b.listing.dateListed);
      return dateB.getTime() - dateA.getTime();
    });

    // Return the most recent listings
    return sortedProducts.slice(0, limit);
  }



  // Enhanced scheduleHouseViewing method
  scheduleHouseViewing(propertyName: string, day: string, time: string): { success: boolean, message: string } {
    const property = this.products.find(p =>
      p.name.toLowerCase() === propertyName.toLowerCase()
    );

    if (!property) {
      return {
        success: false,
        message: `Property "${propertyName}" not found. Please check the name and try again.`
      };
    }

    // Check availability (case-insensitive)
    const availableDay = property.viewingDays?.find(vd =>
      vd.day.some(d => d.toLowerCase() === day.toLowerCase())
    );

    if (!availableDay) {
      const availableDays = property.viewingDays?.flatMap(vd => vd.day).join(', ') || 'none specified';
      return {
        success: false,
        message: `Viewings not available on ${day}. Available days: ${availableDays}`
      };
    }

    if (availableDay.time.length > 0 && !availableDay.time.some(t => t.toLowerCase() === time.toLowerCase())) {
      return {
        success: false,
        message: `Time ${time} not available. Available times: ${availableDay.time.join(', ')}`
      };
    }

    // Schedule the viewing
    this.scheduledViewings.update(viewings => [
      ...viewings,
      {
        propertyId: property.id,
        propertyName: property.name,
        day: day.toLowerCase(),
        time: time.toLowerCase(),
        status: 'pending'
      }
    ]);

    return {
      success: true,
      message: `Viewing scheduled for ${property.name} on ${day} at ${time}. ` +
        `Agent ${property.agent.name} (${property.agent.contact}) will confirm.`
    };
  }

  getScheduledViewings(): { propertyName: string, day: string, time: string, status: string }[] {
    return this.scheduledViewings().map(v => ({
      propertyName: v.propertyName,
      day: v.day,
      time: v.time,
      status: v.status
    }));
  }

  searchProperties(filters: {
    location: string;
    bedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
  }): Product[] {
    try {
      return this.products.filter(property => {
        // Safely get all properties with defaults
        const propertyLocation = property.location || {};
        const propertyRooms = property.rooms || [];
        const propertyAmenities = property.nearbyAmenities || [];
        const propertyValues = property.value || [];

        // Location matching (safe against undefined)
        const locationMatch =
          (propertyLocation.subcounty?.toLowerCase()?.includes(filters.location.toLowerCase()) ||
            propertyLocation.city?.toLowerCase()?.includes(filters.location.toLowerCase())) ?? false;

        // Bedroom matching (safe against undefined)
        const bedroomMatch = !filters.bedrooms ||
          propertyRooms.some(room =>
            room?.toLowerCase()?.includes(`${filters.bedrooms} bedroom`) ?? false
          );

        // Price matching (safe against undefined price)
        const price = property.price || 0;
        const priceMatch =
          (!filters.minPrice || price >= filters.minPrice) &&
          (!filters.maxPrice || price <= filters.maxPrice);

        // Amenities matching (safe against undefined arrays)
        const amenitiesMatch = !filters.amenities ||
          filters.amenities.every(amenity =>
            (propertyAmenities.some(a =>
              a?.toLowerCase()?.includes(amenity.toLowerCase())) ||
              propertyValues.some(v =>
                v?.toLowerCase()?.includes(amenity.toLowerCase()))) ?? false
          );

        return locationMatch && bedroomMatch && priceMatch && amenitiesMatch;
      });
    } catch (error) {
      console.error('Search failed:', error);
      return []; // Return empty array instead of crashing
    }
  }

  // swahiliSearch(description: string): Product[] {





  // find an agent by name
  // schedule house viewing
  // find a house by giving a description(swahili) Swahili search (e.g., "Nyumba ya kupanga Thika")
  // compare two houses by price and other features
  // get the cheapest and most expensive house 
  // get the average price of houses in a given area
  // Nearby amenities search (schools, hospitals, malls, public transport)
  // Recently listed properties (new arrivals)
  // Mortgage/loan calculator (monthly payment estimates)
  // Negotiation assistant(suggested offer prices based on market data)
  // Save favorite properties (wishlist/favorites)
  // "Similar properties" suggestions 
}
