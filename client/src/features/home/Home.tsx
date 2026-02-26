import { FC, ReactElement } from 'react';
import HomeSlider from './components/HomeSlider';

const Home: FC = (): ReactElement => {
  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
    </div>
  );
};

export default Home;
