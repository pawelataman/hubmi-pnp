import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { InnovationSummary } from '../../api/types';
import { cx } from '../../ui/cx';
import styles from './InnovationTile.module.css';
import { plural } from './plural';

interface InnovationTileProps {
  readonly innovation: InnovationSummary;
}

export function InnovationTile({
  innovation,
}: InnovationTileProps): ReactElement {
  const reviews: string = plural(innovation.reviewCount, [
    'opinia',
    'opinie',
    'opinii',
  ]);
  return (
    <li className={styles['tile']}>
      <span className={styles['category']}>
        {`${innovation.area} · ${innovation.kind}`}
      </span>
      <h2 className={styles['name']}>
        <Link to={`/innowacje/${innovation.id}`} className={styles['link']}>
          {innovation.name}
        </Link>
      </h2>
      <p className={styles['summary']}>{innovation.summary}</p>
      <div className={styles['tags']}>
        <span className={cx(styles['tag'], styles['verified'])}>
          {`✓ Zweryfikowano ${innovation.verified}`}
        </span>
        <span className={styles['tag']}>{innovation.cost}</span>
        {innovation.seeksTesters ? (
          <span className={cx(styles['tag'], styles['testers'])}>
            ◎ Szuka testerów
          </span>
        ) : null}
        {innovation.hasVideo ? (
          <span className={cx(styles['tag'], styles['video'])}>▶ Film</span>
        ) : null}
        <span className={styles['tag']}>
          {`★ ${innovation.rating} · ${String(innovation.reviewCount)} ${reviews}`}
        </span>
      </div>
    </li>
  );
}
