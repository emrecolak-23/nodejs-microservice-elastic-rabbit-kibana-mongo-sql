import { FC, ReactElement } from 'react';
import { IPersonalInfoProps } from 'src/features/sellers/interfaces/seller.interface';
import TextInput from 'src/shared/inputs/TextInput';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';

const PersonalInfo: FC<IPersonalInfoProps> = ({ personalInfo, setPersonalInfo }): ReactElement => {
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
            onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: (e.target as HTMLInputElement).value })}
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
            onChange={(e) => setPersonalInfo({ ...personalInfo, oneliner: (e.target as HTMLInputElement).value })}
            placeholder="E.g. Expert Mobile and Web Developer"
          />
          <span className="flex justify-end text-[#95979d] text-xs">20 Characters</span>
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
            onChange={(e) => setPersonalInfo({ ...personalInfo, description: (e.target as HTMLTextAreaElement).value })}
            rows={5}
          />
          <span className="flex justify-end text-[#95979d] text-xs">100 Characters</span>
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
            onChange={(e) => setPersonalInfo({ ...personalInfo, responseTime: (e.target as HTMLInputElement).value })}
            placeholder="E.g. 1"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
