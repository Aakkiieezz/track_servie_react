import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import ServieGrid from "@/components/common/ServieGrid/ServieGrid";
import PaginationBar from "@/components/common/PaginationBar/PaginationBar";
import type { Servie } from "@/types/servie";

interface Pagination {
  pageNumber: number;
  totalPages: number;
}

interface Props {
  userId: number;
}

const ProfileWatchlistTab: React.FC<Props> = ({ userId }) => {

  const [servies, setServies] = useState<Servie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [pagination, setPagination] = useState<Pagination>({
    pageNumber: 0,
    totalPages: 0,
  });

  const fetchServies = async (pageNumber: number = 0) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`list/${userId}/watchlist`, {
        params: {
          pageNumber,
          sortBy: "title",
          sortDir: "asc",
        },
      });

      setServies(response.data.servies);

      setPagination({
        pageNumber: response.data.pageNumber,
        totalPages: response.data.totalPages,
      });

    } catch (error) {
      console.error("Error fetching watchlist", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPgNumber: number) => {
    fetchServies(newPgNumber);
  };

  useEffect(() => {
    fetchServies();
  }, []);

  return (
    <div>

      <h2 style={{
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "20px"
      }}>
        Watchlist
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ServieGrid servies={servies} />
      )}

      <PaginationBar
        pageNumber={pagination.pageNumber}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

    </div>
  );
};

export default ProfileWatchlistTab;