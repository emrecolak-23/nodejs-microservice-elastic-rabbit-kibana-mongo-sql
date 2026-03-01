import { FC, ReactElement } from 'react';
import HomeSlider from './components/HomeSlider';
import HomeGigsView from './components/HomeGigsView';
import FeatureExperts from './components/FeatureExperts';
import { useGetRandomSellersQuery } from '../sellers/services/seller.service';
import { ISellerDocument } from '../sellers/interfaces/seller.interface';

const Home: FC = (): ReactElement => {
  const { data, isSuccess } = useGetRandomSellersQuery('10');

  let sellers: ISellerDocument[] = [];

  if (isSuccess) {
    sellers = data?.sellers as ISellerDocument[];
  }

  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
      <HomeGigsView
        gigs={[]}
        title="Because you view gig on"
        subTitle="These are the top gigs on the platform"
        category="Programming & Tech"
      />
      <FeatureExperts sellers={[]} />
    </div>
  );
};

export default Home;
