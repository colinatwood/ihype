export const PLATFORM_COMMISSION_PERCENT = 0;
export const PROMOTER_POOL_PERCENT = 5;
export const REMAINING_PAYOUT_PERCENT = 100 - PLATFORM_COMMISSION_PERCENT - PROMOTER_POOL_PERCENT;

type SplitInput = {
  venuePayoutPercent: number;
  artistPayoutPercent: number;
  promoterPayoutPercent?: number;
};

type OrderInput = SplitInput & {
  ticketPriceCents: number;
  quantity: number;
};

export function validateTicketSplit({
  venuePayoutPercent,
  artistPayoutPercent,
  promoterPayoutPercent = PROMOTER_POOL_PERCENT
}: SplitInput) {
  if (!Number.isInteger(venuePayoutPercent) || !Number.isInteger(artistPayoutPercent)) {
    throw new Error('Venue and artist payout percentages must be whole numbers.');
  }

  if (promoterPayoutPercent !== PROMOTER_POOL_PERCENT) {
    throw new Error(`Promoter payout must stay fixed at ${PROMOTER_POOL_PERCENT}%.`);
  }

  if (venuePayoutPercent < 0 || artistPayoutPercent < 0) {
    throw new Error('Payout percentages cannot be negative.');
  }

  if (venuePayoutPercent + artistPayoutPercent !== REMAINING_PAYOUT_PERCENT) {
    throw new Error(
      `Venue and artist percentages must total ${REMAINING_PAYOUT_PERCENT}% when the promoter pool is fixed at ${PROMOTER_POOL_PERCENT}%.`
    );
  }
}

export function calculateTicketOrderPayouts({
  ticketPriceCents,
  quantity,
  venuePayoutPercent,
  artistPayoutPercent,
  promoterPayoutPercent = PROMOTER_POOL_PERCENT
}: OrderInput) {
  validateTicketSplit({
    venuePayoutPercent,
    artistPayoutPercent,
    promoterPayoutPercent
  });

  if (!Number.isInteger(ticketPriceCents) || ticketPriceCents <= 0) {
    throw new Error('Ticket price must be a positive whole number of cents.');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Ticket quantity must be a positive whole number.');
  }

  const subtotalCents = ticketPriceCents * quantity;
  const venuePayoutCents = Math.round(subtotalCents * (venuePayoutPercent / 100));
  const promoterPayoutCents = Math.round(subtotalCents * (promoterPayoutPercent / 100));
  const artistPayoutCents = subtotalCents - venuePayoutCents - promoterPayoutCents;

  return {
    subtotalCents,
    venuePayoutCents,
    artistPayoutCents,
    promoterPayoutCents,
    platformCommissionCents: 0
  };
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amountCents / 100);
}

export function formatPercent(value: number) {
  return `${value}%`;
}
