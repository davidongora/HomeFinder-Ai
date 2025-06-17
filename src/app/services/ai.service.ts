import { Inject, inject, Injectable } from '@angular/core';
import { ProductService } from './product.service';
import {
  ChatSession,
  FunctionDeclarationsTool,
  GenerativeModel, getGenerativeModel,
  getVertexAI,
  ObjectSchemaInterface,
  Schema
} from '@angular/fire/vertexai';
import { FirebaseApp } from '@angular/fire/app';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly productService = inject(ProductService);
  private readonly model: GenerativeModel;
  private readonly chat: ChatSession;

  constructor(
    @Inject("FIREBASE_APP") private firebaseApp: FirebaseApp,
    private http: HttpClient) {
    const productsToolSet: FunctionDeclarationsTool = {
      functionDeclarations: [
        // Basic Product Operations
        {
          name: "getTotalNumberOfProducts",
          description: "Get the total number of properties available in the database."
        },
        {
          name: "getProducts",
          description: "Get an array of all properties with their names and prices."
        },
        {
          name: "viewCart",
          description: "View all properties currently in the user's cart."
        },

        // Cart Operations
        {
          name: "addToCart",
          description: "Add one or more properties to the cart.",
          parameters: Schema.object({
            properties: {
              productsToAdd: Schema.array({
                items: Schema.object({
                  description: "A single property with its name and price.",
                  properties: {
                    name: Schema.string({ description: "The name of the property." }),
                    price: Schema.number({ description: "The price of the property in KES." })
                  },
                  required: ["name", "price"]
                })
              })
            },
            required: ["productsToAdd"]
          }) as ObjectSchemaInterface
        },
        {
          name: "searchProperties",
          description: "Search properties by location, bedrooms, price and amenities",
          parameters: Schema.object({
            properties: {
              location: Schema.string({ description: "Area or neighborhood to search in" }),
              bedrooms: Schema.number({
                description: "Number of bedrooms",
                nullable: true
              }),
              minPrice: Schema.number({
                description: "Minimum price in KES",
                nullable: true
              }),
              maxPrice: Schema.number({
                description: "Maximum price in KES",
                nullable: true
              }),
              amenities: Schema.array({
                items: Schema.string(),
                description: "Desired amenities or features like 'modern' or 'pool'",
                nullable: true
              })
            },
            required: ["location"]
          }) as ObjectSchemaInterface
        },
        {
          name: "ClearCart",
          description: "Clear all properties from the user's cart."
        },
        {
          name: "removeOneFromCart",
          description: "Remove a specific property from the cart.",
          parameters: Schema.object({
            properties: {
              product: Schema.object({
                description: "The property to remove.",
                properties: {
                  id: Schema.number({ description: "The ID of the property." })
                },
                required: ["id"]
              })
            },
            required: ["product"]
          }) as ObjectSchemaInterface
        },

        // Property Search & Filtering
        {
          name: "sortProductsByPrice",
          description: "Sort properties by price (ascending or descending).",
          parameters: Schema.object({
            properties: {
              ascending: Schema.boolean({
                description: "True for ascending order, false for descending."
              })
            },
            required: ["ascending"]
          }) as ObjectSchemaInterface
        },
        {
          name: "findProductsInPriceRange",
          description: "Find properties within a specific price range.",
          parameters: Schema.object({
            properties: {
              minPrice: Schema.number({ description: "Minimum price in KES." }),
              maxPrice: Schema.number({ description: "Maximum price in KES." })
            },
            required: ["minPrice", "maxPrice"]
          }) as ObjectSchemaInterface
        },
        {
          name: "compareProductPrices",
          description: "Compare prices between two or more properties.",
          parameters: Schema.object({
            properties: {
              productNames: Schema.array({
                items: Schema.string({ description: "Name of property to compare." })
              })
            },
            required: ["productNames"]
          }) as ObjectSchemaInterface
        },
        {
          name: "findHouseByAgents",
          description: "Find properties by agent name or agency name.",
          parameters: Schema.object({
            properties: {
              description: Schema.string({
                description: "The name of the agent or agency to search for."
              })
            },
            required: ["description"]
          }) as ObjectSchemaInterface
        },
        {
          name: "findHouseByAmenities",
          description: "Find properties with specific amenities.",
          parameters: Schema.object({
            properties: {
              amenities: Schema.array({
                items: Schema.string({ description: "Amenity to search for." })
              })
            },
            required: ["amenities"]
          }) as ObjectSchemaInterface
        },

        // Property Analysis
        {
          name: "getCheapestAndMostExpensiveProducts",
          description: "Get the cheapest and most expensive properties available."
        },
        {
          name: "getAveragePriceOfProducts",
          description: "Calculate the average price of all properties."
        },
        {
          name: "suggestSimilarProducts",
          description: "Suggest properties similar to a given property.",
          parameters: Schema.object({
            properties: {
              productName: Schema.number({ description: "name of the reference property." })
            },
            required: ["productName"]
          }) as ObjectSchemaInterface
        },

        // Viewing & Scheduling
        {
          name: "getScheduledViewings",
          description: "Get all scheduled property viewings."
        },
        {
          name: "scheduleViewing",
          description: "Schedule a property viewing appointment.",
          parameters: Schema.object({
            properties: {
              propertyName: Schema.string({ description: "Name of the property to view." }),
              day: Schema.string({ description: "Day of the week for viewing." }),
              time: Schema.string({ description: "Time for viewing." })
            },
            required: ["propertyName", "day", "time"]
          }) as ObjectSchemaInterface
        },

        // Recently Listed Properties
        {
          name: "recentlyListedProducts",
          description: "Get the most recently listed properties.",
          parameters: Schema.object({
            properties: {
              limit: Schema.number({
                description: "Maximum number of properties to return.",
                default: 5
              })
            }
          }) as ObjectSchemaInterface
        },

        // Translation Support
        {
          name: "swahiliTranslation",
          description: "Translate text between English and Swahili.",
          parameters: Schema.object({
            properties: {
              text: Schema.string({ description: "Text to translate." }),
              source: Schema.string({
                description: "Source language code.",
                default: "en"
              }),
              target: Schema.string({
                description: "Target language code.",
                default: "sw"
              })
            },
            required: ["text"]
          }) as ObjectSchemaInterface
        },
        {
          name: "provideNegotiationHelp",
          description: "Provide negotiation assistance for a property by comparing prices and suggesting negotiation points.",
          parameters: Schema.object({
            properties: {
              propertyName: Schema.string({
                description: "The name of the property to negotiate for."
              }),
              targetPrice: Schema.number({
                description: "The desired target price in KES.",
                nullable: true
              })
            },
            required: ["propertyName"]
          }) as ObjectSchemaInterface
        }
      ]
    };

    // Initialize Vertex AI Service
    const vertexAI = getVertexAI(this.firebaseApp);
    const systemInstruction =
      "Welcome to HomeFinder. You are a superstar real estate agent for this property search platform. You will assist users by answering questions about available property listings and helping them add properties to their favorites list. The currency is KES and should precede the numerical price. All price values should be formatted with commas to delineate thousands. For example, instead of '1000', use '1,000'.";
    // const systemInstruction =
    "Welcome to HomeFinder. You are a helpful real estate assistant. " +
      "When responding to user queries about properties, always: " +
      "1. Format prices in KES with commas (e.g., 1,000,000) " +
      "2. Include property name, price, and agent info in responses " +
      "3. When no results are found, suggest alternatives " +
      "4. Be concise but informative " +
      "5. For agent searches, include both the agent name and agency"; +
        "6. look for houses even when the user has asked in kiswahili"; +
          "Welcome to HomeFinder.You are a professional real estate negotiation assistant.When helping with negotiations" +
          "  7. Always be polite and professional" +
          "  8. Provide factual market data to support negotiations" +
          "  9. Suggest reasonable negotiation ranges(typically 5 - 15 % below asking)" +
          "  10. Highlight property - specific negotiation points" +
          "  11. Never guarantee specific outcomes" +
          "  13. Include both percentage and absolute price differences" +
          "  14. Suggest next steps after providing data`;" +
          "  15. also add the image of the property in the response if available";


    " 2. Support filters like bedrooms, price range, and amenities"

    " When scheduling viewings:"
    "1. First verify the property exists"
    "2. Check the available viewing days/times"
    "3. If the requested time isn't available, suggest alternatives"
    "4. Always confirm successful bookings with details"
    "5. For failed bookings, explain why and offer alternatives"
    "6. Include agent contact information when successful"
    "use even the e house name since the normal user does not know of the property id";

    // Initialize the generative model with a model that supports use case
    this.model = getGenerativeModel(vertexAI, {
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
      tools: [productsToolSet],
    })

    this.chat = this.model.startChat();
  }

  // async askAgentSwahili(swahiliPrompt: string) {
  //   try {
  //     // Step 1: Translate Swahili to English
  //     const translatedPrompt = await this.swahiliTranslation(swahiliPrompt);

  //     // Step 2: Send translated prompt to agent
  //     const agentResponse = await this.askAgent(translatedPrompt);

  //     const responseInSwahili = await this.swahiliTranslation(agentResponse);
  //     return responseInSwahili;


  //   } catch (error) {
  //     console.error('Error handling Swahili prompt:', error);
  //     return 'Samahani, kuna hitilafu. Tafadhali jaribu tena.';
  //   }
  // }


  private formatPropertyResponse(properties: Product[]): string {
    if (properties.length === 0) return "No properties found.";

    return properties.map(property =>
      `${property.name}: KES ${property.price.toLocaleString()} ` +
      `(Agent: ${property.agent.name} from ${property.agent.agency})`
    ).join('\n');
  }

  private formatAgentResponse(agentName: string, properties: Product[]): string {
    if (properties.length === 0) {
      return `No properties found for agent ${agentName}.`;
    }

    const agentInfo = properties[0].agent;
    return `Properties listed by ${agentInfo.name} (${agentInfo.agency}):\n` +
      this.formatPropertyResponse(properties);
  }


  async askAgent(userPrompt: string) {
    let result = await this.chat.sendMessage(userPrompt);
    const functionCalls = result.response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      for (const functionCall of functionCalls) {
        switch (functionCall.name) {
          case "getTotalNumberOfProducts": {
            const functionResult = this.getTotalNumberOfProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { numberOfItems: functionResult },
                }
              }
            ]);
            break;
          }
          case "getProducts": {
            const functionResult = this.getProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult },
                }
              }
            ]);
            break;
          }

          case "addToCart": {
            console.log(functionCall.args);

            const args = functionCall.args as { productsToAdd: Product[] }

            const functionResult = this.addToCart(args.productsToAdd);

            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { numberOfProductsAdded: functionResult },
                },
              }
            ]);
            break;
          }
          case "ClearCart": {
            const functionResult = this.clearCart();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { itemsRemoved: functionResult }
                }
              }
            ]);
            break;
          }
          case "Compare prices for similar products": {
            const functionResult = this.clearCart();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { itemsRemoved: functionResult }
                }
              }
            ]);
            break;
          }
          case "sortProductsByPrice": {
            const functionResult = this.sortProductsByPrice();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { sortedProducts: functionResult }
                }
              }
            ]);
            break;
          }
          case "findProductsInPriceRange": {
            const args = functionCall.args as { minPrice: number, maxPrice: number };
            const functionResult = this.findProductsInPriceRange(args.minPrice, args.maxPrice);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult }
                }
              }
            ]);
            break;
          }
          case "compareProductPrices": {
            const args = functionCall.args as { productNames: string[] };
            const functionResult = this.compareProductPrices(args.productNames);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { comparedProducts: functionResult }
                }
              }
            ]);
            break;
          }
          case "getCheapestAndMostExpensiveProducts": {
            const functionResult = this.getCheapestAndMostExpensiveProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: functionResult
                }
              }
            ]);
            break;
          }
          case "getScheduledViewings": {
            const viewings = this.productService.getScheduledViewings();
            if (viewings.length === 0) {
              return "You currently have no scheduled viewings.";
            }

            const viewingList = viewings.map(v =>
              `${v.propertyName} on ${v.day} at ${v.time} (${v.status})`
            ).join('\n');

            return `Your scheduled viewings:\n${viewingList}`;
          }
          case "findHouseByAgents": {
            const args = functionCall.args as { description: string };
            const functionResult = this.findHouseByAgents(args.description);

            if (functionResult.length === 0) {
              result = await this.chat.sendMessage(
                `I couldn't find any properties listed by agents matching "${args.description}". ` +
                `Would you like me to search for something else?`
              );
            } else {
              result = await this.chat.sendMessage([
                {
                  functionResponse: {
                    name: functionCall.name,
                    response: { houses: functionResult }
                  }
                }
              ]);
            }
            break;
          }
          case "searchProperties": {
            const args = functionCall.args as {
              location: string;
              bedrooms?: number;
              minPrice?: number;
              maxPrice?: number;
              amenities?: string[];
            };

            const results = this.productService.searchProperties(args);

            if (!results || results.length === 0) {
              return `No properties found in ${args.location} matching your criteria.`;
            }

            // Safely format results
            return results.slice(0, 5).map(p => {
              const name = p.name || 'Unnamed Property';
              const price = p.price ? `KES ${p.price.toLocaleString()}` : 'Price not available';
              const bedrooms = p.rooms || 'N/A';
              const address = p.location?.address || 'Address not available';
              const agent = p.agent ? `${p.agent.name} (${p.agent.contact})` : 'Contact not available';

              return `🏠 ${name}\n` +
                `🛏️ ${bedrooms} bed | ${price}\n` +
                `📍 ${address}\n` +
                `📞 ${agent}`;
            }).join('\n\n');
          }
          case "suggestSimilarProducts": {
            const args = functionCall.args as { productId: number };
            const functionResult = this.suggestSimilarProducts(args.productId);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { similarProducts: functionResult }
                }
              }
            ]);
            break;
          }
          case "getAveragePriceOfProducts": {
            const functionResult = this.getAveragePriceOfProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { averagePrice: functionResult }
                }
              }
            ]);
            break;
          }
          case "getProductByAgent": {
            const args = functionCall.args as { agentName: string };
            const functionResult = this.getProductByAgent(args.agentName);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult }
                }
              }
            ]);
            break;
          }
          case "suggestSimilarProductsByAgent": {
            const args = functionCall.args as { agentName: string };
            const functionResult = this.suggestSimilarProductsByAgent(args.agentName);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { similarProducts: functionResult }
                }
              }
            ]);
            break;
          }
          case "findHouseByAmenities": {
            const args = functionCall.args as { amenities: string[] };
            const functionResult = this.findHouseByAmenities(args.amenities);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { houses: functionResult }
                }
              }
            ]);
            break;
          }
          case "recentlyListedProducts": {
            const functionResult = this.recentlyListedProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult }
                }
              }
            ]);
            break;
          }
          // In ai.service.ts
          // In ai.service.ts
          case "scheduleViewing": {
            const args = functionCall.args as {
              propertyName: string,
              day: string,
              time: string
            };

            // Find property case-insensitively
            const property = this.productService.getProducts().find(p =>
              p.name.toLowerCase() === args.propertyName.toLowerCase()
            );

            if (!property) {
              return `I couldn't find a property named "${args.propertyName}". Please check the name and try again.`;
            }

            const result = this.productService.scheduleHouseViewing(
              property.name, // Use the exact name from the property record
              args.day,
              args.time
            );

            return result.message;
          }
          case "swahiliTranslation": {
            const args = functionCall.args as { text: string };
            const functionResult = await this.swahiliTranslation(args.text);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { translatedText: functionResult }
                }
              }
            ]);
            break;
          }
          case "recentlyListedProperties": {
            const functionResult = this.recentlyListedProducts();
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { products: functionResult }
                }
              }
            ]);
            break;
          }
          case "provideNegotiationHelp": {
            const args = functionCall.args as { propertyName: string, targetPrice?: number };
            const functionResult = await this.provideNegotiationHelp(args.propertyName, args.targetPrice);
            result = await this.chat.sendMessage([
              {
                functionResponse: {
                  name: functionCall.name,
                  response: functionResult
                }
              }
            ]);
            break;
          }
        }

      }
    }
    return result.response.text();
  }

  getProducts() {
    return this.productService.getProducts();
  }

  getTotalNumberOfProducts() {
    return this.productService.getProducts().length;
  }

  addToCart(products: Product[]) {
    products.forEach(product => this.productService.addToCart(product));
  }

  clearCart() {
    this.productService.clearCart();
    return 0;
  }

  sortProductsByPrice() {
    const products = this.productService.getProducts();
    return [...products].sort((a, b) => a.price - b.price);
  }

  findProductsInPriceRange(minPrice: number, maxPrice: number) {
    const products = this.productService.getProducts();
    return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
  }

  compareProductPrices(productNames: string[]) {
    const products = this.productService.getProducts();
    const selectedProducts = products.filter(product => productNames.includes(product.name));
    return selectedProducts.map(product => ({
      name: product.name,
      price: product.price
    }));
  }

  getCheapestAndMostExpensiveProducts() {
    const products = this.productService.getProducts();
    if (products.length === 0) {
      return { cheapest: null, mostExpensive: null };
    }

    const sortedProducts = [...products].sort((a, b) => a.price - b.price);
    return {
      cheapest: sortedProducts[0],
      mostExpensive: sortedProducts[sortedProducts.length - 1]
    };
  }

  getScheduledViewings() {
    return this.productService.getScheduledViewings();
  }

  findHouseByAgents(description: string) {
    return this.productService.findHouseByAgents(description);
  }

  suggestSimilarProducts(productId: number) {
    return this.productService.suggestSimilarProducts(productId);
  }

  getAveragePriceOfProducts() {
    return this.productService.getAveragePriceOfProducts();
  }

  getProductByAgent(agentName: string) {
    return this.productService.findHouseByAgents(agentName);
  }

  suggestSimilarProductsByAgent(agentName: string) {
    const products = this.productService.findHouseByAgents(agentName);
    return this.productService.suggestSimilarProducts(products[0]?.id || 0);
  }

  findHouseByAmenities(amenities: string[]) {
    return this.productService.findHouseByAmenities(amenities);
  }

  recentlyListedProducts() {
    return this.productService.recentlyListedProperties();
  }

  scheduleViewing(productName: string, day: string, time: string) {
    const product = this.productService.getProducts().find(p => p.name === productName);
    if (!product) {
      return { success: false, message: `Property with name ${productName} not found.` };
    }
    return this.productService.scheduleHouseViewing(product.name, day, time);
  }


  async swahiliTranslation(text: string): Promise<string> {
    const url = 'https://libretranslate.com/translate';

    try {
      const response: any = await this.http
        .post(url, {
          q: text,
          source: 'sw',
          target: 'en',
          format: 'text',
        })
        .toPromise();

      return response.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // fallback to original if failed
    }
  }

  async provideNegotiationHelp(propertyName: string, targetPrice?: number): Promise<{
    comparableProperties: Product[],
    averagePrice: number,
    priceDifference?: number,
    percentageDifference?: number,
    negotiationTips: string[]
  }> {
    const property = this.productService.getProducts().find(p =>
      p.name.toLowerCase() === propertyName.toLowerCase()
    );

    if (!property) {
      throw new Error(`Property "${propertyName}" not found.`);
    }

    // Find comparable properties (same type and similar size)
    const comparableProperties = this.productService.getProducts().filter(p =>
      p.type === property.type &&
      p.id !== property.id &&
      Math.abs(p.price - property.price) <= property.price * 0.3 // ±30% price range
    );

    // Calculate average price of comparable properties
    const averagePrice = comparableProperties.length > 0
      ? comparableProperties.reduce((sum, p) => sum + p.price, 0) / comparableProperties.length
      : property.price;

    // Calculate differences if target price provided
    let priceDifference: number | undefined;
    let percentageDifference: number | undefined;

    if (targetPrice) {
      priceDifference = property.price - targetPrice;
      percentageDifference = (priceDifference / property.price) * 100;
    }

    // Generate negotiation tips
    const negotiationTips = this.generateNegotiationTips(property, comparableProperties, targetPrice);

    return {
      comparableProperties,
      averagePrice,
      priceDifference,
      percentageDifference,
      negotiationTips
    };
  }

  private generateNegotiationTips(
    property: Product,
    comparables: Product[],
    targetPrice?: number
  ): string[] {
    const tips: string[] = [];

    // Basic tips
    tips.push(`The asking price is KES ${property.price.toLocaleString()}`);

    if (comparables.length > 0) {
      tips.push(`Similar properties average KES ${(comparables.reduce((sum, p) => sum + p.price, 0) / comparables.length).toLocaleString()}`);

      const cheapest = comparables.reduce((min, p) => p.price < min.price ? p : min, comparables[0]);
      tips.push(`The cheapest comparable is ${cheapest.name} at KES ${cheapest.price.toLocaleString()}`);
    }

    if (property.listing?.dateListed) {
      const daysListed = Math.floor((new Date().getTime() - new Date(property.listing.dateListed).getTime()) / (1000 * 60 * 60 * 24));
      if (daysListed > 30) {
        tips.push(`This property has been listed for ${Math.round(daysListed)} days - the seller may be more motivated`);
      }
    }

    if (targetPrice) {
      if (targetPrice < property.price * 0.9) {
        tips.push(`Your target price (KES ${targetPrice.toLocaleString()}) is ${Math.round(100 - (targetPrice / property.price * 100))}% below asking - consider a more moderate initial offer`);
      } else {
        tips.push(`Your target price seems reasonable at ${Math.round((targetPrice / property.price * 100))}% of asking price`);
      }
    }

    tips.push("Consider asking about: Any needed repairs, recent price reductions, or seller motivation");
    tips.push("Remember to be polite and flexible - negotiation is a conversation");

    return tips;
  }
}
