import { FC, ReactElement, useState } from 'react';
import Index from './index/Index';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { useCheckCurrentUserQuery } from './auth/services/auth.service';

const AppPage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const appLogout = useAppSelector((state: IReduxState) => state.logout);
  const showCategoryContainer = true;
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);

  const { data, isError, isSuccess, isLoading } = useCheckCurrentUserQuery();
  console.log(data, 'data', isError, 'isError', isSuccess, 'isSuccess', isLoading, 'isLoading');

  return (
    <div>
      <Index />
    </div>
  );
};

export default AppPage;
