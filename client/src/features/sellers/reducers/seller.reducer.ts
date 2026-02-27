import { createSlice, Slice } from '@reduxjs/toolkit';
import { emptySellerData } from 'src/shared/utils/static-data';
import { IReduxSeller, ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';

const initialState: ISellerDocument = emptySellerData;

const sellerSlice: Slice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    addSeller: (state: ISellerDocument, action: IReduxSeller): ISellerDocument => {
      if (!action.payload) return state;
      state = { ...action.payload };
      return state;
    },
    emptySeller: (): ISellerDocument => {
      return emptySellerData;
    }
  }
});

export const { emptySeller } = sellerSlice.actions;
export default sellerSlice.reducer;
