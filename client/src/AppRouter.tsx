import { useRoutes, RouteObject } from 'react-router-dom';
import AppPage from './features/AppPage';
import Home from './features/home/Home';
import ResetPassword from './features/auth/components/ResetPassword';
import ConfirmEmail from './features/auth/components/ConfirmEmail';
import ProtectedRoute from './features/ProtectedRoute';
import { JSX, Suspense } from 'react';
import Error from './features/error/Error';
import BuyerDashboard from './features/buyer/components/Dashboard';
import AddSeller from './features/sellers/components/add/AddSeller';
import CurrentSellerProfile from './features/sellers/components/profile/CurrentSellerProfile';
import SellerProfile from './features/sellers/components/profile/SellerProfile';
import Seller from './features/sellers/components/dashboard/Seller';
import SellerDashboard from './features/sellers/components/dashboard/SellerDashboard';
import ManageOrders from './features/sellers/components/dashboard/ManageOrders';
import ManageEarning from './features/sellers/components/dashboard/ManageEarning';
import AddGig from './features/gigs/components/gig/AddGig';
import GigView from './features/gigs/components/view/GigView';
import Gigs from './features/gigs/components/gigs/Gigs';
import EditGig from './features/gigs/components/gig/Edit.Gig';
import Chat from './features/chat/components/Chat';
import Checkout from './features/order/components/Checkout';
import Requirement from './features/order/components/Requirement';
import Order from './features/order/components/Order';

const Layout = ({ backgroundColor = '#fffff', children }: { backgroundColor?: string; children: React.ReactNode }): JSX.Element => {
  return (
    <div style={{ backgroundColor }} className="flex flex-grow">
      {children}
    </div>
  );
};

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
            <Layout backgroundColor="#fffff">
              <Home />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/users/:username/:buyerId/orders',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <BuyerDashboard />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller-onboarding',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <AddSeller />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller-profile/:username/:sellerId/edit',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <CurrentSellerProfile />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller-profile/:username/:sellerId/view',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <SellerProfile />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/:username/:sellerId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Seller />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        {
          path: 'seller-dashboard',
          element: <SellerDashboard />
        },
        {
          path: 'manage-orders',
          element: <ManageOrders />
        },
        {
          path: 'manage-earnings',
          element: <ManageEarning />
        }
      ]
    },
    {
      path: '/manage-gigs/new/:sellerId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <AddGig />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/manage-gigs/edit/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <EditGig />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/:username/:title/:sellerId/:gigId/view',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <GigView />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/categories/:category',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Gigs type="categories" />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/search/gigs',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Gigs type="search" />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/inbox',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/inbox/:username/:conversationId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/checkout/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Checkout />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/order/requirement/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Requirement />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/orders/:orderId/activities',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#fffff">
              <Order />
            </Layout>
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
