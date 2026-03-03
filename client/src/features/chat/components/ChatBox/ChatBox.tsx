import { FC, ReactElement, useRef } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { IChatBoxProps } from '../../interfaces/chat.interface';

const ChatBox: FC<IChatBoxProps> = (): ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-grey fixed bottom-0 left-2 right-2 h-[400px] max-h-[500px] w-auto border bg-white md:left-8 md:h-96 md:max-h-[500px] md:w-96">
      <div className="border-grey flex items-center space-x-4 border-b px-5 py-2">
        <img src="https://placehold.co/330x220?text=Profile+Image" className="h-10 w-10 rounded-full" alt="profile image" />
        <div className="w-full font-medium text-[#777d74]">
          <div className="flex w-full cursor-pointer justify-between text-sm font-bold text-[#777d74] md:text-base">
            <span>Username</span>
            <FaTimes className="flex self-center" />
          </div>
          <div className="text-xs text-gray-500">Avg. response time: 1 hour</div>
        </div>
      </div>

      <div className="h-[500px] overflow-y-scroll md:h-full">
        <div className="my-2 flex h-[280px] flex-col overflow-y-scroll px-4 md:h-[72%]" ref={scrollRef}>
          <div className="my-2 flex max-w-[300px] gap-y-6 text-sm">
            <img src="" className="h-8 w-8 rounded-full object-cover" alt="profile image" />
            <p className="ml-2 max-w-[200px] rounded-[10px] bg-[#e4e6eb] px-4 py-2 text-start text-sm font-normal md:max-w-[220px] max-w-[200px] rounded-[10px] bg-sky-500 text-white">
              this is a message
            </p>
          </div>
        </div>
      </div>

      <form className="absolute bottom-0 left-0 right-0 mb-1 flex px-2 ">
        <TextInput
          type="text"
          name="message"
          value=""
          placeholder="Enter your message..."
          className="border-grey mb-0 w-full rounded-l-lg border p-2 text-sm font-normal text-gray-600 focus:outline-none"
        />
        <Button
          className="rounded-r-lg bg-sky-500 px-6 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-3 md:text-base"
          label={<FaPaperPlane className="self-center" />}
        />
      </form>
    </div>
  );
};

export default ChatBox;
