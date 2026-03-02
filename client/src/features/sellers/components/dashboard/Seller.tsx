import { FC, ReactElement } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import DashboardHeader from 'src/shared/header/components/DashboardHeader';
import { useGetSellerByIdQuery } from '../../services/seller.service';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { ISellerDocument } from '../../interfaces/seller.interface';
import { useGetGigsBySellerIdQuery, useGetSellerPausedGigsQuery } from 'src/features/gigs/services/gigs.service';

const Seller: FC = (): ReactElement => {
  const { sellerId } = useParams();
  const { data, isSuccess } = useGetSellerByIdQuery(sellerId as string);
  const { data: sellerGigs, isSuccess: isSellerGigsSuccess } = useGetGigsBySellerIdQuery(sellerId as string, {
    skip: !sellerId
  });
  const { data: pausedGigs, isSuccess: isPausedGigsSuccess } = useGetSellerPausedGigsQuery(sellerId as string, {
    skip: !sellerId
  });

  const orders: IOrderDocument[] = [];
  let gigs: ISellerGig[] = [];
  let pausedGig: ISellerGig[] = [];
  let seller: ISellerDocument | undefined = undefined;

  if (isSuccess) {
    seller = data.seller as ISellerDocument;
  }

  if (isSellerGigsSuccess && sellerGigs?.gigs) {
    gigs = sellerGigs.gigs;
  }

  if (isPausedGigsSuccess && pausedGigs?.gigs) {
    pausedGig = pausedGigs.gigs;
  }

  return (
    <div className="relative w-screen">
      <DashboardHeader />
      <div className="m-auto px-6 w-screen xl:container md:px-12 lg:px-6 relative min-h-secreen">
        <Outlet context={{ seller, gigs, pausedGigs: pausedGig, orders }} />
      </div>
    </div>
  );
};

export default Seller;
