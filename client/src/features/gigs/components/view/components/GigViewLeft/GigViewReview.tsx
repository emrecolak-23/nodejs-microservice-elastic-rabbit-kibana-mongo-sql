import { FC, ReactElement } from 'react';
import StarRating from 'src/shared/rating/StarRating';

const GigViewReview: FC = (): ReactElement => {
  return (
    <>
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Reviews</h2>
        <div className="flex flex-col gap-y-3 pt-2 lg:flex-row lg:gap-x-6">
          <div className="w-full">
            <div className="mb-8 flex flex-col gap-y-2 lg:flex-row lg:gap-x-2">
              <div className="w-full truncate text-sm lg:w-1/12">1 Star</div>
              <div className="flex h-2.5 w-full self-center rounded-full bg-slate-200 lg:w-full">
                <div className="h-2.5 rounded-full bg-orange-400" style={{ width: '50%' }}></div>
              </div>
              <div className="w-full text-start text-sm lg:w-1/12 lg:text-end">(5)</div>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-grey my-3" />

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-col gap-y-3 md:flex-row md:gap-x-4">
            <img
              className="flex self-center h-12 w-12 mt-4 rounded-full object-cover md:self-auto"
              src="https://placehold.co/330x220?text=Profile+Image"
              alt="Reviewer Image"
            />
            <div className="flex flex-col self-center">
              <div className="flex cursor-pointer self-center pt-0 no-underline md:block md:self-start md:pt-4">
                <span className="text-base font-bold md:mb-5">reviewerUsername</span>
              </div>
              <span className="flex self-center text-sm md:block md:self-start">country</span>
              <div className="flex w-full gap-x-1 self-center justify-center md:justify-start">
                <div className="mt-1 w-20 gap-x-2">
                  <StarRating value={5} size={14} />
                </div>
                <div className="ml-2 mt-[1px] flex gap-1 text-sm">
                  <span className="text-orange-400">5</span>|<span>20/10/2025</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-center md:text-base md:text-left">review</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GigViewReview;
