import { Dispatch, SetStateAction } from 'react';
import { IMessageDocument } from '../interfaces/chat.interface';
import { socket } from 'src/sockets/socket.service';
import { cloneDeep, lowerCase } from 'src/shared/utils/utils.service';
import { AnyAction } from 'redux';
import { updateNotification } from 'src/shared/header/reducers/notification.reducer';

export const chatMessageReceived = (
  conversationId: string,
  setChatMessagesData: Dispatch<SetStateAction<IMessageDocument[]>>
): (() => void) => {
  const handler = (data: IMessageDocument) => {
    if (data.conversationId === conversationId) {
      setChatMessagesData((prev) => {
        const exists = prev.some((m) => m._id === data._id);
        if (exists) return prev;
        const next = [...prev, data];
        return next.filter((chat, index, list) => list.findIndex((item) => item._id === chat._id) === index);
      });
    }
  };
  socket?.on('message received', handler);
  return () => socket?.off('message received', handler);
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

        dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
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

        dispatch(updateNotification({ hasUnreadMessage: list.length > 0 }));
      }

      setChatList(conversationListRef);
    }
  });
};
