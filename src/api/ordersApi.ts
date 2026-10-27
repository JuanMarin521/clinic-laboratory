import type { Order } from '../types/exam';
import { apiRequest } from './apiClient';

/** Llama a GET /orders/latest (requiere token): la orden de la última visita, o `null` si no tiene. */
export function fetchLatestOrder(token: string): Promise<Order | null> {
  return apiRequest<Order | null>('/orders/latest', { token });
}

/** Llama a GET /orders (requiere token): todas las órdenes, de la más reciente a la más antigua. */
export function fetchOrders(token: string): Promise<Order[]> {
  return apiRequest<Order[]>('/orders', { token });
}
