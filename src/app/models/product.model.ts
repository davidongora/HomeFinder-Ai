export interface Product {
  id: number;
  name: string;
  city: string;
  state: string;
  photo: string;
  price: number;
  availableUnits: string;
  wifi: boolean;
  laundry: boolean;
  nearbyAmenities: string[];
  nearby: string[];
  address: string;
  subcounty: string;
  rooms: string[];
  type: string;
  value: string[];
  listing: {
    type: string;
    dateListed: string;
  };
  viewingDays: {
    day: string[];
    time: string[];
  }[];

  location: {
    city: string;
    subcounty: string;
    address: string;
    rooms: string[];
  };
  agent: {
    name: string;
    agency: string;
    contact: string;
  }
}

