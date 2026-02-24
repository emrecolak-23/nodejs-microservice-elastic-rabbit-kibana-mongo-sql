import { FC, LazyExoticComponent, ReactElement, Suspense, lazy } from 'react';
import { IHeader } from 'src/shared/header/interfaces/header.interface';
import Hero from './Hero';

const IndexHeader: LazyExoticComponent<FC<IHeader>> = lazy(() => import('../../shared/header/components/Header'));

const Index: FC = (): ReactElement => {
  return (
    <div className="flex flex-col">
      <Suspense>
        <IndexHeader navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white/90 shadow-2xl shadow-gray-600/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none" />
        <Hero />
      </Suspense>
    </div>
  );
};

export default Index;
