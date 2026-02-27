import { FC, ReactElement, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import PersonalInfo from './components/PersonalInfo';
import SellerExperience from './components/SellerExperience';
import { ICertificate, IEducation, IExperience, ILanguage, IPersonalInfoData } from '../../interfaces/seller.interface';
import SellerEducation from './components/SellerEducation';
import SellerSkill from './components/SellerSkill';
import SellerLanguage from './components/SellerLanguage';
import SellerCertificate from './components/SellerCertificate';
import SellerSocialLinks from './components/SellerSocialLinks';

const AddSeller: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const isLoading = false;

  const [personalInfo, setPersonalInfo] = useState<IPersonalInfoData>({
    fullName: '',
    profilePicture: `${authUser.profilePicture}`,
    description: '',
    responseTime: '',
    oneliner: ''
  });

  const [experience, setExperience] = useState<IExperience[]>([
    {
      title: '',
      company: '',
      startDate: 'Start Year',
      endDate: 'End Year',
      description: '',
      currentlyWorkingHere: false
    }
  ]);

  const [educationFields, setEducationFields] = useState<IEducation[]>([
    {
      country: 'Country',
      university: '',
      title: 'Title',
      major: '',
      year: 'Year'
    }
  ]);

  const [skillsFields, setSkillsFields] = useState<string[]>(['']);

  const [languageFields, setLanguageFields] = useState<ILanguage[]>([
    {
      language: '',
      level: 'Level'
    }
  ]);

  const [certificateFields, setCertificateFields] = useState<ICertificate[]>([
    {
      name: '',
      from: '',
      year: 'Year'
    }
  ]);

  const [socialLinksFields, setSocialLinksFields] = useState<string[]>(['']);

  return (
    <div className="relative w-full">
      <Breadcrumb breadCrumbItems={['Sellers', 'Create Profile']} />
      <div className="container mx-auto my-5 overflow-hidden px-2 pb-12 md:px-0">
        {isLoading && <CircularPageLoader />}

        {authUser && !authUser.emailVerified && (
          <div className="absolute left-0 top-0 z-50 flex h-full w-full justify-center bg-white/[0.8] text-sm font-bold md:text-base lg:text-xl">
            <span className="mt-20">Please verify your email.</span>
          </div>
        )}

        <div className="left-0 top-0 z-10 mt-4 block h-full bg-white">
          <PersonalInfo personalInfoErrors={[]} personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />
          <SellerExperience experienceErrors={[]} experienceFields={experience} setExperienceFields={setExperience} />
          <SellerEducation educationFields={educationFields} setEducationFields={setEducationFields} />
          <SellerSkill skillsFields={skillsFields} setSkillsFields={setSkillsFields} />
          <SellerLanguage languageFields={languageFields} setLanguageFields={setLanguageFields} />
          <SellerCertificate certificatesFields={certificateFields} setCertificatesFields={setCertificateFields} />
          <SellerSocialLinks socialFields={socialLinksFields} setSocialFields={setSocialLinksFields} />
        </div>
      </div>
    </div>
  );
};

export default AddSeller;
