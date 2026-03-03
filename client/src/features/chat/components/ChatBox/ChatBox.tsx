import { ChangeEvent, FC, FormEvent, ReactElement, useRef, useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { IChatBoxProps, IConversationDocument, IMessageDocument } from '../../interfaces/chat.interface';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { generateRandomNumber, showErrorToast } from 'src/shared/utils/utils.service';
import { useGetConversationQuery, useGetMessagesQuery, useSaveChatMessageMutation } from '../../services/chat.service';
import useChatScrollToBottom from '../../hooks/useChatScrollToBottom';
import { IResponse } from 'src/shared/shared.interface';
import ChatBoxSkeleton from './ChatBoxSkeleton';
import { cn } from 'src/shared/utils/cn';

const ChatBox: FC<IChatBoxProps> = ({ seller, buyer, gigId, onClose }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [message, setMessage] = useState<string>('');

  const conversationIdRef = useRef<string>(generateRandomNumber(10).toString());

  const { data: conversationData, isSuccess: isConversationSuccess } = useGetConversationQuery({
    senderUsername: `${seller.username}`,
    receiverUsername: `${buyer.username}`
  });

  const {
    data: messageData,
    isLoading: isMessageLoading,
    isSuccess: isMessageSuccess
  } = useGetMessagesQuery(
    {
      senderUsername: `${seller.username}`,
      receiverUsername: `${buyer.username}`
    },
    { refetchOnMountOrArgChange: true }
  );

  let chatMessages: IMessageDocument[] = [];

  if (isMessageSuccess) {
    chatMessages = messageData.messages as IMessageDocument[];
  }

  if (isConversationSuccess && conversationData.conversations && conversationData.conversations.length > 0) {
    conversationIdRef.current = (conversationData.conversations[0] as IConversationDocument).conversationId;
  }

  const senderUsername = authUser.username === seller.username ? seller.username : buyer.username;
  const receiverUsername = authUser.username !== seller.username ? seller.username : buyer.username;
  const senderPicture = authUser.username === seller.username ? seller.profilePicture : buyer.profilePicture;
  const receiverPicture = authUser.username !== seller.username ? seller.profilePicture : buyer.profilePicture;

  const scrollRef = useChatScrollToBottom(chatMessages);
  const [saveChatMessage] = useSaveChatMessageMutation();

  const sendMessage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      const messageBody: IMessageDocument = {
        conversationId: conversationIdRef.current,
        hasConversationId: !!(conversationData && conversationData.conversations && conversationData.conversations.length),
        body: message,
        gigId,
        sellerId: seller._id,
        buyerId: buyer._id,
        senderUsername,
        senderPicture,
        receiverUsername,
        receiverPicture,
        isRead: false,
        hasOffer: false
      };

      const response: IResponse = await saveChatMessage(messageBody).unwrap();

      setMessage('');
      conversationIdRef.current = response.conversationId as string;
    } catch (error) {
      showErrorToast('Error sending message');
      console.log(error);
    }
  };

  return (
    <>
      {isMessageLoading && !chatMessages ? (
        <ChatBoxSkeleton />
      ) : (
        <div className="border-grey fixed bottom-0 left-2 right-2 h-[400px] max-h-[500px] w-auto border bg-white md:left-8 md:h-96 md:max-h-[500px] md:w-96">
          <div className="border-grey flex items-center space-x-4 border-b px-5 py-2">
            <img src={receiverPicture} className="h-10 w-10 rounded-full" alt="profile image" />
            <div className="w-full font-medium text-[#777d74]">
              <div className="flex w-full cursor-pointer justify-between text-sm font-bold text-[#777d74] md:text-base">
                <span>{receiverUsername}</span>
                <FaTimes onClick={onClose} className="flex self-center" />
              </div>
              <div className="text-xs text-gray-500">
                Avg. response time: {seller.responseTime} hour{seller.responseTime > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="h-[500px] overflow-y-scroll md:h-full">
            <div className="my-2 flex h-[280px] flex-col overflow-y-scroll px-4 md:h-[72%]" ref={scrollRef}>
              {chatMessages.map((message) => (
                <div
                  key={message._id}
                  className={cn('my-2 flex max-w-[300px] gap-y-6 text-sm', {
                    'flex-row-reverse self-end': message.senderUsername !== buyer.username
                  })}
                >
                  <div className="flex items-center">
                    <img
                      src={buyer.profilePicture}
                      className={cn('h-8 w-8 rounded-full object-cover', {
                        hidden: message.senderUsername !== buyer.username
                      })}
                      alt="profile image"
                    />
                    <p
                      className={cn(
                        'ml-2 max-w-[200px] rounded-[10px] bg-[#e4e6eb] px-4 py-2 text-start text-sm font-normal md:max-w-[220px]',
                        {
                          'max-w-[200px] rounded-[10px] bg-sky-500 text-white': message.senderUsername !== buyer.username
                        }
                      )}
                    >
                      {message.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={sendMessage} className="absolute bottom-0 left-0 right-0 mb-1 flex px-2 ">
            <TextInput
              type="text"
              name="message"
              value={message}
              onChange={(e: ChangeEvent) => setMessage((e.target as HTMLInputElement).value)}
              placeholder="Enter your message..."
              className="border-grey mb-0 w-full rounded-l-lg border p-2 text-sm font-normal text-gray-600 focus:outline-none"
            />
            <Button
              className="rounded-r-lg bg-sky-500 px-6 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-3 md:text-base"
              label={<FaPaperPlane className="self-center" />}
            />
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBox;
