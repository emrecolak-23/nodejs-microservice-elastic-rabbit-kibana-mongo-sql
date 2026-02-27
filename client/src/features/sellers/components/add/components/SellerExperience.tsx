import { ChangeEvent, FC, ReactElement } from 'react';
import { IExperience, IExperienceProps } from 'src/features/sellers/interfaces/seller.interface';
import Button from 'src/shared/button/Button';
import Dropdown from 'src/shared/dropdown/Dropdown';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import TextInput from 'src/shared/inputs/TextInput';
import { yearsList } from 'src/shared/utils/utils.service';
import { v4 as uuidv4 } from 'uuid';

const SellerExperience: FC<IExperienceProps> = ({ experienceFields, setExperienceFields }): ReactElement => {
  const handleExperienceFieldChange = (event: ChangeEvent, index: number): void => {
    const target = event.target as HTMLInputElement;
    if (experienceFields && setExperienceFields) {
      const data: IExperience[] = [...experienceFields];
      if (target.name === 'currentlyWorkingHere') {
        data[index]['currentlyWorkingHere'] = target.checked;
        data[index]['endDate'] = target.checked ? '' : data[index]['endDate'];
        updatePresentEndDate(data, index);
      } else {
        data[index][target.name] = target.value;
      }

      setExperienceFields([...data]);
    }
  };

  const addExperienceFields = (): void => {
    const newField: IExperience = {
      title: '',
      company: '',
      startDate: 'Start Year',
      endDate: 'End Year',
      description: '',
      currentlyWorkingHere: false
    };

    if (setExperienceFields && experienceFields) {
      setExperienceFields([...experienceFields, newField]);
    }
  };

  const removeExperienceField = (index: number): void => {
    if (experienceFields && experienceFields.length > 1 && setExperienceFields) {
      const data: IExperience[] = [...experienceFields];
      data.splice(index, 1);
      setExperienceFields([...data]);
    }
  };

  const updatePresentEndDate = (data: IExperience[], index: number): void => {
    if (setExperienceFields) {
      if (!data[index]['currentlyWorkingHere']) {
        if (data[index]['endDate'] === 'Present') {
          data[index]['endDate'] = 'End Year';
          setExperienceFields([...data]);
        } else {
          data[index]['endDate'] = `${data[index]['endDate'] ?? 'End Year'}`;
          setExperienceFields([...data]);
        }
      } else {
        if (setExperienceFields && experienceFields) {
          data[index]['endDate'] = 'Present';
          setExperienceFields([...data]);
        }
      }
    }
  };

  return (
    <div className="border-grey flex w-full flex-col border-b px-6 pb-3 pt-6">
      <div className="flex justify-between">
        <h2 className="pb-4 text-xl font-bold">Experience</h2>
        <Button
          onClick={() => addExperienceFields()}
          className="md:text-md h-7 rounded bg-sky-500 px-6 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-8"
          label="Add More"
        />
      </div>

      {experienceFields?.map((input: IExperience, index: number) => {
        return (
          <div key={uuidv4()} className="mb-4">
            <TextInput
              className="border-grey mb-4 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
              name="title"
              value={input.title}
              placeholder="Title (E.g: CEO)"
              onChange={(event: ChangeEvent) => handleExperienceFieldChange(event, index)}
            />
            <TextInput
              className="border-grey mb-4 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
              placeholder="Company name"
              name="company"
              value={input.company}
              onChange={(event: ChangeEvent) => handleExperienceFieldChange(event, index)}
            />
            <div className="mb-16 grid h-1/5 grid-cols-2 gap-x-2 gap-y-3">
              <div className="relative">
                <Dropdown
                  onClick={(item: string) => {
                    const data: IExperience[] = [...experienceFields];

                    const endDate = data[index].endDate;
                    if (endDate < item) {
                      data[index].startDate = 'Start Year';
                    } else {
                      data[index].startDate = item;
                    }

                    if (setExperienceFields) {
                      setExperienceFields(data);
                    }
                  }}
                  text={input.startDate}
                  maxHeight="300"
                  mainClassNames="absolute bg-white"
                  values={yearsList(50)}
                />
              </div>
              <div
                style={{
                  cursor: `${input.currentlyWorkingHere ? 'none' : 'pointer'}`,
                  pointerEvents: `${input.currentlyWorkingHere ? 'none' : 'auto'}`
                }}
                className="relative"
              >
                <Dropdown
                  onClick={(item: string) => {
                    const data: IExperience[] = [...experienceFields];
                    data[index].endDate = item;
                    if (setExperienceFields) {
                      setExperienceFields(data);
                    }
                  }}
                  text={input.endDate}
                  maxHeight="300"
                  mainClassNames="absolute bg-white"
                  values={yearsList(50)}
                />
              </div>
            </div>
            <div className="mb-4 mt-2 flex items-center">
              <TextInput
                id="default-checkbox"
                type="checkbox"
                name="currentlyWorkingHere"
                value={`${input.currentlyWorkingHere}`}
                checked={input.currentlyWorkingHere}
                onChange={(event: ChangeEvent) => handleExperienceFieldChange(event, index)}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
              />
              <label htmlFor="default-checkbox" className="ml-2 text-sm font-normal">
                I am currently working here
              </label>
            </div>
            <div className="flex items-center">
              <TextAreaInput
                className="border-grey focus:border-grey block w-full rounded border p-2.5 text-sm text-gray-900 focus:ring-blue-500"
                name="description"
                value={input.description}
                rows={5}
                placeholder="Write description..."
                onChange={(event: ChangeEvent) => handleExperienceFieldChange(event, index)}
              />
            </div>
            <div className="mt-2">
              {experienceFields.length > 1 && index > 0 && (
                <Button
                  onClick={() => removeExperienceField(index)}
                  className="md:text-md h-7 rounded bg-red-500 px-6 text-center text-sm font-bold text-white hover:bg-red-400 focus:outline-none md:px-8"
                  label="Delete"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SellerExperience;
