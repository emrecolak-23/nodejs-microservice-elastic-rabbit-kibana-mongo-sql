import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { useNavigate } from 'react-router-dom';
import { applicationLogout, getDataFromSessionStorage } from 'src/shared/utils/utils.service';

const BASE_ENDPOINT = 'https://jobberemre.com';

const baseQuery = fetchBaseQuery({
  baseUrl: `${BASE_ENDPOINT}/api/gateway/v1`,
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
        await baseQuery(`/auth/refresh-token/${loggedInUsername}`, api, extraOptions);
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
