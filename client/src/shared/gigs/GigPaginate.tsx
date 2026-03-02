import { FC, ReactElement, useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { IGigPaginateProps, ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../utils/cn';

const GigPaginate: FC<IGigPaginateProps> = ({
  gigs,
  totalGigs,
  showNumbers,
  itemsPerPage,
  setItemFrom,
  setPaginationType
}): ReactElement => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil((totalGigs as number) / itemsPerPage));
  const paginationCount: number[] = [...Array(totalPages).keys()];

  useEffect(() => {
    setCurrentPage(1);
  }, [totalGigs]);

  const handleForward = (): void => {
    if (currentPage >= totalPages || gigs.length === 0) return;
    const lastItem: ISellerGig = gigs[gigs.length - 1];
    setItemFrom(`${lastItem.sortId}`);
    setPaginationType('forward');
    setCurrentPage((p) => p + 1);
  };

  const handleBackward = (): void => {
    if (currentPage <= 1) return;
    if (currentPage === 2) {
      setItemFrom('0');
      setPaginationType('forward');
    } else if (gigs.length > 0) {
      setItemFrom(`${gigs[gigs.length - 1].sortId}`);
      setPaginationType('backward');
    }
    setCurrentPage((p) => p - 1);
  };

  return (
    <div className="flex w-full justify-center">
      <ul className="flex gap-8">
        <div
          className={cn('cursor-pointer p-3', {
            'rounded-full border border-sky-400': currentPage > 1,
            'cursor-not-allowed text-gray-400': currentPage <= 1
          })}
          onClick={handleBackward}
        >
          <FaArrowLeft className="flex self-center" />
        </div>
        {showNumbers &&
          paginationCount.map((_, index: number) => (
            <li
              key={uuidv4()}
              className={`cursor-pointer px-3 py-2 ${currentPage === index + 1 ? 'border-b-2 border-black font-bold text-black' : ''}`}
              onClick={() => {
                const targetPage = index + 1;
                if (targetPage === currentPage) return;
                if (targetPage > currentPage) {
                  setPaginationType('forward');
                  setItemFrom(`${gigs[gigs.length - 1].sortId}`);
                } else if (targetPage === 1) {
                  setPaginationType('forward');
                  setItemFrom('0');
                } else {
                  setPaginationType('backward');
                  setItemFrom(`${gigs[gigs.length - 1].sortId}`);
                }
                setCurrentPage(targetPage);
              }}
            >
              {index + 1}
            </li>
          ))}
        <div
          className={`cursor-pointer p-3 ${
            currentPage >= totalPages ? 'cursor-not-allowed text-gray-400' : 'rounded-full border border-sky-400'
          }`}
          onClick={handleForward}
        >
          <FaArrowRight className="flex self-center" color={currentPage >= totalPages ? 'grey' : 'black'} />
        </div>
      </ul>
    </div>
  );
};

export default GigPaginate;
