import { FC, ReactElement, useEffect, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import Button from 'src/shared/button/Button';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import ProfileHeader from './components/ProfileHeader';
import { ISellerDocument } from '../../interfaces/seller.interface';
import equal from 'react-fast-compare';
import { addSeller } from '../../reducers/seller.reducer';
import ProfileTabs from './components/ProfileTabs';
import SellerOverview from './components/SellerOverview';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';
import { useParams } from 'react-router-dom';
import { useUpdateSellerMutation } from '../../services/seller.service';
import { IResponse } from 'src/shared/shared.interface';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import { useGetGigsBySellerIdQuery } from 'src/features/gigs/services/gigs.service';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import GigCardDisplayItem from 'src/shared/gigs/GigCardDisplayItem';
import { useGetReviewsBySellerIdQuery } from 'src/features/order/services/review.service';
import { IReviewDocument } from 'src/features/order/interfaces/review.interface';
import GigViewReview from 'src/features/gigs/components/view/components/GigViewLeft/GigViewReview';

const CurrentSellerProfile: FC = (): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const [sellerProfile, setSellerProfile] = useState<ISellerDocument>(seller);
  const [showEdit, setShowEdit] = useState<boolean>(true);
  const [type, setType] = useState<string>('Overview');
  const dispatch = useAppDispatch();
  const { sellerId } = useParams();

  const {
    data: sellerData,
    isSuccess: isGigReviewSuccess,
    isLoading: isGigReviewLoading
  } = useGetReviewsBySellerIdQuery(sellerId as string);

  let reviews: IReviewDocument[] = [];

  if (isGigReviewSuccess && sellerData?.reviews) {
    reviews = sellerData.reviews;
  }

  const [updateSeller, { isLoading: isUpdatingSeller }] = useUpdateSellerMutation();
  const { data, isLoading: isSellerGigsLoading } = useGetGigsBySellerIdQuery(sellerId as string);

  const isLoading: boolean = isUpdatingSeller || isSellerGigsLoading || isGigReviewLoading;
  useEffect(() => {
    if (seller?._id) {
      setSellerProfile(seller);
    }
  }, [seller]);

  const onUpdateSeller = async (): Promise<void> => {
    try {
      const response: IResponse = await updateSeller({
        sellerId: sellerId as string,
        seller: sellerProfile as ISellerDocument
      }).unwrap();

      dispatch(addSeller(response.seller));
      setSellerProfile(response.seller as ISellerDocument);
      setShowEdit(false);
      showSuccessToast('Seller profile updated successfully');
    } catch (error) {
      console.log(error);
      showErrorToast('Error updating profile');
    }
  };

  useEffect(() => {
    const isEqual: boolean = equal(sellerProfile, seller);
    setShowEdit(isEqual);
  }, [seller, sellerProfile]);

  return (
    <div className="relative w-full pb-6">
      <Breadcrumb breadCrumbItems={['Seller', `${seller.username}`]} />
      {isLoading && <CircularPageLoader />}
      {!isLoading && (
        <div className="container mx-auto px-2 md:px-0">
          <div className="my-2 flex h-8 justify-end md:h-10">
            {!showEdit && (
              <div>
                <Button
                  className="md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2"
                  label="Update"
                  onClick={onUpdateSeller}
                />
                &nbsp;&nbsp;
                <Button
                  className="md:text-md rounded bg-red-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-red-500 focus:outline-none md:py-2"
                  label="Cancel"
                  onClick={() => {
                    setShowEdit(false);
                    setSellerProfile(seller);
                    dispatch(addSeller(seller));
                  }}
                />
              </div>
            )}
          </div>
          <ProfileHeader sellerProfile={sellerProfile} setSellerProfile={setSellerProfile} showHeaderInfo={true} showEditIcons={true} />
          <div className="my-4 cursor-pointer">
            <ProfileTabs type={type} setType={setType} />
          </div>

          <div className="flex flex-wrap bg-white">
            {type === 'Overview' && (
              <SellerOverview sellerProfile={sellerProfile} setSellerProfile={setSellerProfile} showEditIcons={true} />
            )}
            {type === 'Active Gigs' && (
              <div className="grid gap-x-6 gap-y-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {data &&
                  data.gigs &&
                  data.gigs.map((gig: ISellerGig) => {
                    return <GigCardDisplayItem key={gig._id} gig={gig} linkTarget={false} showEditIcon={true} />;
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

export default CurrentSellerProfile;
