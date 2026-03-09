import { createSlice, Slice } from '@reduxjs/toolkit';
import { IReduxShowCategory } from '../interfaces/header.interface';

const initialState: boolean = true;

const categorySlice: Slice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    updateContainerCategory: (_state: boolean, action: IReduxShowCategory): boolean => {
      return action.payload;
    }
  }
});

export const { updateContainerCategory } = categorySlice.actions;
export default categorySlice.reducer;
