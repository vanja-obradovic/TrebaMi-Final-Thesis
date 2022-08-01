export class User {
  name: string;
  surname: string;
  number: string;
  location: GeoCoords;
  isProvider: boolean;
  category: string;
}

export interface GeoCoords {
  lat: number;
  long: number;
}
