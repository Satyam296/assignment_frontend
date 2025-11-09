/**
 * Calculate EMI (Equated Monthly Installment)
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * Where:
 *   P = Principal (loan amount)
 *   r = Monthly interest rate (annual rate / 12 / 100)
 *   n = Number of months (tenure)
 */
export const calculateMonthlyEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): number => {
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) {
    // Simple division for 0% interest
    return Math.round(principal / tenureMonths);
  }
  
  // EMI formula calculation
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  return Math.round(numerator / denominator);
};

/**
 * Calculate total amount to be paid over the entire tenure
 */
export const calculateTotalAmount = (
  monthlyEMI: number,
  tenureMonths: number
): number => {
  return monthlyEMI * tenureMonths;
};
