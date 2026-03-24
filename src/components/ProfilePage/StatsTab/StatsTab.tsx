import React from "react";
import styles from "./StatsTab.module.css";
import ProfileGenrePieCharts from "./GenrePieCharts";
import ProfileLangBarChart from "./LangBarChart";

interface Props {
  userId: number;
  onFetchError: (error: string) => void;
}

const ProfileStatsTab: React.FC<Props> = ({ userId, onFetchError }) => {
  return (
    <div className={styles.statsTab}>
      <div className={styles.row}>
        <ProfileGenrePieCharts userId={userId} onFetchError={onFetchError} />
      </div>
      <div className={styles.row}>
        <ProfileLangBarChart userId={userId} onFetchError={onFetchError} />
      </div>
    </div>
  );
};

export default ProfileStatsTab;