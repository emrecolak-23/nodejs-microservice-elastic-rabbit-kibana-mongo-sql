import { faker } from '@faker-js/faker';

interface IExperience {
  company?: string;
  title?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string;
  currentlyWorkingHere?: boolean;
}

export function randomExperiences(count: number): IExperience[] {
  const result: IExperience[] = [];

  for (let i = 0; i < count; i++) {
    const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const randomEndYear = ['Present', '2024', '2025', '2026', '2027'];
    const endYear = randomEndYear[Math.floor(Math.random() * randomEndYear.length)];
    const startYear = randomStartYear[Math.floor(Math.random() * randomStartYear.length)];
    
    const isPresent = endYear === 'Present';
    const startDate = new Date(startYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const endDate = isPresent ? null : new Date(parseInt(endYear), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    const experience: IExperience = {
      company: faker.company.name(),
      title: faker.person.jobTitle(),
      startDate: startDate,
      endDate: endDate,
      description: faker.commerce.productDescription().slice(0, 100),
      currentlyWorkingHere: isPresent
    };

    result.push(experience);
  }

  return result;
}
