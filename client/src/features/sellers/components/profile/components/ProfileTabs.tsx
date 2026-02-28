import { FC, ReactElement } from 'react';
import { IProfileTabsProps } from 'src/features/sellers/interfaces/seller.interface';
import Dropdown from 'src/shared/dropdown/Dropdown';
import { cn } from 'src/shared/utils/cn';

const TABS = ['Overview', 'Active Gigs', 'Ratings & Reviews'] as const;

const ProfileTabs: FC<IProfileTabsProps> = ({ type, setType }): ReactElement => {
  return (
    <>
      <div className="sm:hidden bg-white border-grey">
        <Dropdown text={type} setValue={setType} maxHeight="300" values={[...TABS]} />
      </div>
      <ul className="hidden divide-x divide-gray-200 text-center text-sm font-medium text-gray-500 shadow dark:text-gray-400 sm:flex">
        {TABS.map((tab) => (
          <li key={tab} className="w-full">
            <div
              onClick={() => setType?.(tab)}
              className={cn('inline-block w-full p-4 text-gray-600 hover:text-gray-700 focus:outline-none', {
                'bg-sky-200': type === tab,
                'bg-white': type !== tab
              })}
            >
              {tab}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ProfileTabs;
