import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { IHeader } from '../interfaces/header.interface';

const Header: FC<IHeader> = ({ navClass }): ReactElement => {
  return (
    <header>
      <nav className={navClass}>
        <div className="m-auto px-6 xl:container md:px-12 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 md:gap-0 md:py-3 lg:py-5">
            <input type="checkbox" id="nav-toggle" className="peer hidden" />
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link to="/" className="relative z-10 cursor-pointer text-3xl font-semibold text-white">
                Jobber
              </Link>
              <label
                htmlFor="nav-toggle"
                className="relative z-20 -mr-2 flex h-10 w-10 shrink-0 cursor-pointer flex-col items-center justify-center lg:hidden"
                aria-label="Menüyü aç"
              >
                <span className="block h-0.5 w-5 rounded bg-gray-700 dark:bg-gray-200" />
                <span className="mt-1.5 block h-0.5 w-5 rounded bg-gray-700 dark:bg-gray-200" />
                <span className="mt-1.5 block h-0.5 w-5 rounded bg-gray-700 dark:bg-gray-200" />
              </label>
            </div>
            <div className="navmenu mb-16 hidden w-full cursor-pointer flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-200 p-6 shadow-2xl shadow-gray-300/20 dark:border-gray-700 dark:shadow-none md:flex-nowrap lg:m-0 peer-checked:flex lg:flex lg:w-7/12 lg:space-y-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="text-gray-600 dark:text-gray-300 lg:pr-4">
                <ul className="space-y-6 text-base font-medium tracking-wide lg:flex lg:space-y-0 lg:text-sm">
                  <li>
                    <div className="hover:text-primary dark:hover:text-primaryLight block transition md:px-4">
                      <span>Become a Seller</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="border-primary/10 -ml-1 flex w-full flex-col gap-2 dark:border-gray-700 sm:flex-row sm:gap-4 md:w-max lg:space-y-0 lg:border-l lg:pl-4">
                <Link
                  to="/login"
                  className="flex h-9 w-max shrink-0 items-center justify-center px-6 transition-colors hover:text-primary dark:hover:text-primaryLight"
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex h-9 w-max shrink-0 items-center justify-center rounded-full bg-sky-500 px-6 font-bold text-white transition-colors hover:bg-sky-400"
                >
                  <span className="text-sm font-semibold">Sign Up</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
