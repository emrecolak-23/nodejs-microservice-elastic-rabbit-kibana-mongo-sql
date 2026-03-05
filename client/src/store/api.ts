import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useNavigate } from 'react-router-dom';
import { applicationLogout, getDataFromSessionStorage, saveTokenToSessionStorage } from 'src/shared/utils/utils.service';
import { socketService } from 'src/sockets/socket.service';

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_BASE_ENDPOINT}/api/gateway/v1`,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
  credentials: 'include'
});

const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    try {
      const isLoggedIn = getDataFromSessionStorage('isLoggedIn');
      const loggedInUsername: string = getDataFromSessionStorage('loggedInuser') || '';
      if (isLoggedIn && loggedInUsername) {
        const refreshResult = await baseQuery(`/auth/refresh-token/${loggedInUsername}`, api, extraOptions);
        if (refreshResult.data && typeof refreshResult.data === 'object' && 'token' in refreshResult.data) {
          const token = (refreshResult.data as { token?: string }).token;
          if (token) {
            saveTokenToSessionStorage(token);
            socketService.setupSocketConnection();
          }
        }
      }
    } catch {
      applicationLogout(api.dispatch, useNavigate());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'clientApi',
  baseQuery: baseQueryWithReAuth,
  tagTypes: [
    'Auth',
    'CurrentUser',
    'Buyer',
    'Seller',
    'Chat',
    'Checkout',
    'Gigs',
    'Search',
    'Review',
    'Order',
    'Notification',
    'Currentuser'
  ],
  endpoints: () => ({})
});
