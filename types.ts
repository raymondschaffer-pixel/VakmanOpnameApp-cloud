
export enum UnitType {
  M2 = 'm²',
  M1 = 'm¹',
  STUK = 'stuks',
  UUR = 'uur',
  POST = 'post'
}

export type VatType = 'high' | 'low';

export type UserRole = 'admin' | 'user';

export type DisciplineType = 'Van Wijnen' | 'Loodgieter' | 'Schilder' | 'Installateur' | 'Stucadoor' | 'Sloper' | 'Hovenier' | 'Schoonmaker' | 'Anders' | '';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface PriceItem {
  id: string;
  category: string;
  name: string;
  unit: UnitType;
  priceLabor: number;
  priceMaterial: number;
  vatLabor: VatType;
  vatMaterial: VatType;
}

export interface SelectedTask {
  id: string;
  priceItemId: string;
  quantity: number;
  description?: string;
  customPriceMaterial?: number;
  discipline?: DisciplineType;
  customDiscipline?: string; // Voor vrije invoer bij 'Anders'
  customVat?: VatType; // Nieuw veld om BTW per regel te overschrijven
}

export type PhotoCategory = 'before' | 'after';

export interface RoomPhoto {
  id: string;
  url: string;
  category: PhotoCategory;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  tasks: SelectedTask[];
  photos: RoomPhoto[];
}

export interface ProjectInfo {
  workNumber: string;
  description: string;
  clientName: string;
  address: string;
  date: string;
  email: string;
  maintenanceType: 'MO' | 'DO' | 'SB' | '';
  surveyType: 'VO' | 'BO' | 'EO' | '';
  status: 'Concept' | 'Definitief' | '';
  showPricesAndQuantities: boolean;
}

export interface AppState {
  projectInfo: ProjectInfo;
  rooms: Room[];
}

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: string;
  data: AppState;
}

export interface SystemBackup {
  version: number;
  timestamp: string;
  priceBook: PriceItem[];
  savedProjects: SavedProject[];
}
