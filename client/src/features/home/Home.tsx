import { FC, ReactElement } from 'react';
import HomeSlider from './components/HomeSlider';
import HomeGigsView from './components/HomeGigsView';

const Home: FC = (): ReactElement => {
  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
      <HomeGigsView
        gigs={[]}
        title="Because you view gig on"
        subTitle="These are the top gigs on the platform"
        category="Programming & Tech"
      />
    </div>
  );
};

export default Home;
