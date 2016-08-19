/**
 * Calculates loan RPSN
 * @param amount        Loan amount
 * @param installments  Number of installments
 * @param rate          Interest rate in percents (eg. 3.3)
 * @param charges       Sum of monthly charges
 * @returns {number}
 */
export function getRpsn(amount, installments, rate, charges) {
  return amount + installments + rate + charges
}
