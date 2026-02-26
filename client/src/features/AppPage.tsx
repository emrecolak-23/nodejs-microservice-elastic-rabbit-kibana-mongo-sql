import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import Index from './index/Index';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { useCheckCurrentUserQuery } from './auth/services/auth.service';
import { addAuthUser } from './auth/reducers/auth.reducer';
import { saveToSessionStorage } from 'src/shared/utils/utils.service';
import Home from './home/Home';
import HomeHeader from 'src/shared/header/components/HomeHeader';

const AppPage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = true;
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { data, isError, isSuccess, isLoading } = useCheckCurrentUserQuery();

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

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (authUser) {
    return !tokenIsValid && !authUser.id ? (
      <Index />
    ) : (
      <>
        <HomeHeader />
        <Home />
      </>
    );
  } else {
    return <Index />;
  }
};

export default AppPage;
