import { FC, ReactElement } from 'react';
import { SellerContext } from 'src/features/sellers/context/SellerContext';
import { IProfileHeaderProps } from 'src/features/sellers/interfaces/seller.interface';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';
import Language from './overview/language/Language';
import AboutMe from './overview/aboutme/AboutMe';

const SellerOverview: FC<IProfileHeaderProps> = ({ sellerProfile, setSellerProfile, showEditIcons }): ReactElement => {
  return (
    <SellerContext.Provider value={{ showEditIcons, setSellerProfile, sellerProfile: sellerProfile as ISellerDocument }}>
      <div className="w-full p-4 lg:w-1/3">
        <Language />
        <AboutMe />
      </div>
      <div className="w-full p-4 lg:w-2/3">Right hand side</div>
    </SellerContext.Provider>
  );
};

export default SellerOverview;
