import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { IGigsProps, ISellerGig } from '../../interfaces/gig.interface';
import BudgetDropwdown from './components/BudgetDropwdown';
import DeliveryTimeDropdown from './components/DeliveryTimeDropdown';
import { Location, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  replaceAmpersandAndDashWithSpace,
  replaceDashWithSpaces,
  replaceSpacesWithDash,
  lowerCase,
  getDataFromLocalStorage,
  saveToLocalStorage,
  categories
} from 'src/shared/utils/utils.service';
import { useSearchGigsQuery } from '../../services/search.service';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import GigCardDisplayItem from 'src/shared/gigs/GigCardDisplayItem';
import PageMessage from 'src/shared/page-message/PageMessage';
import GigPaginate from 'src/shared/gigs/GigPaginate';

const ITEMS_PER_PAGE = 10;

const Gigs: FC<IGigsProps> = ({ type }): ReactElement => {
  const [itemFrom, setItemFrom] = useState<string>('0');
  const [paginationType, setPaginationType] = useState<string>('forward');
  const [searchParams] = useSearchParams();
  const { category } = useParams<string>();
  const location: Location = useLocation();
  const updatedSearchParams: URLSearchParams = new URLSearchParams(searchParams.toString());
  const queryType: string =
    type === 'search'
      ? replaceDashWithSpaces(`${updatedSearchParams}`)
      : `query=${replaceAmpersandAndDashWithSpace(`${lowerCase(`${category}`)}`)}&${updatedSearchParams.toString()}`;

  const { data, isSuccess, isLoading, isError } = useSearchGigsQuery({
    query: `${queryType}`,
    from: itemFrom,
    size: `${ITEMS_PER_PAGE}`,
    type: paginationType
  });

  const gigs = useRef<ISellerGig[]>([]);

  useEffect(() => {
    setItemFrom('0');
    setPaginationType('forward');
  }, [queryType]);

  let totalGigs = 0;

  if (isSuccess) {
    gigs.current = data?.gigs as ISellerGig[];
    totalGigs = data.total ?? 0;
  }

  const filterApplied = getDataFromLocalStorage('filterApplied');
  const categoryName = categories().find((item) => location.pathname.includes(replaceSpacesWithDash(item)));
  const gigCategories = categoryName ?? searchParams.get('query');
  if (isSuccess) {
    saveToLocalStorage('filterApplied', JSON.stringify(false));
  }

  return (
    <>
      {isLoading && !isSuccess ? (
        <CircularPageLoader />
      ) : (
        <div className="container mx-auto items-center p-5">
          {!isLoading && data && data.gigs && data?.gigs.length > 0 ? (
            <>
              <h3 className="mb-5 flex gap-3 text-4xl">
                {type === 'search' && <span className="text-black">Results for</span>}
                <strong className="text-black">{gigCategories}</strong>
              </h3>
              <div className="mb-4 flex gap-4">
                <BudgetDropwdown />
                <DeliveryTimeDropdown />
              </div>
              <div className="my-5">
                <div className="">
                  <span className="font-medium text-[#74767e]">{data.total} services available</span>
                </div>
                {filterApplied ? (
                  <CircularPageLoader />
                ) : (
                  <div className="grid gap-x-6 gap-y-6 pt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {data &&
                      data.gigs &&
                      data?.gigs?.map((gig: ISellerGig) => {
                        return <GigCardDisplayItem gig={gig} linkTarget={true} showEditIcon={false} key={gig._id} />;
                      })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <PageMessage header="No services found for your search" body="Try a new search or get a free quote for your project" />
          )}
          {isError && <PageMessage header="Error" body="Something went wrong" />}
          {isSuccess && !filterApplied && data && data.gigs && data.gigs.length > 0 && (
            <GigPaginate
              key={queryType}
              gigs={gigs.current}
              totalGigs={totalGigs}
              showNumbers={true}
              itemsPerPage={ITEMS_PER_PAGE}
              setItemFrom={setItemFrom}
              setPaginationType={setPaginationType}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Gigs;
