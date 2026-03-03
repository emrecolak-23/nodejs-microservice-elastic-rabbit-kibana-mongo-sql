import { ReactElement, FC, useState, useEffect } from 'react';
import { FaEye, FaRegEnvelope, FaRegEnvelopeOpen } from 'react-icons/fa';
import { IHomeHeaderProps } from '../interfaces/header.interface';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IMessageDocument } from 'src/features/chat/interfaces/chat.interface';
import { useGetConversationListQuery, useMarkMessagesAsReadMutation } from 'src/features/chat/services/chat.service';
import { lowerCase, showErrorToast } from 'src/shared/utils/utils.service';
import { TimeAgo } from 'src/shared/utils/timeago.utils';

const MessageDropdown: FC<IHomeHeaderProps> = ({ setIsMessageDropdownOpen }): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const navigate: NavigateFunction = useNavigate();
  const [conversations, setConversations] = useState<IMessageDocument[]>([]);

  const { data, isSuccess } = useGetConversationListQuery(`${authUser.username}`, {
    refetchOnMountOrArgChange: true,
    skip: !authUser.username
  });
  const [markMessageAsRead] = useMarkMessagesAsReadMutation();

  useEffect(() => {
    if (isSuccess && data?.messages) {
      const sortedConversations: IMessageDocument[] = [...data.messages].sort((a: IMessageDocument, b: IMessageDocument) => {
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      });
      setConversations(sortedConversations);
    }
  }, [isSuccess, data?.messages]);

  const selectInboxMessage = async (message: IMessageDocument): Promise<void> => {
    try {
      const chatUsername: string =
        message.receiverUsername !== authUser.username ? (message.receiverUsername as string) : (message.senderUsername as string);
      navigate(`/inbox/${lowerCase(chatUsername)}/${message.conversationId}`);
      if (message.receiverUsername === seller.username && !message.isRead) {
        await markMessageAsRead(message._id as string);
      }
    } catch (error) {
      showErrorToast('Error occured');
      console.log(error);
    }
  };

  return (
    <div className="border-grey border-grey z-20 flex max-h-[470px] flex-col justify-between rounded border bg-white shadow-md">
      <div className="border-grey block border-b px-4 py-2 text-center font-medium text-gray-700">Inbox</div>
      <div className="h-96 overflow-y-scroll">
        {conversations.length > 0 ? (
          <>
            {conversations.map((data: IMessageDocument) => {
              return (
                <div
                  onClick={() => {
                    selectInboxMessage(data);
                    if (setIsMessageDropdownOpen) {
                      setIsMessageDropdownOpen(false);
                    }
                  }}
                  key={data._id}
                  className="border-grey max-h-[90px] border-b pt-2 text-left hover:bg-gray-50 "
                >
                  <div className="flex px-4">
                    <div className="mt-1 flex-shrink-0">
                      <img
                        className="h-11 w-11 rounded-full object-cover"
                        src={data.senderUsername === authUser.username ? data.receiverPicture : data.senderPicture}
                        alt=""
                      />
                    </div>
                    <div className="w-full pl-3 pt-1">
                      <div className="flex flex-col text-sm font-normal ">
                        <div className="font-bold leading-none flex justify-between">
                          {data.senderUsername === authUser.username ? data.receiverUsername : data.senderUsername}
                          {!data.isRead ? <FaRegEnvelope className="text-sky-400" /> : <FaRegEnvelopeOpen className="text-gray-200" />}
                        </div>
                        <span className="line-clamp-1 pt-1 font-normal leading-4">
                          {data.senderUsername === authUser.username ? 'Me: ' : ''}{data.body}
                        </span>
                      </div>
                      <div className="mt-1 flex text-[11px]">
                        {data.createdAt && (
                          <span className="font-normal text-[#b5b6ba]">{TimeAgo.transform(data.createdAt as string)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">No messages to show</div>
        )}
      </div>
      <div
        onClick={() => {
          navigate('/inbox');
          if (setIsMessageDropdownOpen) {
            setIsMessageDropdownOpen(false);
          }
        }}
        className="flex h-10 cursor-pointer justify-center bg-white px-4 text-sm font-medium text-sky-500"
      >
        <FaEye className="mr-2 h-4 w-4 self-center" />
        <span className="self-center">View all</span>
      </div>
    </div>
  );
};

export default MessageDropdown;
