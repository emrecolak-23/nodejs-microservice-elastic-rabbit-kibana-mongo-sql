import { FC, ReactElement } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import DashboardHeader from 'src/shared/header/components/DashboardHeader';
import { useGetSellerByIdQuery } from '../../services/seller.service';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { ISellerDocument } from '../../interfaces/seller.interface';

const Seller: FC = (): ReactElement => {
  const { sellerId } = useParams();
  const { data, isSuccess } = useGetSellerByIdQuery(sellerId as string);

  const orders: IOrderDocument[] = [];
  const gigs: ISellerGig[] = [];
  const pausedGig: ISellerGig[] = [];
  let seller: ISellerDocument | undefined = undefined;

  if (isSuccess) {
    seller = data.seller as ISellerDocument;
  }

  return (
    <div className="relative w-screen">
      <DashboardHeader />
      <div className="m-auto px-6 w-screen xl:container md:px-12 lg:px-6 relative min-h-secreen">
        <Outlet context={{ seller, gigs, pausedGig, orders }} />
      </div>
    </div>
  );
};

export default Seller;
