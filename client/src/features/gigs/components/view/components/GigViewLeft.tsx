import { FC, ReactElement } from 'react';
import GigLeftOverview from './GigViewLeft/GigLeftOverview';
import GigLeftAbout from './GigViewLeft/GigLeftAbout';
import GigViewReview from './GigViewLeft/GigViewReview';

const GigViewLeft: FC = (): ReactElement => {
  return (
    <>
      <GigLeftOverview />
      <GigLeftAbout />
      <GigViewReview showRatings={true} />
    </>
  );
};

export default GigViewLeft;
