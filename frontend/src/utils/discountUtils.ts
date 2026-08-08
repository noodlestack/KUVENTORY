import { Discount } from "@/types/discounts";

export const calculateDiscount = (
  originalAmount: number,
  discount?: Discount
): { calculatedDiscount: number; finalAmount: number } => {
  if (!discount || !discount.isActive) {
    return { calculatedDiscount: 0, finalAmount: originalAmount };
  }

  let calculatedDiscount = 0;

  if (discount.percentage && discount.percentage > 0) {
    calculatedDiscount = originalAmount * (discount.percentage / 100);
  } else if (discount.amount && discount.amount > 0) {
    calculatedDiscount = discount.amount;
  }

  // Discount validation
  if (calculatedDiscount > originalAmount) {
    calculatedDiscount = originalAmount;
  }

  if (calculatedDiscount < 0) {
    calculatedDiscount = 0;
  }

  return {
    calculatedDiscount,
    finalAmount: originalAmount - calculatedDiscount,
  };
};
