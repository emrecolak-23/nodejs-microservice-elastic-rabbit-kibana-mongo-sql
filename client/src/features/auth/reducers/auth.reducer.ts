import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { IAuthUser, IReduxAddAuthUser } from '../interfaces/auth.interface';
import { initialAuthUserValues } from 'src/shared/utils/static-data';

const initialState: IAuthUser = { ...initialAuthUserValues } as IAuthUser;

const authSlice: Slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addAuthUser: (state: IAuthUser, action: IReduxAddAuthUser): IAuthUser => {
      const { authInfo } = action.payload;
      state = { ...authInfo } as unknown as IAuthUser;
      return state;
    },
    clearAuthUser: (): IAuthUser => {
      return { ...initialState } as unknown as IAuthUser;
    }
  }
});

export const { addAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
