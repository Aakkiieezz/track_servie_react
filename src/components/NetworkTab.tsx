import React, { useState, useEffect } from "react";
import axiosInstance from '../utils/axiosInstance';

interface FollowUser {
  id: number;
  username: string;
  profileImgUrl: string;
}

interface NetworkTabProps {
  activeNetworkTab: "Following" | "Followers";
  setActiveNetworkTab: React.Dispatch<React.SetStateAction<"Following" | "Followers">>;
}

const NetworkTab: React.FC<NetworkTabProps> = ({ activeNetworkTab, setActiveNetworkTab }) => {
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FollowUser[]>([]);

  // Load following list
  useEffect(() => {
    if (activeNetworkTab === "Following")
        axiosInstance.get("follows/following", { params: { page: 0, size: 20 } })
          .then(res => setFollowing(res.data.content))
          .catch(() => setFollowing([]));
  }, [activeNetworkTab]);

  // Load followers list
  useEffect(() => {
    if (activeNetworkTab === "Followers")
        axiosInstance.get("follows/followers", { params: { page: 0, size: 20 } })
          .then(res => setFollowers(res.data.content))
          .catch(() => setFollowers([]));
  }, [activeNetworkTab]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 1)
        axiosInstance.get(`/user/search?username=${searchQuery}`)
          .then(res => setSearchResults(res.data))
          .catch(err => console.error("Error searching users:", err));
      else
        setSearchResults([]);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const renderUserList = (users: FollowUser[]) => (
    <div>
      {users.map(user => (
        <div
          key={user.id}
          className="d-flex align-items-center mb-3"
          style={{ gap: "10px", cursor: "pointer" }}
          onClick={() => window.location.href = `/profile/${user.username}`}
        >
          <img
            src={user.profileImgUrl}
            alt={user.username}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <span>{user.username}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Sub-tabs */}
      <div className="d-flex mb-3">
        <button
          className={`btn ${activeNetworkTab === "Following" ? "btn-primary" : "btn-outline-primary"} me-2`}
          onClick={() => setActiveNetworkTab("Following")}
        >
          Following
        </button>
        <button
          className={`btn ${activeNetworkTab === "Followers" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveNetworkTab("Followers")}
        >
          Followers
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="mt-2 border rounded p-2">
            {renderUserList(searchResults)}
          </div>
        )}
      </div>

      {/* Tab content */}
      {activeNetworkTab === "Following" && renderUserList(following)}
      {activeNetworkTab === "Followers" && renderUserList(followers)}
    </div>
  );
};

export default NetworkTab;
