import storage from 'redux-persist/lib/storage';
import { combineReducers, configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { AnyAction, Reducer } from 'redux';
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const combineReducer = combineReducers({});

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

export const store: EnhancedStore = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
