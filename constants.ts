import { PriceItem, UnitType } from './types';
import { CUSTOM_PRICE_ITEMS } from './customPriceBook';

// De INITIAL_PRICE_BOOK is nu volledig gebaseerd op hetgeen in customPriceBook.ts staat.
// Dit zorgt ervoor dat bij een lokale build de gegevens op schijf altijd winnen.
export const INITIAL_PRICE_BOOK: PriceItem[] = CUSTOM_PRICE_ITEMS;

export const ROOM_PRESETS = [
  "Algemeen",
  "Hal/Entree",
  "Toilet",
  "Woonkamer",
  "Keuken",
  "Trapopgang",
  "Overloop",
  "Slaapkamer 1",
  "Slaapkamer 2",
  "Slaapkamer 3",
  "Badkamer",
  "Zolder",
  "Tuin",
  "Berging/Garage"
];