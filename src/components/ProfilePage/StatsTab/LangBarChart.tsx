import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./StatsTab.module.css";

interface LangData {
  name: string;
  TVShows?: number;
  Movies?: number;
}

interface Props {
  userId: number;
  onFetchError: (error: string) => void;
}

const ProfileLangBarChart: React.FC<Props> = ({ userId, onFetchError }) => {
  const [mergedData, setMergedData] = useState<LangData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(`stats/${userId}/language-frequency`);
        const { tvShows, movies } = response.data;

        const merged = tvShows
          .map((tv: { name: string; value: number }) => {
            const movie = movies.find((m: { name: string }) => m.name === tv.name);
            if (tv.value > 0 || (movie && movie.value > 0)) {
              return {
                name: tv.name,
                TVShows: tv.value > 0 ? tv.value : undefined,
                Movies: movie && movie.value > 0 ? movie.value : undefined,
              };
            }
            return null;
          })
          .filter(Boolean);

        setMergedData(merged);
      } catch (error) {
        onFetchError("Failed to fetch language stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <p className={styles.loadingText}>Loading chart...</p>;

  return (
    <div className={styles.chartCard} style={{ width: "100%" }}>
      <h3 className={styles.chartTitle}>Movies & TV Shows by Language</h3>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-tertiary)" />
          <YAxis
            scale="log"
            domain={[0.5, "auto"]}
            tickFormatter={(tick) => (tick === 0.5 ? "0" : tick)}
            stroke="var(--text-tertiary)"
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "var(--text-primary)",
            }}
          />
          <Legend />
          <Bar dataKey="TVShows" fill="#8884d8" name="TV Shows" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Movies" fill="#82ca9d" name="Movies" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfileLangBarChart;