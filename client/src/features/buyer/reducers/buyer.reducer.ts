import { createSlice, Slice } from '@reduxjs/toolkit';
import { IBuyerDocument, IReduxBuyer } from '../interfaces/buyer.interface';
import { emptyBuyerData } from 'src/shared/utils/static-data';

const initialState: IBuyerDocument = emptyBuyerData;

const buyerSlice: Slice = createSlice({
  name: 'buyer',
  initialState,
  reducers: {
    addBuyer: (state: IBuyerDocument, action: IReduxBuyer): IBuyerDocument => {
      state = action.payload;
      return state;
    },
    emptyBuyer: (): IBuyerDocument => {
      return emptyBuyerData;
    }
  }
});

export const { addBuyer, emptyBuyer } = buyerSlice.actions;
export default buyerSlice.reducer;
