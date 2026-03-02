import { FC, ReactElement } from 'react';
import GigLeftOverview from './GigViewLeft/GigLeftOverview';
import GigLeftAbout from './GigViewLeft/GigLeftAbout';

const GigViewLeft: FC = (): ReactElement => {
  return (
    <>
      <GigLeftOverview />
      <GigLeftAbout />
    </>
  );
};

export default GigViewLeft;
