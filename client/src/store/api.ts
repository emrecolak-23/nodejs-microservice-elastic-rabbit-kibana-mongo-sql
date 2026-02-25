import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

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
    // get Username from local storage
    const loggedInUsername: string = localStorage.getItem('loggedInUsername') || '';
    await baseQuery(`/auth/refresh-token/${loggedInUsername}`, api, extraOptions);
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
