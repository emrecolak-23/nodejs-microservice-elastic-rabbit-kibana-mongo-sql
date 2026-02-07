import { IEducation } from '@emrecolak-23/jobber-share';
import { faker } from '@faker-js/faker';

export function randomEducation(count: number): IEducation[] {
  const result: IEducation[] = [];

  for (let i = 0; i < count; i++) {
    const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const startYear = randomStartYear[Math.floor(Math.random() * randomStartYear.length)];
    const education = {
      country: faker.location.country(),
      university: faker.person.jobTitle(),
      title: faker.person.jobTitle(),
      major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()}`,
      year: `${startYear} - ${startYear + 4}`
    };

    result.push(education);
  }

  return result;
}
