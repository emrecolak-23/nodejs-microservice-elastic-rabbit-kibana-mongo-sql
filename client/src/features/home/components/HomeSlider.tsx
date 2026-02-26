import { FC, ReactElement, useEffect, useState } from 'react';
import { ISliderState } from '../interfaces/home.interface';
import { sliderImages, sliderImagesText } from 'src/shared/utils/static-data';
import { ISliderImagesText } from 'src/shared/shared.interface';
import { cn } from 'src/shared/utils/cn';

const HomeSlider: FC = (): ReactElement => {
  const [slideState, setSlideState] = useState<ISliderState>({
    slideIndex: 0,
    slideShow: sliderImages[0]
  });

  const [sliderInterval, setSliderInterval] = useState<NodeJS.Timeout>();
  const [currentSliderImageText, setCurrentSliderImageText] = useState<ISliderImagesText>(sliderImagesText[0]);

  const { slideIndex, slideShow } = slideState;
  let currentSlideIndex = 0;

  const autoMoveSlide = (): void => {
    const lastIndex = currentSlideIndex + 1;
    const shouldResetIndex = lastIndex > sliderImages.length - 1;
    currentSlideIndex = shouldResetIndex ? 0 : lastIndex;
    setSlideState((prev: ISliderState) => {
      return {
        ...prev,
        slideIndex: currentSlideIndex,
        slideShow: sliderImages[currentSlideIndex]
      };
    });
    setCurrentSliderImageText(sliderImagesText[currentSlideIndex]);
  };

  useEffect(() => {
    // setSlideState({
    //     ...slideState,
    //     slideIndex: 0,
    //     slideShow: sliderImages[0]
    // })
    // setCurrentSliderImageText(sliderImagesText[0]);

    const timeInterval: NodeJS.Timeout = setInterval(autoMoveSlide, 4000);
    setSliderInterval(timeInterval);

    return () => {
      clearInterval(sliderInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="flex gap-x-8">
      <div className="relative h-96 w-full overflow-hidden bg-red-50">
        <img alt="slider" className="absolute h-96 w-full object-cover transition" src={slideShow} />
        <div className="absolute px-6 py-4">
          <h2 className="text-3xl font-bold text-white">{currentSliderImageText.header}</h2>
          <h4 className="pt-1 text-white font-bold">{currentSliderImageText.subHeader}</h4>
        </div>
        <div className="absolute bottom-0 flex gap-3 px-6 py-4">
          {sliderImages.map((_, index: number) => {
            return (
              <div
                key={index}
                className={cn('h-2 w-2 rounded-full', {
                  'bg-sky-500': index === slideIndex,
                  'bg-gray-300': index !== slideIndex
                })}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
