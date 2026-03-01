import { FC, ReactElement } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SellerContextType } from '../../interfaces/seller.interface';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { lowerCase, shortenLargeNumbers } from 'src/shared/utils/utils.service';
import ManageEarningsTable from './components/ManageEarningsTable';

const ManageEarning: FC = (): ReactElement => {
  const { orders, seller } = useOutletContext<SellerContextType>();

  const completedOrders: IOrderDocument[] = orders.filter((order: IOrderDocument) => lowerCase(order.status) === lowerCase('Delivered'));
  const sum: number = orders.reduce((acc: number, order: IOrderDocument) => acc + order.price, 0);
  const avgPrice: number = sum / orders.length;
  const averageSellingPrice: number = avgPrice ? parseInt(shortenLargeNumbers(avgPrice)) : 0;

  return (
    <div className="container mx-auto mt-8">
      <div className="flex flex-col flex-wrap">
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3">
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Earnings to date</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">${seller?.totalEarnings}</span>
            </div>
          </div>
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Avg. selling price</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">${averageSellingPrice}</span>
            </div>
          </div>
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Orders completed</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{seller?.completedJobs}</span>
            </div>
          </div>
        </div>

        <ManageEarningsTable orders={completedOrders} type="active" orderTypes={completedOrders.length} />
      </div>
    </div>
  );
};
export default ManageEarning;
