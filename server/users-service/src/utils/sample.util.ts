export function sample(array: any[], count: number): any {
  const result: any[] = [];
  for (let i = 0; i < count; i++) {
    result.push(array[Math.floor(Math.random() * array.length)]);
  }
  return result;
}
