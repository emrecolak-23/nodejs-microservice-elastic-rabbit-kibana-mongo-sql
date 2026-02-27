import { ChangeEvent, FC, KeyboardEvent, ReactElement, useState } from 'react';
import { IPersonalInfoProps } from 'src/features/sellers/interfaces/seller.interface';
import TextInput from 'src/shared/inputs/TextInput';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';

const PersonalInfo: FC<IPersonalInfoProps> = ({ personalInfo, setPersonalInfo }): ReactElement => {
  const [allowedInfoLength, setAllowedInfoLength] = useState<{ oneliner: string; description: string }>({
    oneliner: '70/70',
    description: '600/600'
  });

  const maxDescriptionCharacters = 600;
  const maxOneLinerCharacters = 70;

  return (
    <div className="border-b border-grey p-6">
      <div className="mb-6 grid md:grid-cols-5">
        <div className="pb-2 text-base font-medium">
          Fullname<sup className="top-[-0.3em] text-base text-red-500">*</sup>
        </div>
        <div className="col-span-4 w-full">
          <TextInput
            className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
            type="text"
            name="fullname"
            value={personalInfo.fullName}
            onChange={(e: ChangeEvent) => {
              setPersonalInfo({ ...personalInfo, fullName: (e.target as HTMLInputElement).value });
            }}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2 mt-6 md:mt-0">
          Oneliner<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextInput
            className="w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            type="text"
            rows={5}
            name="oneliner"
            value={personalInfo.oneliner}
            onChange={(event: ChangeEvent) => {
              const rawValue: string = (event.target as HTMLInputElement).value;
              const onelinerValue: string = rawValue.slice(0, maxOneLinerCharacters);
              setPersonalInfo({ ...personalInfo, oneliner: onelinerValue });
              const counter: number = maxOneLinerCharacters - onelinerValue.length;
              setAllowedInfoLength({ ...allowedInfoLength, oneliner: `${counter}/70` });
            }}
            onKeyDown={(event: KeyboardEvent<Element>) => {
              const currentTextLength: number = (event.target as HTMLInputElement).value.length;
              if (currentTextLength === maxOneLinerCharacters && event.key !== 'Backspace') {
                event.preventDefault();
              }
            }}
            placeholder="E.g. Expert Mobile and Web Developer"
          />
          <span className="flex justify-end text-[#95979d] text-xs">{allowedInfoLength.oneliner} Characters</span>
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2">
          Description<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextAreaInput
            className="w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            name="description"
            value={personalInfo.description}
            onChange={(event: ChangeEvent) => {
              const rawValue: string = (event.target as HTMLInputElement).value;
              const descriptionValue: string = rawValue.slice(0, maxDescriptionCharacters);
              setPersonalInfo({ ...personalInfo, description: descriptionValue });
              const counter: number = maxDescriptionCharacters - descriptionValue.length;
              setAllowedInfoLength({ ...allowedInfoLength, description: `${counter}/600` });
            }}
            onKeyDown={(event: KeyboardEvent<Element>) => {
              const currentTextLength: number = (event.target as HTMLTextAreaElement).value.length;
              if (currentTextLength === maxDescriptionCharacters && event.key !== 'Backspace') {
                event.preventDefault();
              }
            }}
            rows={5}
          />
          <span className="flex justify-end text-[#95979d] text-xs">{allowedInfoLength.description} Characters</span>
        </div>
      </div>
      <div className="grid md:grid-cols-5 mb-6">
        <div className="text-base font-medium pb-2">
          Response Time<sup className="text-red-500 text-base top-[-0.3em]">*</sup>
        </div>
        <div className="w-full col-span-4">
          <TextInput
            className="w-full rounded border border-grey p-2.5 mb-1 text-sm font-normal text-gray-600 focus:outline-none"
            type="number"
            name="responseTime"
            value={personalInfo.responseTime}
            onChange={(e: ChangeEvent) => {
              const value: string = (e.target as HTMLInputElement).value;
              setPersonalInfo({ ...personalInfo, responseTime: parseInt(value) > 0 ? value : '' });
            }}
            placeholder="E.g. 1"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
