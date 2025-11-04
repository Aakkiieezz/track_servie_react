import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import ServieGrid from "../components/HomePage/ServieGrid";
import AppHeader from "@/components/AppHeader";

interface Servie {
  // Servie fields
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  posterPath: string;

  // Movie fields
  releaseDate?: string;

  // Series fields
  totalEpisodes?: number;
  firstAirDate?: string;
  lastAirDate?: string;

  // UserServieData fields
  episodesWatched?: number;
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
  const parsedListId = listId ? Number(listId) : null;

  const [list, setList] = useState<ListDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ListDto>(`list/${parsedListId}`);

      if (response.status === 200) {
        setList(response.data);
      }
    } catch (error) {
      console.error("Error fetching list", error);
      setAlert({ type: "danger", message: "Failed to fetch list !!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [listId]);

  return (
    <>
      <AppHeader />

      <div className="container mt-4">
        {alert && (
          <div className={`alert alert-${alert.type}`} role="alert">
            {alert.message}
          </div>
        )}

        {list ? (
          <>
            <h2>{list.name}</h2>
            {list.description && (
              <p className="text-muted mb-3">{list.description}</p>
            )}
            {loading ? <p>Loading...</p> : <ServieGrid servies={list.servies} />}
          </>
        ) : (
          !loading && <p>No list found.</p>
        )}
      </div>
    </>
  );
};

export default ListPage;