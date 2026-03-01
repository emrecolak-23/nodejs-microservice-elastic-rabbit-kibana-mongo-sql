import { createSlice, Slice } from '@reduxjs/toolkit';
import { IReduxShowCategory } from '../interfaces/header.interface';

const initialState: boolean = true;

const categorySlice: Slice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    updateContainerCategory: (state: boolean, action: IReduxShowCategory): boolean => {
      state = action.payload;
      return action.payload;
    }
  }
});

export const { updateContainerCategory } = categorySlice.actions;
export default categorySlice.reducer;
