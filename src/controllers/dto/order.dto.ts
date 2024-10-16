import { OrderStatus } from '../../database';

export interface UpdateOrderStatusDto {
  orderId: number;
  action: OrderStatus;
}
