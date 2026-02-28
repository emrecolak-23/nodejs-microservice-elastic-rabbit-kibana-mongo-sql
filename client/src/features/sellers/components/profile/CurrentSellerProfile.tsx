import { FC, ReactElement, useEffect, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import Button from 'src/shared/button/Button';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import ProfileHeader from './components/ProfileHeader';
import { ISellerDocument } from '../../interfaces/seller.interface';
import equal from 'react-fast-compare';
import { addSeller } from '../../reducers/seller.reducer';
import ProfileTabs from './components/ProfileTabs';
import SellerOverview from './components/SellerOverview';

const CurrentSellerProfile: FC = (): ReactElement => {
  const seller = useAppSelector((state: IReduxState) => state.seller);
  const [sellerProfile, setSellerProfile] = useState<ISellerDocument>(seller);
  const [showEdit, setShowEdit] = useState<boolean>(true);
  const [type, setType] = useState<string>('Overview');
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isEqual: boolean = equal(sellerProfile, seller);
    setShowEdit(isEqual);
  }, [seller, sellerProfile]);

  return (
    <div className="relative w-full pb-6">
      <Breadcrumb breadCrumbItems={['Seller', `${seller.username}`]} />

      <div className="container mx-auto px-2 md:px-0">
        <div className="my-2 flex h-8 justify-end md:h-10">
          {!showEdit && (
            <div>
              <Button
                className="md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2"
                label="Update"
              />
              &nbsp;&nbsp;
              <Button
                className="md:text-md rounded bg-red-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-red-500 focus:outline-none md:py-2"
                label="Cancel"
                onClick={() => {
                  setShowEdit(false);
                  setSellerProfile(seller);
                  dispatch(addSeller(seller));
                }}
              />
            </div>
          )}
        </div>
        <ProfileHeader sellerProfile={sellerProfile} setSellerProfile={setSellerProfile} showHeaderInfo={true} showEditIcons={true} />
        <div className="my-4 cursor-pointer">
          <ProfileTabs type={type} setType={setType} />
        </div>

        <div className="flex flex-wrap bg-white">
          {type === 'Overview' && <SellerOverview sellerProfile={sellerProfile} setSellerProfile={setSellerProfile} showEditIcons={true} />}
          {type === 'Active Gigs' && <div>Seller Active Gigs</div>}
          {type === 'Ratings & Reviews' && <div>Seller Ratings & Reviews</div>}
        </div>
      </div>
    </div>
  );
};

export default CurrentSellerProfile;
