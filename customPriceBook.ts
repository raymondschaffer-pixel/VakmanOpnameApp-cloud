
import { PriceItem, UnitType } from './types';

/**
 * DIT BESTAND IS DE BASIS VOOR UW APPLICATIE.
 * Posten in deze lijst zijn standaard beschikbaar in de app.
 */

export const CUSTOM_PRICE_ITEMS: PriceItem[] = [
  // --- OPNAME & ADVIES ---
  { id: 'op-01', category: 'Opname & Advies', name: 'Opnamekosten woning (vast tarief)', unit: UnitType.POST, priceLabor: 85.00, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'op-02', category: 'Opname & Advies', name: 'Asbestinventarisatie type A', unit: UnitType.POST, priceLabor: 375.00, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'op-03', category: 'Opname & Advies', name: 'Energielabel / EPA-advies basis', unit: UnitType.POST, priceLabor: 225.00, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' },

  // --- VOORBEREIDING & BESCHERMING ---
  { id: 'vb-01', category: 'Voorbereiding', name: 'Afdekken vloeren met stucloper', unit: UnitType.M2, priceLabor: 4.50, priceMaterial: 3.50, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'vb-02', category: 'Voorbereiding', name: 'Afdekken trap met zelfklevend vlies', unit: UnitType.STUK, priceLabor: 45.00, priceMaterial: 35.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'vb-03', category: 'Voorbereiding', name: 'Stofschotten plaatsen (folie)', unit: UnitType.M1, priceLabor: 12.50, priceMaterial: 5.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'vb-04', category: 'Voorbereiding', name: 'Afdekken woning (totaal)', unit: UnitType.POST, priceLabor: 125.00, priceMaterial: 75.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- ELEKTRA ---
  { id: 'el-01', category: 'Elektra', name: 'Vervangen groepenkast (8 groepen + ALS)', unit: UnitType.POST, priceLabor: 450.00, priceMaterial: 625.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'el-02', category: 'Elektra', name: 'Extra groep aanleggen (incl. bedrading)', unit: UnitType.STUK, priceLabor: 125.00, priceMaterial: 85.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'el-03', category: 'Elektra', name: 'Vervangen schakelmateriaal (per punt)', unit: UnitType.STUK, priceLabor: 22.50, priceMaterial: 18.50, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'el-04', category: 'Elektra', name: 'Rookmelder 230V koppelbaar plaatsen', unit: UnitType.STUK, priceLabor: 65.00, priceMaterial: 89.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- LOODGIETERSWERK & CV ---
  { id: 'lg-01', category: 'Loodgieterswerk', name: 'Vervangen CV-ketel (HR basis)', unit: UnitType.POST, priceLabor: 650.00, priceMaterial: 1450.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'lg-02', category: 'Loodgieterswerk', name: 'Expansievat vervangen', unit: UnitType.STUK, priceLabor: 75.00, priceMaterial: 45.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'lg-03', category: 'Loodgieterswerk', name: 'Radiator vervangen (standaard paneel)', unit: UnitType.STUK, priceLabor: 145.00, priceMaterial: 185.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'lg-04', category: 'Loodgieterswerk', name: 'Mechanische ventilatie box vervangen', unit: UnitType.STUK, priceLabor: 110.00, priceMaterial: 215.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- TOILET RENOVATIE ---
  { id: 'tr-p1', category: 'Toilet Renovatie', name: 'Toiletrenovatie totaalpakket', unit: UnitType.POST, priceLabor: 1750.00, priceMaterial: 1170.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'tr-01', category: 'Toilet Renovatie', name: 'Sloopwerk toilet (tegels + sanitair)', unit: UnitType.POST, priceLabor: 325.00, priceMaterial: 45.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'tr-02', category: 'Toilet Renovatie', name: 'Plaatsen inbouwreservoir (Geberit)', unit: UnitType.STUK, priceLabor: 185.00, priceMaterial: 245.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'tr-03', category: 'Toilet Renovatie', name: 'Tegelwerk toilet (wanden + vloer)', unit: UnitType.POST, priceLabor: 650.00, priceMaterial: 120.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- BADKAMER RENOVATIE ---
  { id: 'br-v01', category: 'Badkamer Renovatie', name: 'Badkamerrenovatie compleet < 3m²', unit: UnitType.POST, priceLabor: 3850.00, priceMaterial: 2450.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'br-v02', category: 'Badkamer Renovatie', name: 'Badkamerrenovatie compleet 3-4m²', unit: UnitType.POST, priceLabor: 4650.00, priceMaterial: 2950.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'br-v03', category: 'Badkamer Renovatie', name: 'Badkamerrenovatie compleet 4-5m²', unit: UnitType.POST, priceLabor: 5450.00, priceMaterial: 3650.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'br-01', category: 'Badkamer Renovatie', name: 'Volledig strippen badkamer (sloop)', unit: UnitType.POST, priceLabor: 850.00, priceMaterial: 180.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'br-04', category: 'Badkamer Renovatie', name: 'Wandtegelwerk (tot 60x60cm)', unit: UnitType.M2, priceLabor: 55.00, priceMaterial: 15.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'br-06', category: 'Badkamer Renovatie', name: 'Montage badmeubel + spiegelkast', unit: UnitType.STUK, priceLabor: 195.00, priceMaterial: 25.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- KEUKEN ---
  { id: 'ke-01', category: 'Keuken', name: 'Keukenrenovatie totaalpakket (incl. tegelwerk)', unit: UnitType.POST, priceLabor: 2850.00, priceMaterial: 3250.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'ke-02', category: 'Keuken', name: 'Demontage en afvoeren oude keuken', unit: UnitType.POST, priceLabor: 450.00, priceMaterial: 75.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'ke-03', category: 'Keuken', name: 'Keukentegelwerk (achterwand)', unit: UnitType.M2, priceLabor: 65.00, priceMaterial: 20.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- SCHILDERWERK & WANDAFWERKING ---
  { id: 'sw-01', category: 'Schilderwerk Binnen', name: 'Sauswerk wanden (2 lagen)', unit: UnitType.M2, priceLabor: 12.50, priceMaterial: 6.50, vatLabor: 'low', vatMaterial: 'low' },
  { id: 'sw-02', category: 'Schilderwerk Binnen', name: 'Sauswerk plafonds (2 lagen)', unit: UnitType.M2, priceLabor: 14.50, priceMaterial: 7.00, vatLabor: 'low', vatMaterial: 'low' },
  { id: 'sw-03', category: 'Schilderwerk Binnen', name: 'Lakwerk kozijnen/deuren (per stuk)', unit: UnitType.STUK, priceLabor: 110.00, priceMaterial: 15.00, vatLabor: 'low', vatMaterial: 'low' },
  { id: 'sw-04', category: 'Schilderwerk Buiten', name: 'Buitenschilderwerk kozijn/deur combi', unit: UnitType.STUK, priceLabor: 285.00, priceMaterial: 45.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'aw-01', category: 'Afwerking: Wand', name: 'Stucwerk sausklaar (glad)', unit: UnitType.M2, priceLabor: 19.50, priceMaterial: 4.50, vatLabor: 'low', vatMaterial: 'high' },

  // --- VLOERAFWERKING ---
  { id: 'vl-01', category: 'Vloerafwerking', name: 'Leggen laminaat incl. ondervloer', unit: UnitType.M2, priceLabor: 18.50, priceMaterial: 22.50, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'vl-02', category: 'Vloerafwerking', name: 'Plinten plaatsen (plat)', unit: UnitType.M1, priceLabor: 4.50, priceMaterial: 3.50, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'vl-03', category: 'Vloerafwerking', name: 'Hoge sfeerplinten plaatsen (incl. lijm/kit)', unit: UnitType.M1, priceLabor: 9.50, priceMaterial: 8.50, vatLabor: 'high', vatMaterial: 'high' },

  // --- AFVALBEHEER ---
  { id: 'af-01', category: 'Afval & Containers', name: 'B+S afval container (incl. verwerking)', unit: UnitType.STUK, priceLabor: 0, priceMaterial: 355.00, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'af-02', category: 'Afval & Containers', name: 'Puincontainer 6m3', unit: UnitType.STUK, priceLabor: 0, priceMaterial: 425.00, vatLabor: 'high', vatMaterial: 'high' },

  // --- SCHOONMAAK ---
  { id: 'sm-01', category: 'Schoonmaak', name: 'Schoonmaak woning', unit: UnitType.POST, priceLabor: 320.00, priceMaterial: 17.50, vatLabor: 'low', vatMaterial: 'low' },

  // --- OVERIG ---
  { id: 'ov-01', category: 'Overig', name: 'Regiewerk/meerwerk', unit: UnitType.UUR, priceLabor: 62.50, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' },
  { id: 'ov-02', category: 'Overig', name: 'Voorrijkosten / Transport', unit: UnitType.POST, priceLabor: 55.00, priceMaterial: 0, vatLabor: 'high', vatMaterial: 'high' },
];
