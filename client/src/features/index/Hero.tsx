import { ChangeEvent, FC, ReactElement, RefObject, useEffect, useRef, useState } from 'react';
import Button from '../../shared/button/Button';
import { v4 as uuidv4 } from 'uuid';
import Typed from 'typed.js';
import TextInput from '../../shared/inputs/TextInput';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const categories: string[] = ['Graphics & Design', 'Digital Marketing', 'Writing & Translation', 'Programming & Tech'];

const Hero: FC = (): ReactElement => {
  const navigate = useNavigate();
  const typedElement: RefObject<HTMLSpanElement | null> = useRef<HTMLSpanElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const navigateToSearchPage = () => {
    navigate(`/search?q=${searchTerm}`);
  };

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [...categories, 'Video & Animation'],
      startDelay: 300,
      typeSpeed: 200,
      backSpeed: 200,
      backDelay: 300
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return (
    <div className="relative bg-white pb-20 pt-40 dark:bg-gray-900 lg:pt-44">
      <div className="relative m-auto px-6 xl:container md:px-12 lg:px-6">
        <h3 className="mb-4 mt-4 max-w-2xl pb-2 text-center text-2xl font-normal dark:text-white lg:text-left">
          Expert categories: <span ref={typedElement}></span>
        </h3>
        <h1 className="text-center text-4xl font-black text-blue-900 dark:text-white sm:mx-auto sm:w-10/12 sm:text-5xl md:w-10/12 md:text-5xl lg:w-auto lg:text-left xl:text-6xl">
          Hire expert freelancers <br className="hidden lg:block" />{' '}
          <span className="relative bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
            for your project
          </span>
          .
        </h1>
        <div className="lg:flex">
          <div className="relative mt-8 space-y-8 text-center sm:mx-auto sm:w-10/12 md:mt-16 md:w-2/3 lg:ml-0 lg:mr-auto lg:w-6/12 lg:text-left">
            <p className="text-gray-700 dark:text-gray-300 sm:text-lg lg:w-full">Find the right freelance service for your next project.</p>

            <div className="flex w-full justify-between gap-6 lg:gap-12">
              <form className="mx-auto flex w-full items-center bg-white">
                <div className="w-full">
                  <TextInput
                    type="search"
                    className="w-full rounded-full px-4 py-1 text-gray-800 focus:outline-none"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(event: ChangeEvent) => setSearchTerm((event.target as HTMLInputElement).value)}
                  />
                </div>
                <div className="bg-sky-500">
                  <Button
                    type="submit"
                    className="flex h-12 w-12 items-center justify-center text-white"
                    label={<FaSearch className="h-5 w-5" onClick={navigateToSearchPage} />}
                  />
                </div>
              </form>
            </div>

            <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:flex sm:justify-center lg:justify-start">
              {categories.map((category: string) => {
                return (
                  <div
                    key={uuidv4()}
                    className="w-full min-w-0 cursor-pointer rounded-full border border-gray-200 p-4 duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-600/20 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-cyan-300/30"
                  >
                    <div className="flex justify-center">
                      <span className="block truncate text-sm font-medium dark:text-white">
                        <a href={`/search/categories/${category}`}>{category}</a>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative hidden lg:flex lg:w-6/12 lg:items-center lg:justify-end">
            <img
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/hero/phone-mockup.png"
              className="w-full max-w-md xl:max-w-lg"
              alt="Phone mockup"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
