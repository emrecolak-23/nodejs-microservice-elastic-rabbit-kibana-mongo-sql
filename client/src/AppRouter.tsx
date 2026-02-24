import { useRoutes, RouteObject } from 'react-router-dom';
import { AppPage } from './features/AppPage';
import { Home } from './features/home/Home';

const AppRouter = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <AppPage />
    },
    {
      path: '/',
      element: <Home />
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
