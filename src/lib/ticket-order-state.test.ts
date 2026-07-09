import { TicketOrderStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { voidReservedTicketOrder } from '@/lib/ticket-order-state';

type TicketOrderTx = Parameters<typeof voidReservedTicketOrder>[0];

function createTx({
  orderStatus = TicketOrderStatus.RESERVED,
  transitionCount = 1,
  releaseCount = 1,
}: {
  orderStatus?: TicketOrderStatus;
  transitionCount?: number;
  releaseCount?: number;
} = {}) {
  const ticketOrder = {
    findUnique: vi.fn().mockResolvedValue({
      id: 'order_1',
      showId: 'show_1',
      quantity: 2,
      status: orderStatus,
    }),
    updateMany: vi.fn().mockResolvedValue({ count: transitionCount }),
  };
  const show = {
    updateMany: vi.fn().mockResolvedValue({ count: releaseCount }),
  };

  return {
    tx: { ticketOrder, show } as unknown as TicketOrderTx,
    ticketOrder,
    show,
  };
}

describe('voidReservedTicketOrder', () => {
  it('atomically marks the order void and releases its reserved capacity', async () => {
    const { tx, ticketOrder, show } = createTx();

    await expect(voidReservedTicketOrder(tx, 'order_1')).resolves.toBe(true);
    expect(ticketOrder.updateMany).toHaveBeenCalledWith({
      where: { id: 'order_1', status: TicketOrderStatus.RESERVED },
      data: { status: TicketOrderStatus.VOID },
    });
    expect(show.updateMany).toHaveBeenCalledWith({
      where: { id: 'show_1', ticketsSoldCount: { gte: 2 } },
      data: { ticketsSoldCount: { decrement: 2 } },
    });
  });

  it('does nothing when the order is no longer reserved', async () => {
    const { tx, ticketOrder, show } = createTx({ orderStatus: TicketOrderStatus.CAPTURED });

    await expect(voidReservedTicketOrder(tx, 'order_1')).resolves.toBe(false);
    expect(ticketOrder.updateMany).not.toHaveBeenCalled();
    expect(show.updateMany).not.toHaveBeenCalled();
  });

  it('throws when capacity cannot be released so the surrounding transaction rolls back', async () => {
    const { tx } = createTx({ releaseCount: 0 });

    await expect(voidReservedTicketOrder(tx, 'order_1')).rejects.toThrow(
      'voided without releasing reserved capacity',
    );
  });
});
