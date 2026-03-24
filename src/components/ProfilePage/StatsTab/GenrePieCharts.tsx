import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./StatsTab.module.css";

interface GenreData {
  genreName: string;
  watchedFrequency: number;
  colorCode: string;
}

interface Props {
  userId: number;
  onFetchError: (error: string) => void;
}

const ProfileGenrePieCharts: React.FC<Props> = ({ userId, onFetchError }) => {
  const [dataMovies, setDataMovies] = useState<GenreData[] | null>(null);
  const [dataTVShows, setDataTVShows] = useState<GenreData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`stats/${userId}/servie-frequency`);
        setDataMovies(response.data.movies);
        setDataTVShows(response.data.tvShows);
      } catch (error) {
        onFetchError("Failed to fetch genre stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <p className={styles.loadingText}>Loading charts...</p>;
  if (!dataMovies || !dataTVShows) return null;

  return (
    <div className={styles.chartsRow}>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Movies by Genre</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dataMovies}
              dataKey="watchedFrequency"
              nameKey="genreName"
              cx="50%"
              cy="50%"
              outerRadius={90}        // smaller so labels have space
              label={({ genreName, watchedFrequency }) => `${genreName}: ${watchedFrequency}`}
            >
              {dataMovies.map((entry, index) => (
                <Cell key={`cell-movie-${index}`} fill={entry.colorCode} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>TV Shows by Genre</h3>
        <ResponsiveContainer>
          <PieChart width={340} height={340}>
            <Pie
              data={dataTVShows}
              dataKey="watchedFrequency"
              nameKey="genreName"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={(entry: GenreData) => `${entry.genreName}: ${entry.watchedFrequency}`}
            >
              {dataTVShows.map((entry, index) => (
                <Cell key={`cell-tv-${index}`} fill={entry.colorCode} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfileGenrePieCharts;