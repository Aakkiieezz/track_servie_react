import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import styles from "./StatsTab.module.css";

interface FreqData {
  key: string;
  value: number;
}

interface Props {
  userId: number;
  onFetchError: (error: string) => void;
}

const GenreBarCharts: React.FC<Props> = ({ userId, onFetchError }) => {
  const [dataMovies, setDataMovies] = useState<FreqData[] | null>(null);
  const [dataTVShows, setDataTVShows] = useState<FreqData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`stats/${userId}/lang-freq`);
        // Sort by value highest to lowest
        const sortedMovies = response.data.movies.sort(
          (a: FreqData, b: FreqData) => b.value - a.value
        );
        const sortedTVShows = response.data.tvShows.sort(
          (a: FreqData, b: FreqData) => b.value - a.value
        );
        setDataMovies(sortedMovies);
        setDataTVShows(sortedTVShows);
      } catch (error) {
        onFetchError("Failed to fetch language freq stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const BAR_PADDING = 8;
    const LABEL_WIDTH = 30;

    // If bar is wide enough, place label inside at the end
    if (width > LABEL_WIDTH + BAR_PADDING) {
      return (
        <text
          x={x + width - BAR_PADDING}
          y={y + height / 2}
          fill="var(--text-primary)"
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight="500"
        >
          {value}
        </text>
      );
    }

    // Otherwise, place label outside (to the right)
    return (
      <text
        x={x + width + BAR_PADDING}
        y={y + height / 2}
        fill="var(--text-primary)"
        textAnchor="start"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="500"
      >
        {value}
      </text>
    );
  };

  if (loading) return <p className={styles.loadingText}>Loading charts...</p>;
  if (!dataMovies || !dataTVShows) return null;

  return (
    <div className={styles.chartsRow}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Movies by Language</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dataMovies}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 150, bottom: 5 }}
            style={{ pointerEvents: 'none' }}
          >
            <XAxis type="number" hide={true} />
            <YAxis dataKey="key" type="category" width={140} tick={{ fontSize: 12 }} interval={0} axisLine={false} tickFormatter={(value) => value} />
            <Bar
              dataKey="value"
              fill="rgba(255, 255, 255, 0.2)"
              radius={[0, 8, 8, 0]}
              label={renderCustomLabel}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>TV Shows by Language</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={dataTVShows}
            layout="vertical"
            margin={{ top: 5, right: 50, left: 150, bottom: 5 }}
            style={{ pointerEvents: 'none' }}
          >
            <XAxis type="number" hide={true} />
            <YAxis dataKey="key" type="category" width={140} tick={{ fontSize: 12 }} interval={0} axisLine={false} tickFormatter={(value) => value} />
            <Bar
              dataKey="value"
              fill="rgba(255, 255, 255, 0.2)"
              radius={[0, 8, 8, 0]}
              label={renderCustomLabel}
              isAnimationActive={true}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GenreBarCharts;