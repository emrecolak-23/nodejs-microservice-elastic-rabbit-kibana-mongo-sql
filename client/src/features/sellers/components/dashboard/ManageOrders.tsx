import { FC, ReactElement, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { cn } from 'src/shared/utils/cn';
import { SellerContextType } from '../../interfaces/seller.interface';
import { orderTypes, sellerOrderList, shortenLargeNumbers } from 'src/shared/utils/utils.service';
import ManageOrdersTable from './components/ManageOrdersTable';

export const SELLER_GIG_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in progress',
  DELIVERED: 'delivered'
};

const ORDER_TABS = [
  { tab: SELLER_GIG_STATUS.ACTIVE, label: 'Active', countStatus: SELLER_GIG_STATUS.IN_PROGRESS },
  { tab: SELLER_GIG_STATUS.COMPLETED, label: 'Completed', countStatus: SELLER_GIG_STATUS.COMPLETED },
  { tab: SELLER_GIG_STATUS.CANCELLED, label: 'Cancelled', countStatus: SELLER_GIG_STATUS.CANCELLED }
] as const;

const ManageOrders: FC = (): ReactElement => {
  const [type, setType] = useState<string>(SELLER_GIG_STATUS.ACTIVE);
  const { orders } = useOutletContext<SellerContextType>();
  const ordersRef = useMemo(() => [...orders], [orders]);

  const typeClass = (status: string) => {
    return cn('px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base', {
      'border-b-2 border-sky-500 font-medium text-sky-600': type === status
    });
  };

  return (
    <div className="container mx-auto mt-8 px-6 md:px-12 lg:px-6">
      <div className="flex flex-col flex-wrap">
        <div className="mb-8 px-4 text-xl font-semibold text-black md:px-0 md:text-2xl lg:text-4xl">Manage Orders</div>
        <div className="p-0">
          <ul className="flex w-full cursor-pointer list-none flex-col flex-wrap gap-1 rounded-[2px] sm:flex-none sm:flex-row">
            {ORDER_TABS.map(({ tab, label, countStatus }) => {
              const count = orderTypes(countStatus, ordersRef);
              return (
                <li key={tab} className="inline-block py-3 uppercase" onClick={() => setType(tab)}>
                  <a href="#activeorders" className={typeClass(tab)}>
                    {label}{' '}
                    {count > 0 && (
                      <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                        {shortenLargeNumbers(count)}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        {type === SELLER_GIG_STATUS.ACTIVE && (
          <ManageOrdersTable
            type={type}
            orders={sellerOrderList(SELLER_GIG_STATUS.IN_PROGRESS, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.IN_PROGRESS, orders)}
          />
        )}
        {type === SELLER_GIG_STATUS.COMPLETED && (
          <ManageOrdersTable
            type={type}
            orders={sellerOrderList(SELLER_GIG_STATUS.COMPLETED, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.COMPLETED, orders)}
          />
        )}
        {type === SELLER_GIG_STATUS.CANCELLED && (
          <ManageOrdersTable
            type={type}
            orders={sellerOrderList(SELLER_GIG_STATUS.CANCELLED, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.CANCELLED, orders)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
