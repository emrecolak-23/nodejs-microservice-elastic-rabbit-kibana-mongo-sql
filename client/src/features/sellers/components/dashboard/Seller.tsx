import { FC, ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from 'src/shared/header/components/DashboardHeader';

const Seller: FC = (): ReactElement => {
  return (
    <div className="relative w-screen">
      <DashboardHeader />
      <div className="m-auto px-6 w-screen xl:container md:px-12 lg:px-6 relative min-h-secreen">
        <Outlet />
      </div>
    </div>
  );
};

export default Seller;
