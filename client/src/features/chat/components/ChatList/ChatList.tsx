import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { FaCheck, FaCheckDouble, FaCircle } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { IMessageDocument } from '../../interfaces/chat.interface';
import { NavigateFunction, useLocation, useNavigate, useParams, Location } from 'react-router-dom';
import { useGetConversationListQuery, useMarkMultipleMessagesAsReadMutation } from '../../services/chat.service';
import { cn } from 'src/shared/utils/cn';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { lowerCase, showErrorToast } from 'src/shared/utils/utils.service';
import { socket } from 'src/sockets/socket.service';
import { chatListMessageReceived, chatListMessageUpdated } from '../../services/chat.utils';

const ChatList: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [selectedUser, setSelectedUser] = useState<IMessageDocument>();
  const conversationListRef = useRef<IMessageDocument[]>([]);

  const [chatList, setChatList] = useState<IMessageDocument[]>([]);

  const { username, conversationId } = useParams();

  const navigate: NavigateFunction = useNavigate();
  const location: Location = useLocation();
  const dispatch = useAppDispatch();

  const { data, isSuccess } = useGetConversationListQuery(`${authUser?.username}`);
  const [markMultipleMessagesAsRead] = useMarkMultipleMessagesAsReadMutation();

  const selectUserFromList = async (user: IMessageDocument): Promise<void> => {
    try {
      setSelectedUser(user);
      const pathList: string[] = location.pathname.split('/');
      pathList.splice(-2, 2);
      const locationPathname: string = !pathList.join('/') ? location.pathname : pathList.join('/');
      const chatUsername: string = (user.receiverUsername !== authUser.username ? user.receiverUsername : user.senderUsername) as string;
      navigate(`${locationPathname}/${lowerCase(chatUsername)}/${user.conversationId}`);
      socket?.emit('getLoggedInUsers', '');
      if (user.receiverUsername === authUser.username && lowerCase(`${user.senderUsername}`) === username) {
        const list: IMessageDocument[] = chatList.filter(
          (chat: IMessageDocument) => !chat.isRead && chat.receiverUsername === authUser.username
        );

        if (list.length > 0) {
          await markMultipleMessagesAsRead({
            receiverUsername: `${user.receiverUsername}`,
            senderUsername: `${user.senderUsername}`,
            messageId: `${user._id}`
          });
        }
      }
    } catch (error) {
      showErrorToast('Error selecting chat user');
    }
  };

  useEffect(() => {
    if (data?.messages && isSuccess) {
      const sortedConversations: IMessageDocument[] = [...data?.messages]?.sort((a: IMessageDocument, b: IMessageDocument) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }) as IMessageDocument[];
      setChatList(sortedConversations);
      // dispatch update notification
    }
  }, [data?.messages, isSuccess]);

  useEffect(() => {
    chatListMessageReceived(`${authUser?.username}`, chatList, conversationListRef.current, dispatch, setChatList);
    chatListMessageUpdated(`${authUser?.username}`, chatList, conversationListRef.current, dispatch, setChatList);
  }, [chatList, conversationListRef, dispatch, setChatList]);

  return (
    <>
      <div className="border-grey truncate border-b px-5 py-3 text-base font-medium">
        <h2 className="w-6/12 truncate text-sm md:text-base lg:text-lg">All Conversations</h2>
      </div>
      <div className="absolute h-full w-full overflow-scroll pb-14">
        {chatList.map((data: IMessageDocument, index: number) => {
          return (
            <div
              key={data._id}
              onClick={() => selectUserFromList(data)}
              className={cn('flex w-full cursor-pointer items-center space-x-4 px-5 py-4 hover:bg-gray-50', {
                'border-b border-grey': index !== chatList.length - 1,
                'bg-[#f5fbff]': !data.isRead || data.conversationId === conversationId
              })}
            >
              <LazyLoadImage
                src={data.receiverUsername !== authUser.username ? data.receiverPicture : data.senderPicture}
                alt="profile image"
                className="h-10 w-10 object-cover rounded-full"
                placeholderSrc="https://placehold.co/330x220?text=Profile+Image"
                effect="blur"
              />
              <div className="w-full text-sm dark:text-white">
                <div className="flex justify-between pb-1 font-bold text-[#777d74]">
                  <span
                    className={cn('', {
                      'flex items-center': selectedUser && !data.body
                    })}
                  >
                    {data.receiverUsername !== authUser.username ? data.receiverUsername : data.senderUsername}
                  </span>
                  {data.createdAt && <span className="font-normal">{TimeAgo.transform(data.createdAt.toString())}</span>}
                </div>
                <div className="flex justify-between text-[#777d74]">
                  <span>
                    {data.receiverUsername !== authUser.username ? '' : 'Me: '} {data.body}
                  </span>
                  {!data.isRead ? (
                    <>
                      {data.receiverUsername !== authUser.username ? (
                        <FaCircle className="mt-2 text-sky-500" size={8} />
                      ) : (
                        <FaCheck className="mt-2" size={8} />
                      )}
                    </>
                  ) : (
                    <FaCheckDouble className="mt-2 text-sky-500" size={8} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ChatList;
