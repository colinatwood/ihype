export const checkPaymentFailures = (failures: number, total: number) =>
  total > 0 && failures / total > 0.05;
