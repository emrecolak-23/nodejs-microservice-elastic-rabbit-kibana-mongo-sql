import { FC, ReactElement, useRef } from 'react';
import { useParams } from 'react-router-dom';
import StickyBox from 'react-sticky-box';
import StarRating from 'src/shared/rating/StarRating';
import { useGetGigByIdQuery, useGetMoreGigsLikeThisQuery } from '../../services/gigs.service';
import { useGetSellerByIdQuery } from 'src/features/sellers/services/seller.service';
import { ISellerGig } from '../../interfaces/gig.interface';
import { emptyGigData, emptySellerData } from 'src/shared/utils/static-data';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';
import { rating, shortenLargeNumbers } from 'src/shared/utils/utils.service';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import { GigContext } from '../../context/GigContext';
import GigViewRight from './components/GigViewRight';
import GigViewLeft from './components/GigViewLeft';
import TopGigsView from 'src/shared/gigs/TopGigsView';

const GigView: FC = (): ReactElement => {
  const { gigId, sellerId } = useParams<string>();

  const { data: gigData, isSuccess: isGigDataSuccess, isLoading: isGigDataLoading } = useGetGigByIdQuery(gigId as string);
  const { data: sellerData, isSuccess: isSellerDataSuccess, isLoading: isSellerDataLoading } = useGetSellerByIdQuery(sellerId as string);
  const {
    data: moreGigsData,
    isSuccess: isMoreGigsDataSuccess,
    isLoading: isMoreGigsDataLoading
  } = useGetMoreGigsLikeThisQuery(`${gigId}`);

  console.log(moreGigsData, 'moreGigsData');

  const gig = useRef<ISellerGig>(emptyGigData);
  const seller = useRef<ISellerDocument>(emptySellerData);
  const moreGigs = useRef<ISellerGig[]>([]);

  const isLoading = isGigDataLoading || isSellerDataLoading || isMoreGigsDataLoading;

  if (isGigDataSuccess) {
    gig.current = gigData.gig as ISellerGig;
  }

  if (isSellerDataSuccess) {
    seller.current = sellerData.seller as ISellerDocument;
  }

  if (isMoreGigsDataSuccess) {
    moreGigs.current = moreGigsData.gigs as ISellerGig[];
  }

  return (
    <>
      {isLoading ? (
        <CircularPageLoader />
      ) : (
        <main className="max-w-8xl container mx-auto mt-8">
          <h2 className="mb-4 px-4 text-xl font-bold text-[#404145] lg:text-3xl">{gig.current.title}</h2>
          <div className="mb-4 flex flex-row gap-x-2 px-4">
            <img
              className="flex h-8 w-8 self-center rounded-full object-cover"
              src={gig.current.profilePicture || 'https://placehold.co/330x220?text=Profile+Image'}
              alt=""
            />
            <span className="flex self-center font-extrabold">{gig.current.username}</span>
            <>
              {gig.current.ratingSum && gig.current.ratingsCount && gig.current.ratingSum >= 1 ? (
                <>
                  <span className="flex self-center">|</span>
                  <div className="flex w-full gap-x-1 self-center">
                    <div className="mt-1 w-20 gap-x-2">
                      <StarRating value={rating(gig.current.ratingSum / gig.current.ratingsCount)} size={14} />
                    </div>
                    <div className="ml-2 mt-[1px] flex gap-1 text-sm">
                      <span className="text-orange-400">{rating(gig.current.ratingSum / gig.current.ratingsCount)}</span>
                      <span className="">({shortenLargeNumbers(gig.current.ratingsCount)})</span>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </>
          </div>
          <GigContext.Provider
            value={{ gig: gig.current, seller: seller.current, isSuccess: isGigDataSuccess && isSellerDataSuccess, isLoading: isLoading }}
          >
            <div className="flex flex-wrap">
              <div className="order-last w-full p-4 lg:order-first lg:w-2/3">
                <GigViewLeft />
              </div>

              <div className="w-full p-4 lg:w-1/3 ">
                <StickyBox offsetTop={10} offsetBottom={10}>
                  <GigViewRight />
                </StickyBox>
              </div>
            </div>
            {moreGigs.current.length > 0 ? (
              <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
                <TopGigsView
                  gigs={moreGigs.current}
                  width="w-60"
                  type="view"
                  title="Recommended For You"
                  category={gig.current.categories}
                  subTitle="Check out these other gigs that are similar to this one."
                />
              </div>
            ) : (
              <></>
            )}
          </GigContext.Provider>
        </main>
      )}
    </>
  );
};

export default GigView;
