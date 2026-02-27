import { FC, ReactElement } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

const AddSeller: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);

  return (
    <div className="relative w-full">
      <Breadcrumb breadCrumbItems={['Sellers', 'Create Profile']} />
      <div className="container mx-auto my-5 overflow-hidden px-2 pb-12 md:px-0">
        {/* <!-- add circular loader here --> */}

        {authUser && !authUser.emailVerified && (
          <div className="absolute left-0 top-0 z-50 flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
            <span className="mt-20">Please verify your email.</span>
          </div>
        )}

        <div className="left-0 top-0 z-10 mt-4 block h-full bg-white"></div>
      </div>
    </div>
  );
};

export default AddSeller;
