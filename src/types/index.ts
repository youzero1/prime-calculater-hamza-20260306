export interface ProfitMarginInput {
  costPrice: number;
  marginPercentage: number;
}

export interface ProfitMarginResult {
  costPrice: number;
  marginPercentage: number;
  sellingPrice: number;
  profitAmount: number;
  markup: number;
}

export interface TaxInput {
  price: number;
  taxRate: number;
  priceIncludesTax: boolean;
}

export interface TaxResult {
  originalPrice: number;
  taxRate: number;
  taxAmount: number;
  priceExcludingTax: number;
  priceIncludingTax: number;
}

export interface DiscountTier {
  minQuantity: number;
  discountPercentage: number;
}

export interface DiscountInput {
  originalPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  quantity: number;
  bulkTiers?: DiscountTier[];
}

export interface DiscountResult {
  originalPrice: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalPrice: number;
  totalPrice: number;
  savings: number;
  appliedTier?: DiscountTier;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface ShippingInput {
  weight: number;
  dimensions: Dimensions;
  destinationZone: number;
  shippingClass: 'standard' | 'express' | 'overnight';
}

export interface ShippingResult {
  weight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  destinationZone: number;
  shippingClass: string;
  baseRate: number;
  zoneMultiplier: number;
  classMultiplier: number;
  estimatedCost: number;
  estimatedDelivery: string;
}

export interface CalculationRecord {
  id: number;
  type: string;
  input: string;
  result: string;
  createdAt: string;
}

export type CalculationType = 'margin' | 'tax' | 'discount' | 'shipping';
