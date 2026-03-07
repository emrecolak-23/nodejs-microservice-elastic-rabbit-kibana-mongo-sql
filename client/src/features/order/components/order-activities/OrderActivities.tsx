import { forwardRef, ForwardRefExoticComponent, ReactElement, RefAttributes, useState } from 'react';
import { DivElementRefType, IOrderActivitiesProps, IOrderDocument } from '../../interfaces/order.interface';
import { IChatBuyerProps, IChatSellerProps } from 'src/features/chat/interfaces/chat.interface';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { OrderContext } from '../../context/OrderContext';
import ChatBox from 'src/features/chat/components/ChatBox/ChatBox';
import OrderPlaced from './OrderPlaced';
import OrderExtension from './OrderExtension';
import OrderDelivered from './OrderDelivered';

const OrderActivities: ForwardRefExoticComponent<Omit<IOrderActivitiesProps, 'ref'> & RefAttributes<HTMLDivElement>> = forwardRef<
  DivElementRefType,
  IOrderActivitiesProps
>(({ order, authUser, viewDeliveryBtnClicked }, ref): ReactElement => {
  const [showChatBox, setShowChatBox] = useState<boolean>(false);

  const chatSeller: IChatSellerProps = {
    username: `${order.sellerUsername || ''}`,
    _id: `${order.sellerId || ''}`,
    profilePicture: `${order.sellerImage || ''}`,
    responseTime: 1
  };

  const chatBuyer: IChatBuyerProps = {
    username: `${order.buyerUsername || ''}`,
    _id: `${order.buyerId || ''}`,
    profilePicture: `${order.buyerImage || ''}`
  };

  return (
    <div className="mb-3 mt-4 rounded-[4px] bg-white p-3">
      <div className="flex">
        <div className="my-5 rounded-full bg-[#e8e8e8] px-4 py-2 text-center text-sm font-bold">
          {TimeAgo.chatMessageTransform(`${order.dateOrdered || ''}`)}
        </div>
      </div>
      <OrderContext.Provider value={{ order, authUser, viewDeliveryBtnClicked }}>
        <OrderPlaced />
        <OrderExtension />
        <OrderDelivered ref={ref} />
      </OrderContext.Provider>
      <div className="px-3 pt-2 flex">
        If you need to contact the {order.buyerUsername === authUser.username ? 'seller' : 'buyer'},{' '}
        <div onClick={() => setShowChatBox((item) => !item)} className="px-2 text-blue-500 cursor-pointer hover:underline">
          Go to Inbox
        </div>
      </div>
      {showChatBox && <ChatBox seller={chatSeller} buyer={chatBuyer} gigId={order.gigId} onClose={() => setShowChatBox(false)} />}
    </div>
  );
});
export default OrderActivities;
