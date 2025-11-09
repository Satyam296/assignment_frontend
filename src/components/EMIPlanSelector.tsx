import React from 'react';
import { calculateMonthlyEMI } from '../utils/emiCalculator';

export interface EMIPlan {
  id: string;
  tenure: number;
  monthlyPayment?: number; // Optional now, will be calculated
  interestRate: number;
  cashback?: number;
  mutualFundName?: string;
}

interface EMIPlanSelectorProps {
  plans: EMIPlan[];
  selectedPlan: EMIPlan | null;
  onPlanChange: (plan: EMIPlan) => void;
  variantPrice: number;
  downpayment?: number;
}

export const EMIPlanSelector: React.FC<EMIPlanSelectorProps> = ({
  plans,
  selectedPlan,
  onPlanChange,
  variantPrice,
  downpayment = 0,
}) => {
  // Calculate EMI for each plan based on variant price minus downpayment
  const getMonthlyPayment = (plan: EMIPlan): number => {
    const loanAmount = variantPrice - downpayment;
    return calculateMonthlyEMI(loanAmount, plan.interestRate, plan.tenure);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Choose EMI Tenure</h3>
      <div className="space-y-3">
        {plans.map((plan) => {
          const monthlyPayment = getMonthlyPayment(plan);
          return (
            <label key={plan.id} className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-all">
              <input
                type="radio"
                name="emi-plan"
                checked={selectedPlan?.id === plan.id}
                onChange={() => onPlanChange({ ...plan, monthlyPayment })}
                className="mt-1 w-4 h-4 text-primary cursor-pointer"
              />
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      ₹{monthlyPayment.toLocaleString()} × {plan.tenure} months
                    </p>
                    <p className="text-sm text-gray-600">
                      {plan.interestRate === 0 ? '0% EMI' : `${plan.interestRate}% per month`}
                    </p>
                  </div>
                  <div className="text-right">
                    {plan.cashback ? (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Cashback: ₹{plan.cashback}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No cashback</span>
                    )}
                  </div>
                </div>
                {plan.mutualFundName && (
                  <p className="text-xs text-gray-500 mt-1">Fund: {plan.mutualFundName}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
