import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import Index from './index/Index';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { useCheckCurrentUserQuery } from './auth/services/auth.service';
import { addAuthUser } from './auth/reducers/auth.reducer';
import { applicationLogout, getDataFromSessionStorage, saveToSessionStorage } from 'src/shared/utils/utils.service';
import Home from './home/Home';
import HomeHeader from 'src/shared/header/components/HomeHeader';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { useGetCurrentBuyerByUsernameQuery } from './buyer/services/buyer.service';
import { addBuyer } from './buyer/reducers/buyer.reducer';
import { useGetSellerByUsernameQuery } from './sellers/services/seller.service';
import { addSeller } from './sellers/reducers/seller.reducer';

const AppPage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = true;
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const {
    data: currentUserData,
    isError,
    isLoading
  } = useCheckCurrentUserQuery(undefined, {
    skip: authUser?.id === null
  });
  const { data: buyerData } = useGetCurrentBuyerByUsernameQuery(undefined, {
    skip: authUser?.id === null
  });
  const { data: sellerData } = useGetSellerByUsernameQuery(`${authUser.username}`, {
    skip: authUser?.id === null
  });

  const checkUser = useCallback(async () => {
    try {
      if (currentUserData && currentUserData.user && !appLogout) {
        setTokenIsValid(true);
        dispatch(addAuthUser({ authInfo: currentUserData.user }));
        dispatch(addBuyer(buyerData?.buyer));
        dispatch(addSeller(sellerData?.seller));
        saveToSessionStorage(JSON.stringify(true), JSON.stringify(authUser.username));
      }
    } catch (error) {
      console.log(error, 'error');
    }
  }, [currentUserData, dispatch, appLogout, authUser.username, buyerData]);

  const logoutUser = useCallback(() => {
    if (isLoading) return;
    try {
      if (getDataFromSessionStorage('isLoggedIn') === false) return;
    } catch {
      return;
    }
    if ((!currentUserData && appLogout) || isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [currentUserData, dispatch, navigate, appLogout, isError, isLoading]);

  useEffect(() => {
    checkUser();
    logoutUser();
  }, [checkUser, logoutUser]);

  if (authUser) {
    return !tokenIsValid && !authUser.id ? (
      <Index />
    ) : (
      <>
        <HomeHeader showCategoryContainer={showCategoryContainer} />
        <Home />
      </>
    );
  } else {
    return <Index />;
  }
};

export default AppPage;
