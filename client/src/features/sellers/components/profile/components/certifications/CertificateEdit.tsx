import { ChangeEvent, FC, ReactElement, useContext, useState } from 'react';
import { SellerContext } from 'src/features/sellers/context/SellerContext';
import { ICertificate, ICertificateEditProps } from 'src/features/sellers/interfaces/seller.interface';
import Button from 'src/shared/button/Button';
import Dropdown from 'src/shared/dropdown/Dropdown';
import TextInput from 'src/shared/inputs/TextInput';
import { cn } from 'src/shared/utils/cn';
import { cloneDeep, yearsList } from 'src/shared/utils/utils.service';

const CertificateEdit: FC<ICertificateEditProps> = ({
  type,
  selectedCertificate,
  setShowCertificateAddForm,
  setShowCertificateEditForm
}): ReactElement => {
  const { sellerProfile, setSellerProfile } = useContext(SellerContext);

  const [certificateItem, setCertificateItem] = useState<ICertificate>({
    name: selectedCertificate ? selectedCertificate.name : '',
    from: selectedCertificate ? selectedCertificate.from : '',
    year: selectedCertificate ? selectedCertificate.year : 'Year'
  });

  const [year, setYear] = useState<string>(selectedCertificate ? selectedCertificate.year.toString() : 'Year');

  const onHandleUpdate = (): void => {
    setCertificateItem({
      ...certificateItem,
      year
    });

    if (type === 'add') {
      const newItem: ICertificate = {
        name: certificateItem.name,
        from: certificateItem.from,
        year
      };
      const clonedCertificates: ICertificate[] = cloneDeep(sellerProfile.certificates);
      clonedCertificates.push(newItem);
      if (setSellerProfile && setShowCertificateAddForm) {
        setSellerProfile({
          ...sellerProfile,
          certificates: clonedCertificates
        });
        setShowCertificateAddForm(false);
      }
    } else {
      const itemIndex: number = sellerProfile.certificates.findIndex(
        (certificate: ICertificate) => certificate.name === selectedCertificate?.name
      );

      if (itemIndex !== -1) {
        const clonedCertificates: ICertificate[] = cloneDeep(sellerProfile.certificates);
        const clonedItem: ICertificate = {
          name: certificateItem.name,
          from: certificateItem.from,
          year,
          _id: selectedCertificate?._id
        };
        clonedCertificates.splice(itemIndex, 1, clonedItem);
        const filteredCertificates: ICertificate[] = clonedCertificates.filter(
          (certificate: ICertificate) => certificate.name !== '' && certificate.name !== undefined
        );
        if (setSellerProfile && setShowCertificateEditForm) {
          setSellerProfile({
            ...sellerProfile,
            certificates: filteredCertificates
          });
          setShowCertificateEditForm(false);
        }
      }
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-16 px-3">
        <TextInput
          className="border-grey mb-4 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
          placeholder="Certificate or Award"
          type="text"
          name="name"
          value={certificateItem.name}
          onChange={(e: ChangeEvent) => {
            setCertificateItem({
              ...certificateItem,
              name: (e.target as HTMLInputElement).value
            });
          }}
        />
        <TextInput
          className="border-grey mb-4 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
          placeholder="Certificate From (e.g: Google)"
          type="text"
          name="from"
          value={certificateItem.from}
          onChange={(e: ChangeEvent) => {
            setCertificateItem({
              ...certificateItem,
              from: (e.target as HTMLInputElement).value
            });
          }}
        />
        <div className="relative">
          <Dropdown text={year} setValue={setYear} maxHeight="300" mainClassNames="absolute bg-white z-50" values={yearsList(30)} />
        </div>
      </div>
      <div className="z-20 my-4 mt-10 flex cursor-pointer justify-center md:z-0 md:mt-0">
        <Button
          disabled={(year === 'Year' || !certificateItem.name || !certificateItem.from) && type === 'add'}
          className={cn(
            'md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2',
            {
              'cursor-not-allowed opacity-50': (year === 'Year' || !certificateItem.name || !certificateItem.from) && type === 'add',
              'cursor-pointer':
                year !== 'Year' &&
                certificateItem.name !== '' &&
                certificateItem.name !== undefined &&
                certificateItem.from !== '' &&
                certificateItem.from !== undefined &&
                type === 'add'
            }
          )}
          onClick={onHandleUpdate}
          label={type === 'add' ? 'Add' : 'Update'}
        />
        &nbsp;&nbsp;
        <Button
          className="md:text-md rounded bg-gray-300 px-6 py-1 text-center text-sm font-bold hover:bg-gray-200 focus:outline-none md:py-2"
          label="Cancel"
          onClick={() => {
            if (type === 'add' && setShowCertificateAddForm) {
              setShowCertificateAddForm(false);
            }
            if (type === 'edit' && setShowCertificateEditForm) {
              setShowCertificateEditForm(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default CertificateEdit;
