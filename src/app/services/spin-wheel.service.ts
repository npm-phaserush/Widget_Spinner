import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http'; // uncomment when real backend is ready

export interface SlicePrize {
  title: string;
  image?: string;
}

export interface WheelConfig {
  variant: 'minor' | 'major' | 'grand';
  jackpotAmount: string;
  slices: SlicePrize[];
}

// ─────────────────────────────────────────────
// DUMMY DATA — replace with real API calls later
// ─────────────────────────────────────────────
const WHEEL_DATA: Record<'minor' | 'major' | 'grand', WheelConfig> = {
  minor: {
    variant: 'minor',
    jackpotAmount: '₱98,765,432',
    slices: [
      { title: '500<br>CHIPS',   image: 'assets/images/chips-red.png' },
      { title: 'FREE<br>SPIN' },
      { title: '100<br>CHIPS',   image: 'assets/images/chips-yellow.png' },
      { title: 'FREEBIE' },
      { title: '200<br>CHIPS',   image: 'assets/images/chips-yellow.png' },
      { title: '500<br>CHIPS',   image: 'assets/images/chips-red.png' },
      { title: '50<br>CHIPS',    image: 'assets/images/chips-yellow.png' },
      { title: 'BONUS' },
    ],
  },

  major: {
    variant: 'major',
    jackpotAmount: '₱198,765,432',
    slices: [
      { title: '5,000<br>CHIPS',  image: 'assets/images/chips-red.png' },
      { title: 'FREE<br>SPIN' },
      { title: '2,000<br>CHIPS',  image: 'assets/images/chips-red.png' },
      { title: '1,000<br>CHIPS',  image: 'assets/images/chips-yellow.png' },
      { title: '3,000<br>CHIPS',  image: 'assets/images/chips-red.png' },
      { title: 'FREE<br>SPIN' },
      { title: '500<br>CHIPS',    image: 'assets/images/chips-yellow.png' },
      { title: 'JACKPOT' },
    ],
  },

  grand: {
    variant: 'grand',
    jackpotAmount: '₱298,765,432',
    slices: [
      { title: 'NMAX',              image: 'assets/images/nmax.png' },
      { title: '50,000<br>CHIPS',   image: 'assets/images/chips-red.png' },
      { title: 'FREE<br>SPIN' },
      { title: 'MYSTERY<br>BOX' },
      { title: '20,000<br>CHIPS',   image: 'assets/images/chips-red.png' },
      { title: 'GRAND<br>JACKPOT' },
      { title: '10,000<br>CHIPS',   image: 'assets/images/chips-yellow.png' },
      { title: 'iPHONE<br>16' },
    ],
  },
};

@Injectable({ providedIn: 'root' })
export class SpinWheelService {
  // private http = inject(HttpClient); // uncomment when real backend is ready

  /**
   * Returns the wheel configuration for the given variant.
   *
   * DUMMY MODE: returns static data synchronously via `of()`.
   *
   * TO SWITCH TO A REAL BACKEND:
   *   1. Uncomment `HttpClient` above and `provideHttpClient()` in app.config.ts
   *   2. Replace the return statement below with:
   *        return this.http.get<WheelConfig>(`/api/wheel/${variant}`);
   */
  getWheelConfig(variant: 'minor' | 'major' | 'grand'): Observable<WheelConfig> {
    return of(WHEEL_DATA[variant]);
  }
}
