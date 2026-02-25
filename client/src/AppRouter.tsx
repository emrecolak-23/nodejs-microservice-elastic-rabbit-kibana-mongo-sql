import { useRoutes, RouteObject } from 'react-router-dom';
import { AppPage } from './features/AppPage';
import { Home } from './features/home/Home';
import ResetPassword from './features/auth/components/ResetPassword';

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
      path: '/',
      element: <Home />
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
