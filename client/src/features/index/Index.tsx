import { FC, LazyExoticComponent, ReactElement, Suspense, lazy } from 'react';
import { IHeader } from 'src/shared/header/interfaces/header.interface';

import GigTabs from './gig-tabs/GigTabs';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Categories from './Categories';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';

const IndexHeader: LazyExoticComponent<FC<IHeader>> = lazy(() => import('../../shared/header/components/Header'));

const Index: FC = (): ReactElement => {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<CircularPageLoader />}>
        <IndexHeader navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white shadow-2xl shadow-gray-600/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none" />
        <Hero />
        <GigTabs />
        <HowItWorks />
        <Categories />
      </Suspense>
    </div>
  );
};

export default Index;
