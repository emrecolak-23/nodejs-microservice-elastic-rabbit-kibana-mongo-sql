import { createContext, Context } from 'react';
import { IOrderContext, IOrderDocument, IOrderInvoice } from '../interfaces/order.interface';
import { IAuthUser } from 'src/features/auth/interfaces/auth.interface';

export const OrderContext: Context<IOrderContext> = createContext<IOrderContext>({
  order: {} as IOrderDocument,
  authUser: {} as IAuthUser,
  orderInvoice: {} as IOrderInvoice
});
