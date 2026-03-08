import { ChangeEvent, FC, ReactElement, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Alert from 'src/shared/alert/Alert';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { cn } from 'src/shared/utils/cn';
import { PASSWORD_TYPE } from 'src/shared/utils/static-data';
import { applicationLogout, isFetchBaseQueryError, showErrorToast } from 'src/shared/utils/utils.service';
import { useAppDispatch } from 'src/store/store';
import { useChangePasswordMutation } from '../services/settings.service';

interface IPasswordItem {
  currentPassword: string;
  newPassword: string;
  passwordType: 'password' | 'text';
}

const ChangePassword: FC = (): ReactElement => {
  const [passwordItem, setPasswordItem] = useState<IPasswordItem>({
    currentPassword: '',
    newPassword: '',
    passwordType: PASSWORD_TYPE.PASSWORD as 'password' | 'text'
  });

  const [alertMessage, setAlertMessage] = useState<string>('');
  const navigate: NavigateFunction = useNavigate();
  const dispatch = useAppDispatch();

  const [changePassword] = useChangePasswordMutation();

  const updatePassword = async (): Promise<void> => {
    try {
      await changePassword({
        currentPassword: passwordItem.currentPassword,
        newPassword: passwordItem.newPassword
      });
      setAlertMessage('');
      setTimeout(() => {
        applicationLogout(dispatch, navigate);
      }, 3000);
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        setAlertMessage(error.data.message);
        showErrorToast(error.data.message);
      }

      console.log(error);
    }
  };

  return (
    <div>
      {alertMessage && <Alert type="error" message={alertMessage} />}
      <>
        <label htmlFor="currentPassword" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
          Current Password
        </label>
        <TextInput
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={passwordItem.currentPassword}
          onChange={(e: ChangeEvent) => setPasswordItem({ ...passwordItem, currentPassword: (e.target as HTMLInputElement).value })}
          className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
          placeholder="Enter current password"
        />
      </>
      <>
        <label htmlFor="newPassword" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
          New Password
        </label>
        <div className="relative flex gap-4">
          <TextInput
            id="newPassword"
            name="newPassword"
            type={passwordItem.passwordType}
            value={passwordItem.newPassword}
            onChange={(e: ChangeEvent) => setPasswordItem({ ...passwordItem, newPassword: (e.target as HTMLInputElement).value })}
            className="mb-5 mt-2 flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
            placeholder="Enter new password"
          />
          <div className="absolute right-0  flex h-full cursor-pointer items-center pr-3 text-gray-600">
            {passwordItem.passwordType === PASSWORD_TYPE.PASSWORD ? (
              <FaEyeSlash
                onClick={() => setPasswordItem({ ...passwordItem, passwordType: PASSWORD_TYPE.TEXT as 'password' | 'text' })}
                className="mb-2"
              />
            ) : (
              <FaEye
                onClick={() => setPasswordItem({ ...passwordItem, passwordType: PASSWORD_TYPE.PASSWORD as 'password' | 'text' })}
                className="mb-2"
              />
            )}
          </div>
        </div>
        <div className="flex w-full items-center justify-center">
          <Button
            className={cn('text-md block w-full cursor-pointer rounded  px-8 py-2 text-center font-bold text-white focus:outline-none', {
              'cursor-not-allowed bg-sky-200': !passwordItem.currentPassword || !passwordItem.newPassword,
              'cursor-pointer bg-sky-500': passwordItem.currentPassword && passwordItem.newPassword
            })}
            disabled={!passwordItem.currentPassword || !passwordItem.newPassword}
            label="Save Changes"
            onClick={updatePassword}
          />
        </div>
      </>
    </div>
  );
};

export default ChangePassword;
