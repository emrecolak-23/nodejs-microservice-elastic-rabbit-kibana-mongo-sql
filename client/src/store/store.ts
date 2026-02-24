import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { AnyAction, Reducer } from 'redux';
import { persistReducer } from 'redux-persist';

export const combineReducer = combineReducers({});

export type RootState = ReturnType<typeof combineReducer>;

export const rootReducer: Reducer<RootState, AnyAction> = (state, action) => {
  // this is to reset the state to default when user logout
  if (action.type === 'logout/logout') {
    state = {} as RootState;
  }

  return combineReducer(state, action as never);
};

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['clientApi', '_persist']
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
