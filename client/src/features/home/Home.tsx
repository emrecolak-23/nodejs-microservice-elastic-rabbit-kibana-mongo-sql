import { FC, ReactElement } from 'react';
import HomeSlider from './components/HomeSlider';
import HomeGigsView from './components/HomeGigsView';
import FeatureExperts from './components/FeatureExperts';
import { useGetRandomSellersQuery } from '../sellers/services/seller.service';
import { ISellerDocument } from '../sellers/interfaces/seller.interface';
import { useGetGigsByCategoryQuery } from '../gigs/services/gigs.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { ISellerGig } from '../gigs/interfaces/gig.interface';

const Home: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data, isSuccess } = useGetRandomSellersQuery('10');
  const { data: categoryData, isSuccess: isCategorySuccess } = useGetGigsByCategoryQuery(`${authUser.username}`);

  let sellers: ISellerDocument[] = [];
  let categoryGigs: ISellerGig[] = [];

  if (isSuccess) {
    sellers = data?.sellers as ISellerDocument[];
  }

  if (isCategorySuccess) {
    categoryGigs = categoryData?.gigs as ISellerGig[];
  }

  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
      {categoryGigs.length > 0 && (
        <HomeGigsView
          gigs={categoryGigs}
          title="Because you view gig on"
          subTitle={`These are the top gigs on the platform for ${categoryGigs[0].categories}`}
          category={categoryGigs[0].categories}
        />
      )}
      <FeatureExperts sellers={sellers} />
    </div>
  );
};

export default Home;
