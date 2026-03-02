import { FC, ReactElement } from 'react';
import { IGigsProps } from '../../interfaces/gig.interface';
import BudgetDropwdown from './components/BudgetDropwdown';
import DeliveryTimeDropdown from './components/DeliveryTimeDropdown';

const Gigs: FC<IGigsProps> = (): ReactElement => {
  return (
    <div className="container mx-auto items-center p-5">
      <h3 className="mb-5 flex gap-3 text-4xl">
        <span className="text-black">Results for</span>
        <strong className="text-black">category</strong>
      </h3>
      <div className="mb-4 flex gap-4">
        <BudgetDropwdown />
        <DeliveryTimeDropdown />
      </div>
      <div className="my-5">
        <div className="">
          <span className="font-medium text-[#74767e]">5 services available</span>
        </div>
        <div className="grid gap-x-6 pt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* <!-- GigCardDisplayItem --> */}
        </div>
      </div>

      {/* <!-- PageMessage --> */}
      {/* <!-- GigPaginate --> */}
    </div>
  );
};

export default Gigs;
