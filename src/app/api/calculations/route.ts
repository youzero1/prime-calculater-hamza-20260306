import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { Calculation } from '@/entities/Calculation';
import {
  ProfitMarginInput,
  ProfitMarginResult,
  TaxInput,
  TaxResult,
  DiscountInput,
  DiscountResult,
  ShippingInput,
  ShippingResult,
} from '@/types';

function calcProfitMargin(input: ProfitMarginInput): ProfitMarginResult {
  const { costPrice, marginPercentage } = input;
  if (marginPercentage >= 100) throw new Error('Margin percentage must be less than 100.');
  const sellingPrice = costPrice / (1 - marginPercentage / 100);
  const profitAmount = sellingPrice - costPrice;
  const markup = (profitAmount / costPrice) * 100;
  return {
    costPrice,
    marginPercentage,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    profitAmount: Math.round(profitAmount * 100) / 100,
    markup: Math.round(markup * 100) / 100,
  };
}

function calcTax(input: TaxInput): TaxResult {
  const { price, taxRate, priceIncludesTax } = input;
  let priceExcludingTax: number;
  let priceIncludingTax: number;
  let taxAmount: number;
  if (priceIncludesTax) {
    priceExcludingTax = price / (1 + taxRate / 100);
    taxAmount = price - priceExcludingTax;
    priceIncludingTax = price;
  } else {
    priceExcludingTax = price;
    taxAmount = price * (taxRate / 100);
    priceIncludingTax = price + taxAmount;
  }
  return {
    originalPrice: price,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    priceExcludingTax: Math.round(priceExcludingTax * 100) / 100,
    priceIncludingTax: Math.round(priceIncludingTax * 100) / 100,
  };
}

function calcDiscount(input: DiscountInput): DiscountResult {
  const { originalPrice, discountType, discountValue, quantity, bulkTiers } = input;
  let discountAmount = 0;
  let appliedTier;

  if (bulkTiers && bulkTiers.length > 0) {
    const sorted = [...bulkTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    appliedTier = sorted.find((t) => quantity >= t.minQuantity);
  }

  const effectiveDiscountValue = appliedTier ? appliedTier.discountPercentage : discountValue;
  const effectiveType = appliedTier ? 'percentage' : discountType;

  if (effectiveType === 'percentage') {
    discountAmount = (originalPrice * effectiveDiscountValue) / 100;
  } else {
    discountAmount = Math.min(effectiveDiscountValue, originalPrice);
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const totalPrice = finalPrice * quantity;
  const savings = discountAmount * quantity;

  return {
    originalPrice,
    discountType: effectiveType,
    discountValue: effectiveDiscountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    appliedTier,
  };
}

function calcShipping(input: ShippingInput): ShippingResult {
  const { weight, dimensions, destinationZone, shippingClass } = input;
  const volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
  const chargeableWeight = Math.max(weight, volumetricWeight);

  const baseRates: Record<string, number> = { standard: 3.5, express: 6.5, overnight: 12 };
  const zoneMultipliers: Record<number, number> = { 1: 1, 2: 1.3, 3: 1.6, 4: 2.0, 5: 2.5 };
  const classMultipliers: Record<string, number> = { standard: 1, express: 1.5, overnight: 2.5 };
  const deliveryTimes: Record<string, Record<number, string>> = {
    standard: { 1: '3-5 days', 2: '5-7 days', 3: '7-10 days', 4: '10-14 days', 5: '14-21 days' },
    express: { 1: '1-2 days', 2: '2-3 days', 3: '3-5 days', 4: '5-7 days', 5: '7-10 days' },
    overnight: { 1: 'Next day', 2: '1-2 days', 3: '2-3 days', 4: '3-4 days', 5: '4-5 days' },
  };

  const baseRate = baseRates[shippingClass];
  const zoneMultiplier = zoneMultipliers[destinationZone] || 1;
  const classMultiplier = classMultipliers[shippingClass];
  const estimatedCost = chargeableWeight * baseRate * zoneMultiplier;
  const estimatedDelivery = deliveryTimes[shippingClass]?.[destinationZone] || 'N/A';

  return {
    weight,
    volumetricWeight: Math.round(volumetricWeight * 100) / 100,
    chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    destinationZone,
    shippingClass,
    baseRate,
    zoneMultiplier,
    classMultiplier,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    estimatedDelivery,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, save } = body;

    if (!type || !input) {
      return NextResponse.json({ error: 'Missing type or input.' }, { status: 400 });
    }

    let result;
    switch (type) {
      case 'margin':
        if (typeof input.costPrice !== 'number' || typeof input.marginPercentage !== 'number') {
          return NextResponse.json({ error: 'Invalid margin input.' }, { status: 400 });
        }
        result = calcProfitMargin(input as ProfitMarginInput);
        break;
      case 'tax':
        if (typeof input.price !== 'number' || typeof input.taxRate !== 'number') {
          return NextResponse.json({ error: 'Invalid tax input.' }, { status: 400 });
        }
        result = calcTax(input as TaxInput);
        break;
      case 'discount':
        if (typeof input.originalPrice !== 'number') {
          return NextResponse.json({ error: 'Invalid discount input.' }, { status: 400 });
        }
        result = calcDiscount(input as DiscountInput);
        break;
      case 'shipping':
        if (typeof input.weight !== 'number' || !input.dimensions) {
          return NextResponse.json({ error: 'Invalid shipping input.' }, { status: 400 });
        }
        result = calcShipping(input as ShippingInput);
        break;
      default:
        return NextResponse.json({ error: 'Unknown calculation type.' }, { status: 400 });
    }

    if (save) {
      const ds = await getDataSource();
      const repo = ds.getRepository(Calculation);
      const calc = repo.create({
        type,
        input: JSON.stringify(input),
        result: JSON.stringify(result),
      });
      await repo.save(calc);
    }

    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
