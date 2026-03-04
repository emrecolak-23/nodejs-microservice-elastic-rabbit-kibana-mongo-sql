import { FC, ReactElement, useRef } from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { IChatWindowProps } from '../../interfaces/chat.interface';
import useChatScrollToBottom from '../../hooks/useChatScrollToBottom';

const ChatWindow: FC<IChatWindowProps> = ({ chatMessages, isLoading, setSkip }): ReactElement => {
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useChatScrollToBottom([]);

  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="border-grey flex w-full flex-col border-b px-5 py-0.5 ">
        <>
          <div className="text-lg font-semibold">username</div>
          <div className="flex gap-1 pb-1 text-xs font-normal">
            Online
            <span className="flex h-2.5 w-2.5 self-center rounded-full border-2 border-white bg-green-400"></span>
          </div>
        </>
        <>
          <div className="py-2.5 text-lg font-semibold">username</div>
          <span className="py-2.5s text-xs font-normal"></span>
        </>
      </div>
      <div className="relative h-[100%]">
        <div className="absolute flex h-[98%] w-screen grow flex-col overflow-scroll" ref={scrollRef}>
          <div className="mb-4">
            <div className="flex w-full cursor-pointer items-center space-x-4 px-5 py-2 hover:bg-[#f5fbff]">
              <div className="flex self-start">
                <img className="h-10 w-10 object-cover rounded-full" src="" alt="" />
              </div>
              <div className="w-full text-sm dark:text-white">
                <div className="flex gap-x-2 pb-1 font-bold text-[#777d74]">
                  <span>senderUsername</span>
                  <span className="mt-1 self-center text-xs font-normal">20/10/2023</span>
                </div>
                <div className="flex flex-col text-[#777d74]">
                  <span>body</span>
                  ChatOffer ChatFile
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex flex-col">
        {/* <!-- ChatImagePreview --> */}
        <div className="bottom-0 left-0 right-0 z-0 h-28 px-4 ">
          <form className="mb-1 w-full">
            <TextInput
              type="text"
              name="message"
              value=""
              className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
              placeholder="Enter your message..."
            />
          </form>
          <div className="flex cursor-pointer flex-row justify-between">
            <div className="flex gap-4">
              <FaPaperclip className="mt-1 self-center" />
              <Button
                className="rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                disabled={false}
                label="Add Offer"
              />
              <TextInput name="chatFile" ref={fileRef} type="file" />
            </div>
            <div className="flex gap-4">
              <Button
                className="rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                disabled={false}
                label={<FaPaperPlane className="self-center" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
