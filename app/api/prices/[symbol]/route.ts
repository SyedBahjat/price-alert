import { NextRequest, NextResponse } from 'next/server';
import { getPrice } from '@/lib/prices/resolver';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const assetType = symbol.endsWith('USDT') ? 'crypto' : 'stock';
    const price = await getPrice(symbol, assetType);
    return NextResponse.json({ symbol, price, assetType });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch price';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
