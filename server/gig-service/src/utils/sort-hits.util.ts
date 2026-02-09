import { ISellerGig } from '@emrecolak-23/jobber-share';

export function sortHits(hits: ISellerGig[]): ISellerGig[] {
  return [...hits].sort((a, b) => {
    return a.sortId! - b.sortId!;
  });
}
