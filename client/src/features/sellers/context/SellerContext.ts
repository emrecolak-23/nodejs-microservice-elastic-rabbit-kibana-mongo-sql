import { Context, createContext } from 'react';
import { ISellerContext } from '../interfaces/seller.interface';
import { emptySellerData } from 'src/shared/utils/static-data';

export const SellerContext: Context<ISellerContext> = createContext({
  showEditIcons: false,
  sellerProfile: emptySellerData
}) as Context<ISellerContext>;
