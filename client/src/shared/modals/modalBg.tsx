import { FC, ReactElement } from 'react';
import { IModalBgProps } from './interfaces/modal.interface';

const ModalBg: FC<IModalBgProps> = ({ children }: IModalBgProps): ReactElement => {
  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full overflow-y-auto bg-black/[.65]">
      <div className="flex min-h-screen items-start justify-center py-8">{children}</div>
    </div>
  );
};

export default ModalBg;
