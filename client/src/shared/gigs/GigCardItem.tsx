import { FC, ReactElement, useState } from 'react';
import { FaEllipsisH, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';
import { IGigsProps, ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { IGigCardItemModal } from '../shared.interface';

const GigCardItem: FC<IGigsProps> = ({ gig }): ReactElement => {
  const [gigCartItemModal, setGigCartItemModal] = useState<IGigCardItemModal>({
    overlay: false,
    deleteApproval: false
  } as IGigCardItemModal);

  return (
    <div className="relative">
      {gigCartItemModal.overlay && (
        <div className="border-grey absolute bottom-0 top-0 mb-8 w-full cursor-pointer border bg-white">
          <div className="absolute -right-[12px] -top-[12px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-sky-500 bg-white text-sm font-bold leading-[0] text-sky-500">
            X
          </div>
          <ul className="list-none pl-0">
            <li>
              <div className="my-1 flex w-full cursor-pointer gap-4 px-4 pt-3">
                <FaPencilAlt size={13} className="flex self-center" />
                <span className="">Edit</span>
              </div>
            </li>
            <li>
              <div className="my-1 flex w-full cursor-pointer gap-4 px-4 pt-3">
                {/* <!-- <FaPlayCircle size={13} className="flex self-center" />
                  <FaPauseCircle size={13} className="flex self-center" /> --> */}
                <span className="">Activate</span>
              </div>
            </li>
            <li>
              <div className="my-1 flex w-full cursor-pointer gap-4 px-4 pt-3">
                <FaTrashAlt size={13} className="flex self-center" />
                <span className="">Delete</span>
              </div>
            </li>
          </ul>
        </div>
      )}

      <div className="border-grey mb-8 flex cursor-pointer flex-col gap-2 border">
        <Link to="">
          <LazyLoadImage
            src="https://placehold.co/330x220?text=Profile+Image"
            alt="Gig cover image"
            className="w-full"
            placeholderSrc="https://placehold.co/330x220?text=Profile+Image"
          />
        </Link>
        <div className="px-2">
          <Link to="">
            <p className="line-clamp-2 text-[#404145] hover:text-sky-500">basicDescription</p>
          </Link>
        </div>
        <div className="flex gap-2 px-2 text-orange-400">
          {/* <!-- FaStar --> */}
          {/* <!-- FaRegStar --> */}
          (5)
        </div>
        <div className="flex justify-between px-2 pb-2">
          <FaEllipsisH size={14} className="self-center" />
          <strong className="text-base font-normal">$10</strong>
        </div>
      </div>
    </div>
  );
};

export default GigCardItem;
