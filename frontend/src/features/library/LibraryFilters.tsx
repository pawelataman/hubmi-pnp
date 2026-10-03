import {
  useId,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
} from 'react';

import type { CostBand, InnovationArea, InnovationKind } from '../../api/types';
import { ChoiceChip } from '../../ui/ChoiceChip';
import styles from './LibraryFilters.module.css';
import {
  AREA_OPTIONS,
  COST_OPTIONS,
  KIND_OPTIONS,
  toggleValue,
  type LibraryQuery,
  type Option,
} from './libraryQuery';

interface ChipGroupProps<T> {
  readonly title: string;
  readonly options: readonly Option<T>[];
  readonly selected: readonly T[];
  readonly labelFor?: (option: Option<T>) => string;
  readonly onToggle: (value: T) => void;
}

function ChipGroup<T>({
  title,
  options,
  selected,
  labelFor,
  onToggle,
}: ChipGroupProps<T>): ReactElement {
  const titleId: string = useId();
  return (
    <div role="group" aria-labelledby={titleId} className={styles['group']}>
      <span id={titleId} className={styles['groupTitle']}>
        {title}
      </span>
      {options.map((option: Option<T>): ReactElement => (
        <ChoiceChip
          key={option.slug}
          label={labelFor === undefined ? option.label : labelFor(option)}
          selected={selected.includes(option.value)}
          onToggle={(): void => {
            onToggle(option.value);
          }}
        />
      ))}
    </div>
  );
}

interface LibraryFiltersProps {
  readonly query: LibraryQuery;
  /** Null while the list is loading; the area chips then show no counts. */
  readonly areaCounts: Readonly<Record<InnovationArea, number>> | null;
  readonly onChange: (next: LibraryQuery) => void;
  /** Lets the screen move focus to the search field after "Wyczyść filtry". */
  readonly searchRef: RefObject<HTMLInputElement | null>;
}

export function LibraryFilters({
  query,
  areaCounts,
  onChange,
  searchRef,
}: LibraryFiltersProps): ReactElement {
  const searchId: string = useId();
  const featuresId: string = useId();

  return (
    <div className={styles['filters']}>
      <div className={styles['searchField']}>
        <label htmlFor={searchId} className={styles['searchLabel']}>
          Szukaj w bibliotece
        </label>
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          className={styles['search']}
          placeholder="Nazwa innowacji lub słowo z opisu"
          value={query.text}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            onChange({ ...query, text: event.target.value });
          }}
        />
      </div>
      <ChipGroup
        title="Obszar"
        options={AREA_OPTIONS}
        selected={query.areas}
        labelFor={(option: Option<InnovationArea>): string =>
          areaCounts === null
            ? option.label
            : `${option.label} · ${String(areaCounts[option.value])}`
        }
        onToggle={(value: InnovationArea): void => {
          onChange({ ...query, areas: toggleValue(query.areas, value) });
        }}
      />
      <div className={styles['row']}>
        <ChipGroup
          title="Typ"
          options={KIND_OPTIONS}
          selected={query.kinds}
          onToggle={(value: InnovationKind): void => {
            onChange({ ...query, kinds: toggleValue(query.kinds, value) });
          }}
        />
        <ChipGroup
          title="Koszt roczny"
          options={COST_OPTIONS}
          selected={query.costs}
          onToggle={(value: CostBand): void => {
            onChange({ ...query, costs: toggleValue(query.costs, value) });
          }}
        />
        <div
          role="group"
          aria-labelledby={featuresId}
          className={styles['group']}
        >
          <span id={featuresId} className={styles['groupTitle']}>
            Cechy
          </span>
          <ChoiceChip
            label="Szuka testerów"
            selected={query.seeksTesters}
            onToggle={(): void => {
              onChange({ ...query, seeksTesters: !query.seeksTesters });
            }}
          />
          <ChoiceChip
            label="Ma film"
            selected={query.hasVideo}
            onToggle={(): void => {
              onChange({ ...query, hasVideo: !query.hasVideo });
            }}
          />
        </div>
      </div>
    </div>
  );
}
