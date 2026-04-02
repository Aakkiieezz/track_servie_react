import { Link } from "react-router-dom";
import styles from "./SectionRow.module.css";

interface SectionRowProps {
  title:       string;
  meta?:       string;       // e.g. "Updated daily"
  seeAllPath?: string;       // omit to hide the link
  children:    React.ReactNode;
}

export default function SectionRow({
  title,
  meta,
  seeAllPath,
  children,
}: SectionRowProps)
{
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>{title}</h2>
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
        {seeAllPath && (
          <Link to={seeAllPath} className={styles.seeAll}>
            See all →
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {children}
      </div>
    </section>
  );
}