import { ChangeEvent, FC, ReactElement, useState } from 'react';
import { IModalBgProps } from 'src/shared/modals/interfaces/modal.interface';
import Button from 'src/shared/button/Button';
import Alert from 'src/shared/alert/Alert';
import TextInput from 'src/shared/inputs/TextInput';
import { FaTimes } from 'react-icons/fa';
import ModalBg from 'src/shared/modals/modalBg';
import { AUTH_FETCH_STATUS } from '../interfaces/auth.interface';

import { cn } from 'src/shared/utils/cn';
import { useForgotPasswordMutation } from '../services/auth.service';
import { IResponse } from 'src/shared/shared.interface';

const ForgotPassword: FC<IModalBgProps> = ({ onClose, onToggle }): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);
  const [email, setEmail] = useState<string>('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onForgotPassword = async (): Promise<void> => {
    try {
      const result: IResponse = await forgotPassword(email).unwrap();
      console.log(result);
      setStatus(AUTH_FETCH_STATUS.SUCCESS);
      setAlertMessage(result.message || 'Password reset email sent successfully');
    } catch (error) {
      setStatus(AUTH_FETCH_STATUS.ERROR);
      setAlertMessage(error?.data?.message || 'An error occurred while resetting password');
      console.error(error);
    }
  };

  return (
    <ModalBg>
      <div className="relative top-[20%] mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
        <div className="relative px-5 py-5">
          <div className="mb-5 flex justify-between text-2xl font-bold text-gray-600">
            <h1 className="flex w-full justify-center">Forgot Password</h1>
            <Button
              testId="closeModal"
              className="cursor-pointer rounded text-gray-400 hover:text-gray-600"
              role="button"
              label={<FaTimes className="icon icon-tabler icon-tabler-x" onClick={() => onClose?.()} />}
            />
          </div>
          {alertMessage && <Alert type={status} message={alertMessage} />}
          <div className="mb-5 w-full text-center text-base font-normal text-gray-600">
            <p className="text-gray-600">Please enter your email address and we'll send you a link to reset your password.</p>
          </div>
          <div>
            <label htmlFor="email or username" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
              Email
            </label>
            <TextInput
              id="email"
              name="email"
              type="text"
              value={email}
              onChange={(event: ChangeEvent) => setEmail((event.target as HTMLInputElement).value)}
              className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
              placeholder="Enter email"
            />
          </div>

          <div className="flex w-full items-center justify-center">
            <Button
              testId="submit"
              disabled={!email}
              onClick={() => onForgotPassword()}
              className={cn(
                'text-md block w-full cursor-pointer rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none',
                {
                  'opacity-50 cursor-not-allowed': !email || isLoading
                }
              )}
              label={isLoading ? 'FORGOT PASSWORD PROGRESS...' : 'FORGOT PASSWORD'}
            />
          </div>
        </div>
        <hr />
        <div className="px-5 py-4">
          <div className="ml-2 flex w-full justify-center text-sm font-medium">
            <div className="flex justify-center">
              <p className="ml-2 flex cursor-pointer text-blue-600 hover:underline" onClick={() => onToggle?.()}>
                Back to Sing In
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default ForgotPassword;
