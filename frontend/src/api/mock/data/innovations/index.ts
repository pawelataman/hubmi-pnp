import type { Innovation } from '../../../types';
import {
  asystentNaGodziny,
  mapaBarier,
  pracaNaProbe,
} from './niepelnosprawnosc';
import { kragOpiekunow, wytchnieniowaSobota } from './rodzina';
import {
  cyfrowyWnuk,
  mobilnaKawiarenka,
  telefonyZyczliwosci,
} from './seniorzy';
import { lawkaDialogu, sasiedzkaWypozyczalnia } from './spolecznosc';
import { pierwszaRozmowa, termometrNastroju } from './zdrowie-psychiczne';

const records: readonly Innovation[] = [
  telefonyZyczliwosci,
  mobilnaKawiarenka,
  cyfrowyWnuk,
  asystentNaGodziny,
  mapaBarier,
  pracaNaProbe,
  wytchnieniowaSobota,
  kragOpiekunow,
  pierwszaRozmowa,
  termometrNastroju,
  sasiedzkaWypozyczalnia,
  lawkaDialogu,
];

export const innovations: Readonly<Record<string, Innovation>> =
  Object.fromEntries(
    records.map((item: Innovation): [string, Innovation] => [item.id, item]),
  );
