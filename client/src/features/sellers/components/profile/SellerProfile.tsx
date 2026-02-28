import { FC, ReactElement, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import { ISellerDocument } from '../../interfaces/seller.interface';
import ProfileTabs from './components/ProfileTabs';
import SellerOverview from './components/SellerOverview';
import { useParams } from 'react-router-dom';
import { useGetSellerByIdQuery } from '../../services/seller.service';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';

const SellerProfile: FC = (): ReactElement => {
  const [type, setType] = useState<string>('Overview');

  const { sellerId } = useParams();

  const { data: sellerData, isLoading: isLoadingSeller } = useGetSellerByIdQuery(sellerId as string);

  return (
    <div className="relative w-full pb-6">
      <Breadcrumb breadCrumbItems={['Seller', `${sellerData && sellerData?.seller ? sellerData?.seller?.username : ''}`]} />
      {isLoadingSeller && <CircularPageLoader />}
      {!isLoadingSeller && (
        <div className="container mx-auto px-2 md:px-0">
          <ProfileHeader sellerProfile={sellerData?.seller as ISellerDocument} showHeaderInfo={true} showEditIcons={false} />
          <div className="my-4 cursor-pointer">
            <ProfileTabs type={type} setType={setType} />
          </div>

          <div className="flex flex-wrap bg-white">
            {type === 'Overview' && <SellerOverview sellerProfile={sellerData?.seller as ISellerDocument} showEditIcons={false} />}
            {type === 'Active Gigs' && <div>Seller Active Gigs</div>}
            {type === 'Ratings & Reviews' && <div>Seller Ratings & Reviews</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;
