import { ReactElement, FC } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { IGigPaginateProps, ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { cn } from '../utils/cn';

let itemOffset = 1;

const GigPaginate: FC<IGigPaginateProps> = ({
  gigs,
  totalGigs,
  showNumbers,
  itemsPerPage,
  setItemFrom,
  setPaginationType
}): ReactElement => {
  const paginationCount: number[] = [...Array(Math.ceil(totalGigs / itemsPerPage)).keys()];

  return (
    <div className="flex w-full justify-center">
      <ul className="flex gap-8">
        <div
          onClick={() => {
            if (itemOffset - 1 > 0) {
              itemOffset -= 1;
              setPaginationType('backward');
              const firstItem: ISellerGig = gigs[0];
              setItemFrom(`${firstItem.sortId}`);
            }
          }}
          className="cursor-pointer p-3 rounded-full border border-sky-400"
        >
          <FaArrowLeft className="flex self-center" />
        </div>
        {showNumbers &&
          paginationCount.map((_, index) => {
            return (
              <li
                key={index}
                onClick={() => {
                  const selectedPage = index + 1;
                  itemOffset += 1;
                  if (itemOffset < index + 1) {
                    setPaginationType('forward');
                    setItemFrom(`${selectedPage * itemsPerPage - itemsPerPage}`);
                  } else if (itemOffset > index + 1) {
                    const selectedCount = selectedPage * itemOffset + 1;
                    setPaginationType('backward');
                    setItemFrom(`${selectedCount}`);
                  }
                }}
                className={cn('cursor-pointer px-3 py-2', {
                  'border-b-2 border-black font-bold text-black': itemOffset === index + 1
                })}
              >
                {index + 1}
              </li>
            );
          })}
        <div
          className={cn('cursor-pointer p-3', {
            'cursor-not-allowed text-gray-400': itemOffset === paginationCount.length,
            'rounded-full border border-sky-400': itemOffset !== paginationCount.length
          })}
          onClick={() => {
            if (itemOffset + 1 <= paginationCount.length) {
              itemOffset += 1;
              setPaginationType('forward');
              const lastItem: ISellerGig = gigs[gigs.length - 1];
              setItemFrom(`${lastItem.sortId}`);
            }
          }}
        >
          <FaArrowRight className="flex self-center" color={itemOffset === paginationCount.length ? 'gray' : 'black'} />
        </div>
      </ul>
    </div>
  );
};

export default GigPaginate;
