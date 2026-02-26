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

const AppPage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = true;
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const { data, isError, isLoading } = useCheckCurrentUserQuery();

  const checkUser = useCallback(async () => {
    try {
      if (data && data.user && !appLogout) {
        setTokenIsValid(true);
        dispatch(addAuthUser({ authInfo: data.user }));
        // dispatch buyer info
        // dispatch seller info
        saveToSessionStorage(JSON.stringify(true), JSON.stringify(authUser.username));
      }
    } catch (error) {
      console.log(error, 'error');
    }
  }, [data, dispatch, appLogout, authUser.username]);

  const logoutUser = useCallback(() => {
    if (isLoading) return;
    try {
      if (getDataFromSessionStorage('isLoggedIn') === false) return;
    } catch {
      return;
    }
    if ((!data && appLogout) || isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [data, dispatch, navigate, appLogout, isError, isLoading]);

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
