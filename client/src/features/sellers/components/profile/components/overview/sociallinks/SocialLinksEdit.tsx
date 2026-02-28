import { ChangeEvent, FC, ReactElement, useContext, useState } from 'react';
import { SellerContext } from 'src/features/sellers/context/SellerContext';
import { ISocialEditLinksProps } from 'src/features/sellers/interfaces/seller.interface';
import Button from 'src/shared/button/Button';
import TextInput from 'src/shared/inputs/TextInput';
import { cn } from 'src/shared/utils/cn';
import { cloneDeep } from 'src/shared/utils/utils.service';

const SocialLinksEdit: FC<ISocialEditLinksProps> = ({
  type,
  selectedLink,
  setShowSocialLinksAddForm,
  setShowSocialLinksEditForm
}): ReactElement => {
  const [socialLink, setSocialLink] = useState<string>(selectedLink ? `${selectedLink}` : '');
  const { sellerProfile, setSellerProfile } = useContext(SellerContext);

  const onHandleUpdate = (): void => {
    if (type === 'add') {
      const clonedSocialLinks: string[] = cloneDeep(sellerProfile?.socialLinks || []);
      clonedSocialLinks.push(socialLink);
      if (setSellerProfile && setShowSocialLinksAddForm) {
        setSellerProfile({ ...sellerProfile, socialLinks: clonedSocialLinks });
        setShowSocialLinksAddForm(false);
      }
    } else {
      if (selectedLink) {
        const itemIndex: number = sellerProfile?.socialLinks?.indexOf(selectedLink) || -1;
        const clonedSocialLinks: string[] = cloneDeep(sellerProfile?.socialLinks || []);
        clonedSocialLinks.splice(itemIndex, 1, socialLink);
        const filtered = clonedSocialLinks.filter((link: string) => link !== '');
        if (setSellerProfile && setShowSocialLinksEditForm) {
          setSellerProfile({ ...sellerProfile, socialLinks: filtered });
          setShowSocialLinksEditForm(false);
        }
      }
    }
  };

  const onCancelUpdate = (): void => {
    if (type === 'add' && setShowSocialLinksAddForm) {
      setShowSocialLinksAddForm(false);
    } else if (type === 'edit' && setShowSocialLinksEditForm) {
      setShowSocialLinksEditForm(false);
    }
  };
  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 px-3">
        <TextInput
          className="border-grey w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
          placeholder="Social media link"
          type="text"
          name="socialLink"
          value={socialLink}
          onChange={(e: ChangeEvent) => setSocialLink((e.target as HTMLInputElement).value)}
        />
      </div>
      <div className="z-20 my-4 mt-10 flex cursor-pointer justify-center md:z-0 md:mt-0">
        <Button
          disabled={!socialLink && type === 'add'}
          className={cn(
            'md:text-md rounded bg-sky-500 px-6 py-1 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-2',
            !socialLink && type === 'add' && 'bg-gray-300 cursor-not-allowed opacity-50',
            socialLink && type !== 'add' && 'cursor-pointer'
          )}
          label={type === 'add' ? 'Add' : 'Update'}
          onClick={onHandleUpdate}
        />
        &nbsp;&nbsp;
        <Button
          className="md:text-md rounded bg-gray-300 px-6 py-1 text-center text-sm font-bold hover:bg-gray-200 focus:outline-none md:py-2"
          label="Cancel"
          onClick={onCancelUpdate}
        />
      </div>
    </div>
  );
};

export default SocialLinksEdit;
