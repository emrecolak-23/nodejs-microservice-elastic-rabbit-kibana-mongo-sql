import { useRoutes, RouteObject } from 'react-router-dom';
import AppPage from './features/AppPage';
import Home from './features/home/Home';
import ResetPassword from './features/auth/components/ResetPassword';
import ConfirmEmail from './features/auth/components/ConfirmEmail';

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
      element: <Home />
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
