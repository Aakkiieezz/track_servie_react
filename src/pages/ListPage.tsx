import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import styles from "./ListPage.module.css";
import PosterFanStack from "@/components/PosterFanStack";

interface Servie {
  // Servie fields
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;

  // Movie fields
  releaseDate?: string;

  // Series fields
  totalEpisodes: number | null;
  firstAirDate?: string;
  lastAirDate?: string;

  // UserServieData fields
  episodesWatched: number;
  completed: boolean;
  liked: boolean;
}

interface ListDto {
  id: number;
  name: string;
  description?: string;
  servies: Servie[];
}

const ListPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const id = listId ? Number(listId) : null;

  const [list, setList] = useState<ListDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const fetchList = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get<ListDto>(`list/${id}`);
      if (res.status === 200) {
        setList(res.data);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch list" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  if (loading) return (
    <>
      <AppHeader />
      <div className={styles.container}><p>Loading...</p></div>
    </>
  );

  if (!list) return (
    <>
      <AppHeader />
      <div className={styles.container}><p>No list found.</p></div>
    </>
  );

  // prepare posters for hero (first up to 5 posters)
  const heroPosters = (list.servies || []).slice(0, 5).map(s => s.posterPath).filter(Boolean);

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* Hero row */}
          <div className={styles.heroRow}>
            <div className={styles.posterHero}>
              <PosterFanStack posters={heroPosters} height={240} onClick={() => { /* optional */ }} />
            </div>

            <div className={styles.infoSection}>
              <h1 className={styles.listTitle}>{list.name}</h1>
              <div className={styles.metaRow}>
                <span className={styles.countBadge}>{(list.servies || []).length} servies</span>
              </div>

              {list.description && <p className={styles.description}>{list.description}</p>}
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Grid of servies */}
          <div className={styles.serviesGrid}>
            <ServieGrid servies={list.servies || []} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListPage;
