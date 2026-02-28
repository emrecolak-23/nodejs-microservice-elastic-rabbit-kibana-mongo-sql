import 'react-lazy-load-image-component/src/effects/blur.css';
import { ReactElement, FC } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import StarRating from 'src/shared/rating/StarRating';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { IProfileHeaderProps } from 'src/features/sellers/interfaces/seller.interface';

const ProfileHeader: FC<IProfileHeaderProps> = (): ReactElement => {
  return (
    <>
      <div className="relative flex h-56 flex-col gap-x-4 gap-y-3 bg-white px-6 py-4 md:h-52 md:flex-row">
        <div className="flex h-20 w-20 justify-center self-center md:h-24 md:w-24 lg:h-36 lg:w-36">
          <LazyLoadImage
            src="https://placehold.co/330x220?text=Profile+Image"
            alt="Gig Image"
            className="w-full h-full rounded-full object-cover"
            placeholderSrc=""
            effect="blur"
          />
        </div>
        <div className="flex flex-col md:mt-10 lg:mt-6">
          <div className="flex cursor-pointer self-center md:block md:self-start">
            <div className="flex flex-row self-center text-base font-bold lg:text-2xl">
              Fullname
              <FaPencilAlt className="ml-1 mt-1.5 text-xs md:text-base lg:ml-2.5 lg:mt-2" />
            </div>
            <div className="flex gap-x-4">
              <TextInput
                className="mt-2 flex h-7 w-full items-center rounded border border-gray-300 p-1.5 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none lg:h-9"
                placeholder="Fullname"
                type="text"
                name="fullname"
                value=""
              />
              <div className="my-2 flex">
                <Button
                  className="md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2"
                  label="Update"
                />
                &nbsp;&nbsp;
                <Button
                  className="md:text-md rounded bg-red-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-red-500 focus:outline-none md:py-2"
                  label="Cancel"
                />
              </div>
            </div>
          </div>
          <span className="flex self-center text-sm md:block md:self-start md:text-base">Username</span>
          <div className="flex cursor-pointer flex-row self-center text-center text-sm md:text-base lg:self-start">
            <div className="flex">
              This is my oneliner text
              <FaPencilAlt className="mx-1 mt-1 lg:ml-2.5" />
            </div>
            <div className="flex gap-x-4">
              <TextInput
                className="mt-2 flex h-7 w-full items-center rounded border border-gray-300 p-1.5 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none lg:h-9"
                placeholder="Oneliner"
                type="text"
                name="oneliner"
                value=""
                maxLength={70}
              />
              <div className="my-2 flex">
                <Button
                  className="md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2"
                  label="Update"
                />
                &nbsp;&nbsp;
                <Button
                  className="md:text-md rounded bg-red-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-red-500 focus:outline-none md:py-2"
                  label="Cancel"
                />
              </div>
            </div>
          </div>
          <div className="flex w-full gap-x-1 self-center">
            <div className="mt-1 w-20 gap-x-2">
              <StarRating value={5} size={14} />
            </div>

            <div className="ml-2 mt-[3px] flex gap-1 rounded bg-orange-400 px-1 text-xs">
              <span className="font-bold text-white">5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 font-bold text-white">
        <div className="col-span-4 flex items-center justify-center p-8 sm:col-span-2 md:col-span-1">
          <div className="flex flex-col">
            <span className="text-center text-base lg:text-xl">2</span>
            <span className="truncate text-center text-sm lg:text-base">Title</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
