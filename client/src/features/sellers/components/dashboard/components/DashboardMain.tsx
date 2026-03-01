import 'react-lazy-load-image-component/src/effects/blur.css';
import { FC, ReactElement, useState } from 'react';
import { FaMapMarkerAlt, FaRegClock, FaUserAlt } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import StarRating from 'src/shared/rating/StarRating';
import StickyBox from 'react-sticky-box';
import { useOutletContext } from 'react-router-dom';
import { SellerContextType } from 'src/features/sellers/interfaces/seller.interface';
// import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { rating, sellerOrderList } from 'src/shared/utils/utils.service';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { cn } from 'src/shared/utils/cn';
import ActiveOrderTable from './ActiveOrderTables';
import { SELLER_GIG_STATUS } from '../ManageOrders';

const DASHBOARD_TABS = [
  { id: 'active', label: 'ACTIVE GIGS' },
  { id: 'paused', label: 'PAUSED' },
  { id: 'orders', label: 'ACTIVE ORDERS' }
] as const;

const DashboardMain: FC = (): ReactElement => {
  const [type, setType] = useState<string>('active');

  const { /*gigs, pausedGigs,*/ orders, seller } = useOutletContext<SellerContextType>();

  //   const activeGigs: ISellerGig[] = gigs.filter((gig: ISellerGig) => gig.active);

  return (
    <div className="flex flex-wrap gap-x-4">
      <div className="order-firsts w-full py-4 xl:w-1/3">
        <StickyBox offsetTop={20} offsetBottom={20}>
          <div className="border-grey border bg-white py-2">
            <div className="flex flex-col gap-y-3 pt-2">
              <div className="flex justify-center">
                <LazyLoadImage
                  src={seller?.profilePicture as string}
                  alt="Seller image"
                  className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24 lg:h-28 lg:w-28"
                  placeholderSrc="https://placehold.co/330x220?text=Profile+Image"
                  effect="blur"
                />
              </div>
              <div className="flex flex-col self-center">
                <div className="flex cursor-pointer self-center">
                  <span className="text-base font-bold">{seller?.username}</span>
                </div>
                <span className="flex self-center px-4 text-center text-xs md:text-sm">{seller?.oneliner}</span>
                {seller?.ratingSum && seller?.ratingsCount ? (
                  <div className="flex w-full justify-center gap-x-1 self-center">
                    <div className="mt-1 w-20 gap-x-2">
                      <StarRating value={rating(seller.ratingSum / seller.ratingsCount)} size={14} />
                    </div>
                    <div className="ml-2 mt-[2px] flex gap-1 text-sm">
                      <span className="text-orange-400">{seller?.ratingsCount}</span>
                      <span>{rating(seller.ratingSum / seller.ratingsCount)}</span>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="border-grey mb-2 mt-3 border-b" />
            <ul className="mb-0 list-none px-2 pt-1.5">
              <li className="mb-4 flex flex-col justify-between text-xs sm:mb-2 sm:flex-row sm:text-sm">
                <div className="col-span-3 ml-3 flex pb-0 sm:pb-3">
                  <FaMapMarkerAlt className="mr-2 mt-1" />
                  <div className="mr-3">From</div>
                </div>
                <div className="ml-8 mr-4 font-bold sm:ml-0">{seller?.country}</div>
              </li>
              <li className="mb-4 flex flex-col justify-between text-xs sm:mb-2 sm:flex-row sm:text-sm">
                <div className="col-span-3 ml-3 flex pb-0 sm:pb-3">
                  <FaUserAlt className="mr-2 mt-1" />
                  <div className="mr-3">Member since</div>
                </div>
                <div className="ml-8 mr-4 font-bold sm:ml-0">{TimeAgo.formatDateToMonthAndYear(`${seller?.createdAt || new Date()}`)}</div>
              </li>
              <li className="mb-4 flex flex-col justify-between text-xs sm:mb-2 sm:flex-row sm:text-sm">
                <div className="col-span-3 ml-3 flex pb-0 sm:pb-3">
                  <FaRegClock className="mr-2 mt-1" />
                  <div className="mr-3">Avg. Response Time</div>
                </div>
                <div className="ml-8 mr-4 font-bold sm:ml-0">
                  {seller?.responseTime || 0} hour{seller?.responseTime && seller?.responseTime > 0 ? `s` : ``}
                </div>
              </li>
              <li className="mb-4 flex flex-col justify-between text-xs sm:mb-2 sm:flex-row sm:text-sm">
                <div className="col-span-3 ml-3 flex pb-0 sm:pb-3">
                  <FaRegClock className="mr-2 mt-1" />
                  <div className="mr-3">Last Delivery</div>
                </div>
                <div className="ml-8 mr-4 font-bold sm:ml-0">{TimeAgo.dateInDays(`${seller?.recentDelivery || new Date()}`)}</div>
              </li>
            </ul>
          </div>
        </StickyBox>
      </div>

      <div className="w-full py-4 xl:w-[65%]">
        <div className="border-grey border bg-white">
          <ul className="flex w-full cursor-pointer list-none flex-col px-6 md:flex-row">
            {DASHBOARD_TABS.map(({ id, label }) => (
              <li
                key={id}
                onClick={() => setType(id)}
                className={cn('mr-9 w-full py-3 text-xs font-bold md:w-auto md:py-5 md:text-sm', {
                  'text-sky-500 md:border-b-2 md:border-sky-500': id === type
                })}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="my-3">
          {type === 'active' && <div className="grid gap-x-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>}
          {type === 'paused' && <div className="grid gap-x-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>}
          {type === 'orders' && <ActiveOrderTable activeOrders={sellerOrderList(SELLER_GIG_STATUS.IN_PROGRESS, orders)} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardMain;
