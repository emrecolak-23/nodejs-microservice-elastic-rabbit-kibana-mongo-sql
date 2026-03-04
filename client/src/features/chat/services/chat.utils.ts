import { Dispatch, SetStateAction } from 'react';
import { IMessageDocument } from '../interfaces/chat.interface';
import { socket } from 'src/sockets/socket.service';
import { cloneDeep, lowerCase } from 'src/shared/utils/utils.service';
import { AnyAction } from 'redux';

export const chatMessageReceived = (
  conversationId: string,
  chatMessagesData: IMessageDocument[],
  chatMessages: IMessageDocument[],
  setChatMessagesData: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket?.on('message received', (data: IMessageDocument) => {
    chatMessages = cloneDeep(chatMessagesData);
    if (data.conversationId === conversationId) {
      chatMessages.push(data);
      const uniqeChatMessages: IMessageDocument[] = chatMessages.filter(
        (chat: IMessageDocument, index: number, list: IMessageDocument[]) => {
          const itemIndex = list.findIndex((item: IMessageDocument) => item._id === chat._id);
          return itemIndex === index;
        }
      );
      setChatMessagesData(uniqeChatMessages);
    }
  });
};

export const chatListMessageReceived = (
  username: string,
  chatList: IMessageDocument[],
  conversationListRef: IMessageDocument[],
  dispatch: Dispatch<AnyAction>,
  setChatList: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket?.on('message received', (data: IMessageDocument) => {
    conversationListRef = cloneDeep(chatList);

    if (lowerCase(`${data.receiverUsername}`) === lowerCase(username) || lowerCase(`${data.senderUsername}`) === lowerCase(username)) {
      const messageIndex = chatList.findIndex((message: IMessageDocument) => message.conversationId === data.conversationId);
      if (messageIndex > -1) {
        // remove the message from the conversation list
        conversationListRef = conversationListRef.filter((message: IMessageDocument) => message.conversationId !== data.conversationId);
      } else {
        conversationListRef = conversationListRef.filter((message: IMessageDocument) => message.receiverUsername !== data.receiverUsername);
      }
      conversationListRef = [data, ...conversationListRef];

      if (lowerCase(`${data.receiverUsername}`) === lowerCase(username)) {
        const list: IMessageDocument[] = conversationListRef.filter((message: IMessageDocument) => {
          return !message.isRead && message.receiverUsername === username;
        });

        console.log(list);
      }

      setChatList(conversationListRef);
    }
  });
};

export const chatListMessageUpdated = (
  username: string,
  chatList: IMessageDocument[],
  conversationListRef: IMessageDocument[],
  dispatch: Dispatch<AnyAction>,
  setChatList: Dispatch<SetStateAction<IMessageDocument[]>>
): void => {
  socket?.on('message updated', (data: IMessageDocument) => {
    conversationListRef = cloneDeep(chatList);

    if (lowerCase(`${data.receiverUsername}`) === lowerCase(username) || lowerCase(`${data.senderUsername}`) === lowerCase(username)) {
      const messageIndex = chatList.findIndex((message: IMessageDocument) => message.conversationId === data.conversationId);
      if (messageIndex > -1) {
        // remove the message from the conversation list
        conversationListRef.splice(messageIndex, 1, data);
      }

      if (lowerCase(`${data.receiverUsername}`) === lowerCase(username)) {
        const list: IMessageDocument[] = conversationListRef.filter((message: IMessageDocument) => {
          return !message.isRead && message.receiverUsername === username;
        });

        console.log(list);
      }

      setChatList(conversationListRef);
    }
  });
};
