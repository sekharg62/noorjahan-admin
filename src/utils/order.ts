import type { Order } from '../types/order';

export function getOrderCustomerName(order: Order): string {
  return order.customer?.name ?? order.guest?.name ?? '—';
}

export function getOrderCustomerPhone(order: Order): string {
  return order.customer?.phone ?? order.guest?.phone ?? '—';
}

export function getOrderCustomerEmail(order: Order): string {
  return order.customer?.email ?? order.guest?.email ?? '—';
}

export function getOrderItemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatOrderMoney(value: string): string {
  const trimmed = value.trim();
  return trimmed ? `₹${trimmed}` : '—';
}

export function isGuestOrder(order: Order): boolean {
  return order.customer == null && order.guest != null;
}
