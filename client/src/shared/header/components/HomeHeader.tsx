import { FC, ReactElement, useRef } from 'react';
import { IHomeHeaderProps } from '../interfaces/header.interface';
import Button from 'src/shared/button/Button';
import { FaAngleLeft, FaAngleRight, FaBars, FaRegBell, FaRegEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { categories, replaceSpacesWithDash } from 'src/shared/utils/utils.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import Banner from 'src/shared/banner/Banner';
import { useResendEmailMutation } from 'src/features/auth/services/auth.service';
import { IResponse } from 'src/shared/shared.interface';
import { useAppDispatch } from 'src/store/store';
import { addAuthUser } from 'src/features/auth/reducers/auth.reducer';
import useDetectOutsideClick from 'src/shared/hooks/useDetectOutsideClick';
import SettingsDropdown from './SettingsDropdown';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';

const HomeHeader: FC<IHomeHeaderProps> = ({ showCategoryContainer }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const logout = useAppSelector((state: IReduxState) => state.logout);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);

  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const messageDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const orderDropdownRef = useRef<HTMLDivElement>(null);
  const navElement = useRef<HTMLDivElement>(null);

  const [isSettingsDropdown, setIsSettingsDropdown] = useDetectOutsideClick(settingsDropdownRef, false);
  const isMessageDropdownOpen = false;
  const isNotificationDropdownOpen = false;
  const isOrderDropdownOpen = false;

  console.log(isSettingsDropdown, 'isSettingsDropdown');

  const [resendEmail] = useResendEmailMutation();
  const dispatch = useAppDispatch();
  const handleVerifyEmail = async (): Promise<void> => {
    try {
      const result: IResponse = await resendEmail({ userId: authUser.id!, email: authUser.email! }).unwrap();
      dispatch(addAuthUser({ authInfo: result.user }));
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDropdown = (): void => {
    setIsSettingsDropdown(!isSettingsDropdown);
  };

  return (
    <header>
      <nav className="navbar peer-checked:navbar-active relative z-[120] w-full border-b bg-white shadow-2xl shadow-gray-600/5 backdrop-blur dark:shadow-none">
        {!logout && !authUser.emailVerified && (
          <Banner
            text="Please verify your email to continue"
            bgColor="bg-warning"
            showLink={true}
            linkText="Verify Email"
            onClick={handleVerifyEmail}
          />
        )}
        <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 md:gap-0 md:py-3 lg:py-5">
            <div className="flex w-full gap-x-4 lg:w-6/12">
              <div className="hidden w-full md:flex">
                <label htmlFor="hbr" className="peer-checked:hamburger relative z-20 -ml-4 block cursor-pointer p-6 lg:hidden">
                  <Button
                    className="m-auto flex h-0.5 w-5 items-center rounded transition duration-300"
                    label={<FaBars className="h-6 w-6 text-sky-500" />}
                  />
                </label>
                <div className="w-full gap-x-4 md:flex">
                  <Link
                    to="/"
                    className="relative z-10 flex cursor-pointer justify-center self-center text-2xl font-semibold text-black lg:text-3xl"
                  >
                    Jobber
                  </Link>
                  {/* <!-- Add HeaderSearchInput component --> */}
                </div>
              </div>
              {/* <!-- Add MobileHeaderSearchInput component here --> */}
            </div>
            <div className="navmenu mb-16 hidden w-full cursor-pointer flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl shadow-gray-300/20 dark:border-gray-700 dark:shadow-none md:flex-nowrap lg:m-0 lg:flex lg:w-6/12 lg:space-y-0 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="text-[#74767e] lg:pr-4">
                <ul className="flex text-base font-medium">
                  <li className="relative z-50 flex cursor-pointer items-center">
                    <Button
                      className="px-4"
                      label={
                        <>
                          <FaRegBell />
                          {/* <span className="absolute -top-0 right-0 mr-3 inline-flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#ff62ab]"></span> */}
                        </>
                      }
                    />
                    <Transition
                      ref={notificationDropdownRef}
                      show={isNotificationDropdownOpen}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <div className="absolute right-0 mt-5 w-96">{/* <!-- NotificationDropdown --> */}</div>
                    </Transition>
                  </li>
                  <li className="relative z-50 flex cursor-pointer items-center">
                    <Button
                      className="relative px-4"
                      label={
                        <>
                          <FaRegEnvelope />
                          {/* <span className="absolute -top-1 right-0 mr-2 inline-flex h-[6px] w-[6px] items-center justify-center rounded-full bg-[#ff62ab]"></span> */}
                        </>
                      }
                    />
                    <Transition
                      ref={messageDropdownRef}
                      show={isMessageDropdownOpen}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <div className="absolute right-0 mt-5 w-96">{/* <!-- MessageDropdown --> */}</div>
                    </Transition>
                  </li>
                  <li className="relative z-50 flex cursor-pointer items-center">
                    <Button
                      className="px-3"
                      label={
                        <>
                          <span>Orders</span>
                        </>
                      }
                    />
                    <Transition
                      ref={orderDropdownRef}
                      show={isOrderDropdownOpen}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <div className="absolute right-0 mt-5 w-96">{/* <!-- OrderDropdown --> */}</div>
                    </Transition>
                  </li>
                  <li className="relative flex items-center">
                    <Link
                      to="/seller_onboarding"
                      className="relative ml-auto flex h-9 items-center justify-center rounded-full bg-sky-500 text-white font-bold sm:px-6 hover:bg-sky-400"
                    >
                      <span>Become a Seller</span>
                    </Link>
                  </li>
                  <li className="relative z-50 flex cursor-pointer items-center">
                    <div ref={settingsDropdownRef} className="relative">
                      <Button
                        onClick={toggleDropdown}
                        className="relative flex gap-2 px-3 text-base font-medium"
                        label={
                          <>
                            <img src={`${authUser.profilePicture}`} alt="profile" className="h-7 w-7 rounded-full object-cover" />
                            <span className="flex self-center">{authUser.username}</span>
                          </>
                        }
                      />
                      <Transition
                        show={isSettingsDropdown}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <div className="absolute -right-48 z-50 mt-1 w-96">
                          <SettingsDropdown
                            seller={{} as ISellerDocument}
                            buyer={buyer}
                            authUser={authUser}
                            type="buyer"
                            setIsDropdownOpen={setIsSettingsDropdown}
                          />
                        </div>
                      </Transition>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {showCategoryContainer && (
          <div className="border-grey z-40 hidden w-full border border-x-0 border-b-0 sm:flex">
            <div className="justify-left md:justify-left container mx-auto flex px-6 lg:justify-center">
              <span className="flex w-auto cursor-pointer self-center pr-1 xl:hidden">
                <FaAngleLeft size={20} />
              </span>
              <div
                ref={navElement}
                className="relative inline-block h-full w-full items-center gap-6 overflow-x-auto scroll-smooth whitespace-nowrap py-2 text-sm font-medium lg:flex lg:justify-between"
              >
                {categories().map((category: string) => (
                  <span key={uuidv4()} className="mx-4 cursor-pointer first:ml-0 hover:text-sky-400 lg:mx-0">
                    <Link to={`/categories/${replaceSpacesWithDash(category)}`}>{category}</Link>
                  </span>
                ))}
              </div>
              <span className="flex w-auto cursor-pointer self-center pl-1 xl:hidden">
                <FaAngleRight size={20} />
              </span>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HomeHeader;
