import { FC, ReactElement } from 'react';
import { Link, NavigateFunction, useNavigate } from 'react-router-dom';
import { IHomeHeaderProps } from '../interfaces/header.interface';
import { AppDispatch, useAppDispatch } from 'src/store/store';
import { applicationLogout } from 'src/shared/utils/utils.service';
import { lowerCase } from 'src/shared/utils/utils.service';

const SettingsDropdown: FC<IHomeHeaderProps> = ({ seller, authUser, buyer, type, setIsDropdownOpen }): ReactElement => {
  const navigate: NavigateFunction = useNavigate();
  const dispatch: AppDispatch = useAppDispatch();

  const onLogout = (): void => {
    if (setIsDropdownOpen) {
      setIsDropdownOpen(false);
    }
    applicationLogout(dispatch, navigate);
  };

  return (
    <div className="border-grey w-44 divide-y divide-gray-100 rounded border bg-white shadow-md">
      <ul className="text-gray-700s py-2 text-sm" aria-labelledby="avatarButton">
        {buyer && buyer.isSeller && (
          <li className="mx-3 mb-1">
            <Link
              onClick={() => {
                if (setIsDropdownOpen) {
                  setIsDropdownOpen(false);
                }
              }}
              to={`${type === 'buyer' ? `/${lowerCase(`${authUser?.username}`)}/${seller?._id}/seller-dashboard` : '/'}`}
              className="block w-full cursor-pointer rounded bg-sky-500 px-4s py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none"
            >
              {type === 'buyer' ? 'Switch to Selling' : 'Switch to Buying'}
            </Link>
          </li>
        )}
        {buyer && buyer.isSeller && type === 'buyer' && (
          <li>
            <Link
              onClick={() => {
                if (setIsDropdownOpen) {
                  setIsDropdownOpen(false);
                }
              }}
              to={`/manage-gigs/new/${seller?._id}`}
              className="block px-4 py-2 hover:text-sky-400"
            >
              Add a new gig
            </Link>
          </li>
        )}
        {type === 'buyer' && (
          <li>
            <Link
              onClick={() => {
                if (setIsDropdownOpen) {
                  setIsDropdownOpen(false);
                }
              }}
              to={`/users/${buyer?.username}/${buyer?._id}/orders`}
              className="block px-4 py-2 hover:text-sky-400"
            >
              Dashboard
            </Link>
          </li>
        )}
        {buyer && buyer.isSeller && type === 'buyer' && (
          <li>
            <Link
              onClick={() => {
                if (setIsDropdownOpen) {
                  setIsDropdownOpen(false);
                }
              }}
              to={`/seller-profile/${lowerCase(`${seller?.username}`)}/${seller?._id}/edit`}
              className="block px-4 py-2 hover:text-sky-400"
            >
              Profile
            </Link>
          </li>
        )}
        <li>
          <Link
            onClick={() => {
              if (setIsDropdownOpen) {
                setIsDropdownOpen(false);
              }
            }}
            to={`${lowerCase(`${buyer?.username}`)}/edit`}
            className="block px-4 py-2 hover:text-sky-400"
          >
            Settings
          </Link>
        </li>
      </ul>
      <div className="py-1">
        <div onClick={onLogout} className="block px-4 py-2 text-sm hover:text-sky-400">
          Sign out
        </div>
      </div>
    </div>
  );
};

export default SettingsDropdown;
