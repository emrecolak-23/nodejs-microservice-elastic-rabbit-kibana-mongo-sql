import { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import Alert from 'src/shared/alert/Alert';
import { AUTH_FETCH_STATUS } from '../interfaces/auth.interface';
import { IResponse } from 'src/shared/shared.interface';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation } from '../services/auth.service';
import { useAppDispatch } from 'src/store/store';
import { addAuthUser } from '../reducers/auth.reducer';

const ConfirmEmail: FC = (): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);

  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const [verifyEmail] = useVerifyEmailMutation();

  const onVerifyEmail = useCallback(async () => {
    try {
      const result: IResponse = await verifyEmail(searchParams.get('token') as string).unwrap();
      console.log(result);
      dispatch(addAuthUser({ authInfo: result?.user }));
      setStatus(AUTH_FETCH_STATUS.SUCCESS);
      setAlertMessage(result?.message || 'Email verified successfully');
    } catch (error) {
      setAlertMessage(error?.data?.message || 'An error occurred while verifying email');
      setStatus(AUTH_FETCH_STATUS.ERROR);
      console.error(error);
    }
  }, [dispatch, searchParams, verifyEmail]);

  useEffect(() => {
    onVerifyEmail();
  }, [onVerifyEmail]);

  return (
    <div className="relative mt-24 mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
      <div className="relative px-5 py-5">
        <Alert type={status} message={alertMessage} />
        <Link
          to="/"
          className="rounded bg-sky-500 px-6 py-3 mt-5 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
        >
          Continue to Home
        </Link>
      </div>
      <hr />
    </div>
  );
};

export default ConfirmEmail;
