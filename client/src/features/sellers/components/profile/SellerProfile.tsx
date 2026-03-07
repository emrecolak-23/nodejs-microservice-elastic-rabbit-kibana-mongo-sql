import { FC, ReactElement, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import { ISellerDocument } from '../../interfaces/seller.interface';
import ProfileTabs from './components/ProfileTabs';
import SellerOverview from './components/SellerOverview';
import { useParams } from 'react-router-dom';
import { useGetSellerByIdQuery } from '../../services/seller.service';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import { useGetGigsBySellerIdQuery } from 'src/features/gigs/services/gigs.service';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import GigCardDisplayItem from 'src/shared/gigs/GigCardDisplayItem';
import GigViewReview from 'src/features/gigs/components/view/components/GigViewLeft/GigViewReview';
import { useGetReviewsBySellerIdQuery } from 'src/features/order/services/review.service';
import { IReviewDocument } from 'src/features/order/interfaces/review.interface';

const SellerProfile: FC = (): ReactElement => {
  const [type, setType] = useState<string>('Overview');

  const { sellerId } = useParams();

  const { data: sellerData, isLoading: isLoadingSeller, isSuccess: isSuccessSeller } = useGetSellerByIdQuery(sellerId as string);
  const { data: gigsData, isLoading: isLoadingGigs, isSuccess: isSuccessGigs } = useGetGigsBySellerIdQuery(sellerId as string);

  const {
    data: sellerReviewsData,
    isSuccess: isGigReviewSuccess,
    isLoading: isGigReviewLoading
  } = useGetReviewsBySellerIdQuery(`${sellerId}`);

  let reviews: IReviewDocument[] = [];

  if (isGigReviewSuccess && sellerReviewsData?.reviews) {
    reviews = sellerReviewsData.reviews;
  }

  const isLoading: boolean = isLoadingSeller || isLoadingGigs || isGigReviewLoading;
  const isSuccess: boolean = isSuccessSeller || isSuccessGigs;

  return (
    <div className="relative w-full pb-6">
      <Breadcrumb breadCrumbItems={['Seller', `${sellerData && sellerData?.seller ? sellerData?.seller?.username : ''}`]} />
      {isLoading && <CircularPageLoader />}
      {!isLoading && (
        <div className="container mx-auto px-2 md:px-0">
          <ProfileHeader sellerProfile={sellerData?.seller as ISellerDocument} showHeaderInfo={true} showEditIcons={false} />
          <div className="my-4 cursor-pointer">
            <ProfileTabs type={type} setType={setType} />
          </div>

          <div className="flex flex-wrap bg-white">
            {type === 'Overview' && <SellerOverview sellerProfile={sellerData?.seller as ISellerDocument} showEditIcons={false} />}
            {type === 'Active Gigs' && (
              <div className="grid gap-x-6 gap-y-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {isSuccess &&
                  gigsData &&
                  gigsData.gigs &&
                  gigsData.gigs.map((gig: ISellerGig) => {
                    return <GigCardDisplayItem key={gig._id} gig={gig} linkTarget={false} showEditIcon={false} />;
                  })}
              </div>
            )}
            {type === 'Ratings & Reviews' && <GigViewReview showRatings={false} reviews={reviews} hasFetchedReviews={true} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;
