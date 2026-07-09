import {
  AccountsPayableCategory,
  AccountsPayableStatus,
  Prisma,
  TicketOrderStatus,
} from '@prisma/client';
import { createSerializedTicketId } from '@/lib/tickets';

type DbClient = typeof import('@/lib/db').db;
type Tx = Pick<
  DbClient,
  'ticketOrder' | 'ticket' | 'accountsPayableEntry' | 'show'
>;

function buildPayableEntries(
  show: { id: string; venueProfileId: string | null; headlinerProfileId: string | null },
  order: {
    id: string;
    affiliatePromoterProfileId: string | null;
    taxLocalCents: number;
    taxStateCents: number;
    taxCountryCents: number;
    taxInternationalCents: number;
    venuePayoutCents: number;
    artistPayoutCents: number;
    promoterPayoutCents: number;
  },
) {
  const entries: Prisma.AccountsPayableEntryCreateManyInput[] = [];
  const push = (
    amountCents: number,
    category: AccountsPayableCategory,
    payeeLabel: string,
    note: string,
    profileId: string | null = null,
  ) => {
    if (amountCents <= 0) return;
    entries.push({
      ticketOrderId: order.id,
      showId: show.id,
      profileId,
      category,
      status: AccountsPayableStatus.PENDING,
      amountCents,
      payeeLabel,
      note,
    });
  };

  push(order.taxLocalCents, 'TAX_LOCAL', 'Local tax payable', 'Captured ticket order tax.');
  push(order.taxStateCents, 'TAX_STATE', 'State / province tax payable', 'Captured ticket order tax.');
  push(order.taxCountryCents, 'TAX_COUNTRY', 'Country tax payable', 'Captured ticket order tax.');
  push(order.taxInternationalCents, 'TAX_INTERNATIONAL', 'International tax payable', 'Captured ticket order tax.');
  push(order.venuePayoutCents, 'VENUE_PAYOUT', 'Venue payout', 'Venue payout from captured ticket order.', show.venueProfileId);
  push(order.artistPayoutCents, 'ARTIST_PAYOUT', 'Artist payout', 'Artist payout from captured ticket order.', show.headlinerProfileId);
  push(
    order.promoterPayoutCents,
    'PROMOTER_AFFILIATE',
    order.affiliatePromoterProfileId ? 'Affiliate promoter payout' : 'Promoter affiliate pool',
    'Affiliate payout from captured ticket order.',
    order.affiliatePromoterProfileId,
  );

  return entries;
}

export async function finalizeCapturedTicketOrder(
  tx: Tx,
  orderId: string,
  chargedAt = new Date(),
) {
  const order = await tx.ticketOrder.findUnique({
    where: { id: orderId },
    include: {
      show: { select: { id: true, venueProfileId: true, headlinerProfileId: true } },
      tickets: true,
    },
  });

  if (!order) throw new Error(`Ticket order ${orderId} not found.`);
  if (order.status === TicketOrderStatus.CAPTURED) return { order, tickets: order.tickets, changed: false };
  if (order.status !== TicketOrderStatus.RESERVED) {
    throw new Error(`Ticket order ${orderId} is not capturable from status ${order.status}.`);
  }

  const transitioned = await tx.ticketOrder.updateMany({
    where: { id: order.id, status: TicketOrderStatus.RESERVED },
    data: { status: TicketOrderStatus.CAPTURED, chargedAt },
  });
  if (transitioned.count !== 1) {
    const current = await tx.ticketOrder.findUnique({ where: { id: order.id }, include: { tickets: true } });
    if (current?.status === TicketOrderStatus.CAPTURED) {
      return { order: current, tickets: current.tickets, changed: false };
    }
    throw new Error(`Ticket order ${order.id} changed while it was being captured.`);
  }

  const tickets = await Promise.all(
    Array.from({ length: order.quantity }, () =>
      tx.ticket.create({
        data: {
          serializedId: createSerializedTicketId(),
          ticketOrderId: order.id,
          showId: order.showId,
          venueProfileId: order.show.venueProfileId,
          holderName: order.buyerName,
          holderEmail: order.buyerEmail,
        },
      }),
    ),
  );

  const payableEntries = buildPayableEntries(order.show, order);
  if (payableEntries.length) await tx.accountsPayableEntry.createMany({ data: payableEntries });

  return { order: { ...order, status: TicketOrderStatus.CAPTURED, chargedAt }, tickets, changed: true };
}

export async function voidReservedTicketOrder(tx: Tx, orderId: string) {
  const order = await tx.ticketOrder.findUnique({
    where: { id: orderId },
    select: { id: true, showId: true, quantity: true, status: true },
  });
  if (!order || order.status !== TicketOrderStatus.RESERVED) return false;

  const transitioned = await tx.ticketOrder.updateMany({
    where: { id: order.id, status: TicketOrderStatus.RESERVED },
    data: { status: TicketOrderStatus.VOID },
  });
  if (transitioned.count !== 1) return false;

  const released = await tx.show.updateMany({
    where: { id: order.showId, ticketsSoldCount: { gte: order.quantity } },
    data: { ticketsSoldCount: { decrement: order.quantity } },
  });
  if (released.count !== 1) {
    throw new Error(`Ticket order ${order.id} was voided without releasing reserved capacity.`);
  }

  return true;
}
