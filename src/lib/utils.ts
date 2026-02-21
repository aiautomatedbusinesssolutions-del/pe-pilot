/**
 * Derive EPS growth and forward P/E from trailing P/E and PEG.
 *
 *   EPS Growth  = P/E ÷ PEG
 *   Forward P/E ≈ Trailing P/E ÷ (1 + growth / 100)
 */
export function deriveMetrics(
  peRatio: number | null,
  pegRatio: number | null,
): { epsGrowth: number | null; forwardPE: number | null } {
  let epsGrowth: number | null = null;
  if (peRatio && pegRatio && pegRatio !== 0) {
    epsGrowth = peRatio / pegRatio;
  }

  let forwardPE: number | null = null;
  if (peRatio && epsGrowth && epsGrowth > 0) {
    forwardPE = peRatio / (1 + epsGrowth / 100);
  }

  return { epsGrowth, forwardPE };
}
