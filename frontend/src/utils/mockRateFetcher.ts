/**
 * Mock rate fetcher utility.
 * All values are ESTIMATED and not live market data.
 * For demonstration purposes only.
 */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Returns a realistic mock stock price in INR for US-listed stocks.
 * Generates a USD price in the $15–$1000 range based on stock name hash,
 * then converts to INR at a realistic exchange rate of ₹83–₹85 per USD.
 * Result: approximately ₹1,245–₹85,000 per share.
 */
export async function fetchMockStockRate(stockName: string): Promise<number> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));

  const hash = hashString(stockName.toUpperCase().trim());

  // USD price range: $15 to $1000 per share (realistic for US equities)
  const usdMin = 15;
  const usdMax = 1000;
  const usdPrice = usdMin + (hash % (usdMax - usdMin + 1));

  // INR/USD exchange rate: ₹83 to ₹85
  const inrRateMin = 83;
  const inrRateMax = 85;
  // Use a secondary hash variation for the exchange rate
  const exchangeRate = inrRateMin + ((hash >> 4) % (inrRateMax - inrRateMin + 1));

  const inrPrice = usdPrice * exchangeRate;

  // Round to nearest ₹10 for cleaner display
  return Math.round(inrPrice / 10) * 10;
}

/**
 * Returns a realistic mock gold rate in INR per gram.
 * Range: ₹8,000–₹9,500/gram (reflecting 2025–2026 Indian market prices).
 */
export async function fetchMockGoldRate(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));

  const min = 8000;
  const max = 9500;
  const rate = min + Math.floor(Math.random() * (max - min + 1));

  // Round to nearest ₹50
  return Math.round(rate / 50) * 50;
}

/**
 * Returns a realistic mock silver rate in INR per gram.
 * Range: ₹90–₹110/gram (reflecting 2025–2026 Indian market prices).
 */
export async function fetchMockSilverRate(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));

  const min = 90;
  const max = 110;
  const rate = min + Math.floor(Math.random() * (max - min + 1));

  // Round to nearest ₹0.50
  return Math.round(rate * 2) / 2;
}
