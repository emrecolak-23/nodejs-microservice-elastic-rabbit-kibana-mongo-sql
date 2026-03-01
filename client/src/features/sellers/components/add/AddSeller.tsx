import { FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import Breadcrumb from 'src/shared/breadcrumb/Breadcrumb';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import CircularPageLoader from 'src/shared/page-loader/CircularPageLoader';
import PersonalInfo from './components/PersonalInfo';
import SellerExperience from './components/SellerExperience';
import { ICertificate, IEducation, IExperience, ILanguage, IPersonalInfoData, ISellerDocument } from '../../interfaces/seller.interface';
import SellerEducation from './components/SellerEducation';
import SellerSkill from './components/SellerSkill';
import SellerLanguage from './components/SellerLanguage';
import SellerCertificate from './components/SellerCertificate';
import SellerSocialLinks from './components/SellerSocialLinks';
import { useSellerSchema } from '../../hooks/useSellerSchema';
import Button from 'src/shared/button/Button';
import { useCreateSellerMutation } from '../../services/seller.service';
import { IBuyerDocument } from 'src/features/buyer/interfaces/buyer.interface';
import { IResponse } from 'src/shared/shared.interface';
import { useAppDispatch } from 'src/store/store';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { addSeller } from '../../reducers/seller.reducer';
import { addBuyer } from 'src/features/buyer/reducers/buyer.reducer';
import { deleteFromLocalStorage, lowerCase } from 'src/shared/utils/utils.service';

const AddSeller: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
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

  const [schemaValidation, personalInfoErrors, experienceErrors, educationErrors, skillsErrors, languageErrors] = useSellerSchema({
    personalInfo,
    experienceFields: experience,
    educationFields,
    skillsFields,
    languageFields
  });

  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();

  const [createSeller, { isLoading: isCreatingSeller }] = useCreateSellerMutation();

  const errors = [...personalInfoErrors, ...experienceErrors, ...educationErrors, ...skillsErrors, ...languageErrors];
  const onCreateSeller = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const isValid = await schemaValidation();
      if (isValid) {
        const skills: string[] = skillsFields.filter((skill) => skill.trim() !== '') as string[];
        const socialLinks: string[] = socialLinksFields.filter((link) => link.trim() !== '') as string[];
        // const certificates: ICertificate[] = certificateFields.map((certificate: ICertificate) => {
        //   certificate.year = certificate.year === 'Year' ? '' : (certificate.year as number);
        //   return certificate;
        // });
        const certificates: ICertificate[] = certificateFields.filter(
          (certificate: ICertificate) => certificate.name.trim() !== '' && certificate.from.trim() !== '' && certificate.year !== 'Year'
        );
        const sellerData: ISellerDocument = {
          email: authUser.email as string,
          fullName: personalInfo.fullName,
          profilePublicId: authUser.profilePublicId as string,
          profilePicture: authUser.profilePicture as string,
          description: personalInfo.description,
          country: personalInfo.country,
          oneliner: personalInfo.oneliner,
          skills,
          languages: languageFields,
          experience,
          education: educationFields,
          socialLinks,
          certificates,
          responseTime: parseInt(personalInfo.responseTime)
        };

        const updateBuyer: IBuyerDocument = {
          ...buyer,
          isSeller: true
        };

        const response: IResponse = await createSeller(sellerData).unwrap();
        dispatch(addSeller(response.seller));
        dispatch(addBuyer(updateBuyer));
        navigate(`/seller-profile/${lowerCase(authUser.username as string)}/${response.seller?._id as string}/edit`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      // delete the becomeASeller from local storage when the component unmounts
      deleteFromLocalStorage('becomeASeller');
    };
  }, []);

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
          {errors.length > 0 ? <div className="text-red-400">You have {errors.length} errors in your form. Please fix them.</div> : <></>}
          <PersonalInfo personalInfoErrors={personalInfoErrors} personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />
          <SellerExperience experienceErrors={experienceErrors} experienceFields={experience} setExperienceFields={setExperience} />
          <SellerEducation educationErrors={educationErrors} educationFields={educationFields} setEducationFields={setEducationFields} />
          <SellerSkill skillsErrors={skillsErrors} skillsFields={skillsFields} setSkillsFields={setSkillsFields} />
          <SellerLanguage languagesErrors={languageErrors} languageFields={languageFields} setLanguageFields={setLanguageFields} />
          <SellerCertificate certificatesFields={certificateFields} setCertificatesFields={setCertificateFields} />
          <SellerSocialLinks socialFields={socialLinksFields} setSocialFields={setSocialLinksFields} />
          <div className="flex justify-end p-6">
            <Button
              onClick={onCreateSeller}
              className="rounded bg-sky-500 px-8 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:py-3 md:text-base"
              label="Create Profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSeller;
