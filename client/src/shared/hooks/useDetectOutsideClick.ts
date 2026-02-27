import { Dispatch, useCallback, useState, useEffect, SetStateAction } from 'react';

const useDetectOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  initialState: boolean
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isActive, setIsActive] = useState(initialState);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (ref.current !== null && !ref.current.contains(event.target as HTMLDivElement)) {
        setIsActive(!isActive);
      }
    },
    [isActive, ref]
  );

  useEffect(() => {
    if (isActive) {
      window.addEventListener('click', handleClick);
    }

    return () => window.removeEventListener('click', handleClick);
  }, [isActive, handleClick]);

  return [isActive, setIsActive];
};

export default useDetectOutsideClick;
