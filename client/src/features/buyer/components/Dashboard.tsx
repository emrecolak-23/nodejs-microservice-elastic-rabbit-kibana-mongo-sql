import { FC, ReactElement, useEffect, useState } from 'react';
import { cn } from 'src/shared/utils/cn';
import BuyerTable from './BuyerTable';
import { orderTypes } from 'src/shared/utils/utils.service';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { socket, socketService } from 'src/sockets/socket.service';
import { useParams } from 'react-router-dom';
import { useGetOrdersByBuyerIdQuery } from 'src/features/order/services/order.service';
// import { useParams } from 'react-router-dom';

export const BUYER_GIG_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in progress',
  DELIVERED: 'delivered'
};

const BuyerDashboard: FC = (): ReactElement => {
  const [type, setType] = useState<string>(BUYER_GIG_STATUS.ACTIVE);
  const { buyerId } = useParams<string>();

  const { data, isSuccess } = useGetOrdersByBuyerIdQuery(`${buyerId}`);

  let orders: IOrderDocument[] = [];

  if (isSuccess && data?.orders) {
    orders = data.orders;
  }

  useEffect(() => {
    socketService.setupSocketConnection();
    socket?.emit('getLoggedInUsers', '');
  }, []);

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
            <li className="inline-block py-3 uppercase" onClick={() => setType(BUYER_GIG_STATUS.ACTIVE)}>
              <a href="#activeorders" className={typeClass(BUYER_GIG_STATUS.ACTIVE)}>
                Active{' '}
                {orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders)}
                  </span>
                )}
              </a>
            </li>
            <li className="inline-block py-3 uppercase" onClick={() => setType(BUYER_GIG_STATUS.COMPLETED)}>
              <a href="#activeorders" className={typeClass(BUYER_GIG_STATUS.COMPLETED)}>
                Completed
                {orderTypes(BUYER_GIG_STATUS.COMPLETED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {orderTypes(BUYER_GIG_STATUS.COMPLETED, orders)}
                  </span>
                )}
              </a>
            </li>
            <li className="inline-block py-3 uppercase" onClick={() => setType(BUYER_GIG_STATUS.CANCELLED)}>
              <a href="#activeorders" className={typeClass(BUYER_GIG_STATUS.CANCELLED)}>
                Cancelled
                {orderTypes(BUYER_GIG_STATUS.CANCELLED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {orderTypes(BUYER_GIG_STATUS.CANCELLED, orders)}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>
        {type === BUYER_GIG_STATUS.ACTIVE && (
          <BuyerTable orders={orders} type={type} orderTypes={orderTypes(BUYER_GIG_STATUS.IN_PROGRESS, orders)} />
        )}
        {type === BUYER_GIG_STATUS.COMPLETED && (
          <BuyerTable orders={orders} type={type} orderTypes={orderTypes(BUYER_GIG_STATUS.COMPLETED, orders)} />
        )}
        {type === BUYER_GIG_STATUS.CANCELLED && (
          <BuyerTable orders={orders} type={type} orderTypes={orderTypes(BUYER_GIG_STATUS.CANCELLED, orders)} />
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
