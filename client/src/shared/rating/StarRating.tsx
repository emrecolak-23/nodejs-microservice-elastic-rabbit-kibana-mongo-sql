import { FC, ReactElement, useEffect, useState, Fragment } from 'react';
import { IStarRatingProps } from '../shared.interface';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const StarRating: FC<IStarRatingProps> = ({ value, size, setReviewRating }): ReactElement => {
  const [numberOfStars, setNumberOfStars] = useState<number[]>([...Array(5).keys()].map((i) => i + 1));

  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (value) {
      setRating(value);
    }
  }, [value]);

  const handleClick = (index: number): void => {
    if (!value && setReviewRating) {
      setReviewRating(index);
      setRating(index);
    }
  };

  return (
    <div className="flex cursor-pointer">
      <div className="flex relative text-orange-400">
        {numberOfStars.map((index: number) => (
          <Fragment key={index}>{index <= rating && <FaStar size={size} className="mr-1" />}</Fragment>
        ))}

        <div className="absolute flex text-orange-400">
          {numberOfStars.map((index: number) => (
            <FaRegStar className="mr-1" key={uuidv4()} size={size} onClick={() => handleClick(index)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarRating;
