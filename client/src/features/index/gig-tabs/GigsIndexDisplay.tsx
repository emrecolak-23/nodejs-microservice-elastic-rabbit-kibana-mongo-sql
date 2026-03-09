import { FC, lazy, LazyExoticComponent, ReactElement, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useGetAuthGigsByCategoryQuery } from 'src/features/auth/services/auth.service';
import { IGigsProps, ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { IHeader } from 'src/shared/header/interfaces/header.interface';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import PageMessage from 'src/shared/page-message/PageMessage';
import {
  replaceAmpersandAndDashWithSpace,
  replaceDashWithSpaces,
  lowerCase,
  categories,
  replaceSpacesWithDash
} from 'src/shared/utils/utils.service';
import GigIndex from './GigIndex';
import GigPaginate from 'src/shared/gigs/GigPaginate';

const IndexHeader: LazyExoticComponent<FC<IHeader>> = lazy(() => import('../../../shared/header/components/Header'));

const ITEMS_PER_PAGE = 12;

const GigsIndexDisplay: FC<IGigsProps> = ({ type }): ReactElement => {
  const [itemFrom, setItemFrom] = useState<string>('0');
  const [paginationType, setPaginationType] = useState<string>('forward');
  const [searchParams] = useSearchParams({});
  const { category } = useParams<string>();
  const location = useLocation();
  let gigs: ISellerGig[] = [];
  const gigsCurrent = useRef<ISellerGig[]>([]);
  let totalGigs = 0;
  const updatedSearchParams: URLSearchParams = new URLSearchParams(searchParams.toString());

  const queryType: string =
    type === 'search'
      ? replaceDashWithSpaces(`${updatedSearchParams}`)
      : `query=${replaceAmpersandAndDashWithSpace(`${lowerCase(`${category}`)}`)}&${updatedSearchParams.toString()}`;

  const { data, isSuccess, isLoading, isError } = useGetAuthGigsByCategoryQuery({
    query: `${queryType}`,
    from: itemFrom,
    size: `${ITEMS_PER_PAGE}`,
    type: paginationType
  });

  if (isSuccess && data?.gig) {
    gigs = data?.gig as ISellerGig[];
    gigsCurrent.current = data?.gig as ISellerGig[];
    totalGigs = data?.total || 0;
  }

  const categoryName = categories().find((item) => location.pathname.includes(replaceSpacesWithDash(item)));
  const gigCategories = categoryName ?? searchParams.get('query');

  return (
    <div className="flex w-screen flex-col">
      <IndexHeader navClass="navbar peer-checked:navbar-active z-20 w-full border-b border-gray-100 bg-white shadow-2xl shadow-gray-600/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none" />
      <div className="relative m-auto mb-10 mt-8 min-h-screen w-screen px-6 xl:container md:px-12 lg:px-6">
        {isLoading && !isSuccess ? (
          <CircularPageLoader />
        ) : (
          <>
            {!isLoading && isSuccess && gigs.length > 0 ? (
              <>
                <h3 className="mb-5 flex gap-3 text-4xl">
                  {type === 'search' && <span className="text-black">Results for</span>}
                  <strong className="text-black">{gigCategories}</strong>
                </h3>
                <div className="my-5">
                  <div className="grid gap-x-6 pt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {gigs.map((gig: ISellerGig) => {
                      return <GigIndex key={gig._id} gig={gig} />;
                    })}
                  </div>
                </div>
              </>
            ) : (
              <PageMessage header="NO services found for your search" body="Try a new search or get a free quote for your project" />
            )}
          </>
        )}
        {isError && <PageMessage header="Error" body="Something went wrong" />}
        {isSuccess && gigs.length > 0 && (
          <GigPaginate
            key={queryType}
            gigs={gigsCurrent.current}
            totalGigs={totalGigs}
            showNumbers={false}
            itemsPerPage={ITEMS_PER_PAGE}
            setItemFrom={setItemFrom}
            setPaginationType={setPaginationType}
          />
        )}
      </div>
    </div>
  );
};

export default GigsIndexDisplay;
