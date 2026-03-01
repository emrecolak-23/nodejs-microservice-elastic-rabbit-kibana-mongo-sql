import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Navigate, NavigateFunction, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { useCheckCurrentUserQuery } from './auth/services/auth.service';
import { addAuthUser } from './auth/reducers/auth.reducer';
import { addBuyer } from './buyer/reducers/buyer.reducer';
import { addSeller } from './sellers/reducers/seller.reducer';
import { useGetCurrentBuyerByUsernameQuery } from './buyer/services/buyer.service';
import { useGetSellerByUsernameQuery } from './sellers/services/seller.service';
import { applicationLogout, getDataFromSessionStorage, saveToSessionStorage } from 'src/shared/utils/utils.service';
import HomeHeader from 'src/shared/header/components/HomeHeader';

export interface IProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: FC<IProtectedRouteProps> = ({ children }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const showCategoryContainer = useAppSelector((state: IReduxState) => state.showCategoryContainer);
  const header = useAppSelector((state: IReduxState) => state.header);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();

  const { data, isError } = useCheckCurrentUserQuery();
  const { data: buyerData } = useGetCurrentBuyerByUsernameQuery(undefined, { skip: !authUser?.id });
  const { data: sellerData } = useGetSellerByUsernameQuery(authUser?.username ?? '', { skip: !authUser?.username });

  const checkUser = useCallback(() => {
    if (data && data.user) {
      setTokenIsValid(true);
      dispatch(addAuthUser({ authInfo: data.user }));
      saveToSessionStorage(JSON.stringify(true), JSON.stringify(authUser.username));
    }

    if (isError) {
      if (getDataFromSessionStorage('isLoggedIn') === false) return;
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [data, dispatch, authUser.username, isError, navigate]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (buyerData?.buyer) dispatch(addBuyer(buyerData.buyer));
    if (sellerData?.seller) dispatch(addSeller(sellerData.seller));
  }, [buyerData, sellerData, dispatch]);

  if ((data && data.user) || authUser?.id) {
    if (tokenIsValid) {
      return (
        <>
          {header && header === 'home' && <HomeHeader showCategoryContainer={showCategoryContainer} />}
          {children}
        </>
      );
    }
    return <></>;
  }
  return <Navigate to="/" />;
};

export default ProtectedRoute;
