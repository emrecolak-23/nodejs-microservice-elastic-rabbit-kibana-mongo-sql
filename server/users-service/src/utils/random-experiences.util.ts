import { IExperience } from '@emrecolak-23/jobber-share';
import { faker } from '@faker-js/faker/.';

export function randomExperiences(count: number): IExperience[] {
  const result: IExperience[] = [];

  for (let i = 0; i < count; i++) {
    const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const randomEndYear = ['Present', '2024', '2025', '2026', '2027'];
    const endYear = randomEndYear[Math.floor(Math.random() * randomEndYear.length)];
    const startYear = randomStartYear[Math.floor(Math.random() * randomStartYear.length)];
    const experience = {
      company: faker.company.name(),
      title: faker.person.jobTitle(),
      startDate: `${faker.date.month()} ${startYear}`,
      endDate: endYear === 'Present' ? endYear : `${faker.date.month()} ${endYear}`,
      description: faker.commerce.productDescription().slice(0, 100),
      currentlyWorkingHere: endYear === 'Present' ? true : false
    };

    result.push(experience);
  }

  return result;
}
