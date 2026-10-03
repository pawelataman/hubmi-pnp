import type { DistrictTile, Trends } from '../../types';

function tile(
  name: string,
  abbr: string,
  row: number,
  col: number,
  value: number,
): DistrictTile {
  return { name, abbr, row, col, value };
}

export const exampleTrends: Trends = {
  months: ['IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
  areas: [
    { area: 'Samotność', values: [18, 21, 22, 26, 29, 34] },
    { area: 'Zdrowie psychiczne', values: [14, 15, 19, 18, 22, 25] },
    { area: 'Wykluczenie cyfrowe', values: [16, 14, 15, 12, 13, 11] },
    { area: 'Dostęp do usług', values: [9, 11, 10, 13, 12, 15] },
    { area: 'Opiekunowie', values: [5, 6, 8, 9, 11, 14] },
  ],
  districts: [
    tile('olkuski', 'OLK', 1, 3, 6),
    tile('miechowski', 'MIE', 1, 4, 8),
    tile('chrzanowski', 'CHR', 2, 1, 9),
    tile('krakowski', 'KRK', 2, 2, 24),
    tile('Kraków', 'KR', 2, 3, 38),
    tile('proszowicki', 'PRO', 2, 4, 5),
    tile('dąbrowski', 'DĄB', 2, 5, 7),
    tile('oświęcimski', 'OŚW', 3, 1, 14),
    tile('wadowicki', 'WAD', 3, 2, 12),
    tile('wielicki', 'WIE', 3, 3, 11),
    tile('bocheński', 'BOC', 3, 4, 10),
    tile('brzeski', 'BRZ', 3, 5, 9),
    tile('tarnowski', 'TAR', 3, 6, 27),
    tile('Tarnów', 'TA', 3, 7, 16),
    tile('suski', 'SUS', 4, 2, 8),
    tile('myślenicki', 'MYŚ', 4, 3, 13),
    tile('limanowski', 'LIM', 4, 4, 21),
    tile('nowosądecki', 'NSĄ', 4, 5, 22),
    tile('gorlicki', 'GOR', 4, 6, 18),
    tile('tatrzański', 'TAT', 5, 3, 6),
    tile('nowotarski', 'NTA', 5, 4, 17),
    tile('Nowy Sącz', 'NS', 5, 5, 12),
  ],
  gaps: [
    {
      title:
        'Opieka wytchnieniowa dla rodziców dzieci z niepełnosprawnością na wsi',
      count: 9,
      districts: 5,
      last: '02.10',
    },
    {
      title:
        'Wsparcie psychiczne dla nastolatków przy długich kolejkach do specjalistów',
      count: 7,
      districts: 4,
      last: '25.09',
    },
    {
      title: 'Dowóz seniorów do lekarza w gminach bez komunikacji publicznej',
      count: 6,
      districts: 3,
      last: '30.09',
    },
  ],
};
