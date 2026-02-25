import { ChangeEvent, FC, FormEvent, ReactElement, useState } from 'react';
import Button from 'src/shared/button/Button';
import Alert from 'src/shared/alert/Alert';
import TextInput from 'src/shared/inputs/TextInput';
import { AUTH_FETCH_STATUS, IResetPassword } from '../interfaces/auth.interface';
import { useAuthSchema } from '../hooks/useAuthSchema';
import { resetPasswordSchema } from '../schemes/auth.schema';
import { useResetPasswordMutation } from '../services/auth.service';
import { IResponse } from 'src/shared/shared.interface';
import { cn } from 'src/shared/utils/cn';
import { useSearchParams } from 'react-router-dom';
import Header from 'src/shared/header/components/Header';

const ResetPassword: FC = (): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);
  const [userInfo, setUserInfo] = useState<IResetPassword>({
    password: '',
    confirmPassword: ''
  } as IResetPassword);

  const [schemaValidation] = useAuthSchema({ schema: resetPasswordSchema, userInfo });
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onResetPassword = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const isValid = await schemaValidation();
      if (isValid) {
        const result: IResponse = await resetPassword({
          password: userInfo.password,
          confirmPassword: userInfo.confirmPassword,
          token: searchParams.get('token') as string
        }).unwrap();
        console.log(result);
        setStatus(AUTH_FETCH_STATUS.SUCCESS);
        setAlertMessage(result.message || 'Password reset successfully');
        setUserInfo({
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setAlertMessage(error?.data?.message || 'An error occurred while registering user');
      setStatus(AUTH_FETCH_STATUS.ERROR);

      console.error(error);
    }
  };

  return (
    <>
      <Header navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white shadow-2xl shadow-gray-600/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none" />
      <div className="relative mt-24 mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
        <div className="relative px-5 py-5">
          <h2 className="text-center text-xl font-bold leading-tight tracking-tight dark:text-black md:text-2xl mb-2">Reset Password</h2>
          {alertMessage && <Alert type={status} message={alertMessage} />}
          <form className="mt-4 space-y-4 md:space-y-5 lg:mt-5">
            <div>
              <label htmlFor="password" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
                Password
              </label>
              <TextInput
                id="password"
                name="password"
                type="password"
                value={userInfo.password}
                onChange={(event: ChangeEvent) => setUserInfo({ ...userInfo, password: (event.target as HTMLInputElement).value })}
                className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
                Confirm Password
              </label>
              <TextInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={userInfo.confirmPassword}
                onChange={(event: ChangeEvent) => setUserInfo({ ...userInfo, confirmPassword: (event.target as HTMLInputElement).value })}
                className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Enter confirm password"
              />
            </div>
            <Button
              disabled={!userInfo.password || !userInfo.confirmPassword}
              onClick={onResetPassword}
              className={cn(
                'text-md block w-full cursor-pointer rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none',
                {
                  'opacity-50 cursor-not-allowed': !userInfo.password || !userInfo.confirmPassword || isLoading
                }
              )}
              label={isLoading ? 'RESET PASSWORD IN PROGRESS...' : 'RESET PASSWORD'}
            />
          </form>
        </div>
        <hr />
      </div>
    </>
  );
};

export default ResetPassword;
