import { useRoutes, RouteObject } from 'react-router-dom';
import AppPage from './features/AppPage';
import Home from './features/home/Home';
import ResetPassword from './features/auth/components/ResetPassword';
import ConfirmEmail from './features/auth/components/ConfirmEmail';
import ProtectedRoute from './features/ProtectedRoute';
import { Suspense } from 'react';
import Error from './features/error/Error';

const AppRouter = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <AppPage />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    },
    {
      path: '/confirm-email',
      element: <ConfirmEmail />
    },
    {
      path: '/',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '*',
      element: (
        <Suspense>
          <Error />
        </Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
