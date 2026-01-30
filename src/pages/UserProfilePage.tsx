import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import styles from "./UserProfilePage.module.css";
import { UserPlus, UserCheck, MapPin, Mail, Check, Edit } from "lucide-react";
import FavoritesManager from "@/components/FavouritesManager";
import type { Servie } from "@/types/servie";
import { useAlert } from "../contexts/AlertContext";

interface UserProfile {
  id: number;
  username: string;
  profileImgUrl?: string;
  bio: string;
  email: string;
  emailVerified: boolean;
  country: string;
  followerCount: number;
  followingCount: number;
  following: boolean; // check to see if you following this user
  totalServies: number;
}

interface List {
  id: number;
  name: string;
  description?: string;
  totalServiesCount: number;
}

type TabType = "profile" | "servies" | "lists" | "watchlist" | "network";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [servies, setServies] = useState<Servie[]>([]);
  const [favoriteServies, setFavoriteServies] = useState<Servie[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [watchlist, setWatchlist] = useState<Servie[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const [isEditingFavorites, setIsEditingFavorites] = useState(false);

  const fetchUserProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get<UserProfile>(`user/${id}/profile`);
      console.log(res);
      if (res.status === 200) {
        setUser(res.data);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch user profile" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab: TabType) => {
    if (!id) return;
    try {
      setTabLoading(true);
      switch (tab) {
        // case "profile":
        //   const favoriteRes = await axiosInstance.get<Servie[]>(`user/${id}/servies/favorite?limit=5`);
        //   if (favoriteRes.status === 200) {
        //     setFavoriteServies(favoriteRes.data);
        //   }
        //   break;
        case "servies":
          const serviesRes = await axiosInstance.get<Servie[]>(`user/${id}/servies`);
          if (serviesRes.status === 200) {
            setServies(serviesRes.data);
          }
          break;
        case "lists":
          const listsRes = await axiosInstance.get<List[]>(`user/${id}/lists`);
          if (listsRes.status === 200) {
            setLists(listsRes.data);
          }
          break;
        case "watchlist":
          const watchlistRes = await axiosInstance.get<Servie[]>(`list/watchlist`);
          if (watchlistRes.status === 200) {
            setWatchlist(watchlistRes.data);
          }
          break;
        case "network":
          const followingRes = await axiosInstance.get<UserProfile[]>(`user/${id}/following`);
          const followersRes = await axiosInstance.get<UserProfile[]>(`user/${id}/followers`);
          if (followingRes.status === 200) setFollowing(followingRes.data);
          if (followersRes.status === 200) setFollowers(followersRes.data);
          break;
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: `Failed to fetch ${tab} data` });
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, userId]);

  const handleFollowToggle = async () => {
    if (!user) return;
    try {
      if (user.following)
        await axiosInstance.delete(`follows/${user.id}`);
      else
        await axiosInstance.post(`follows/${user.id}`);
      setUser({ ...user, following: !user.following });
      setAlert({ 
        type: "success", 
        message: user.following ? "Unfollowed successfully" : "Followed successfully" 
      });
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to update follow status" });
    }
  };

  // Handler to add a favorite
  const handleAddFavorite = async (index: number) => {
    // You would typically open a modal or navigate to a search page
    // For now, let's just log it
    console.log(`Add favorite at position ${index}`);
    
    // Example: You might want to navigate to a search/selection page
    // navigate('/select-favorite', { state: { userId: id, position: index } });
    
    // Or open a modal with a search interface
    // setShowSearchModal(true);
  };

  // Handler to remove a favorite
  const handleRemoveFavorite = async (tmdbId: number) => {
    if (!id) return;
    try {
      // Call your API to remove from favorites
      await axiosInstance.delete(`user/${id}/servies/${tmdbId}/favorite`);
      
      // Update the local state
      setFavoriteServies(favoriteServies.filter(s => s.tmdbId !== tmdbId));
      
      setAlert({ 
        type: "success", 
        message: "Removed from favorites" 
      });
    } catch (err) {
      console.error(err);
      setAlert({ 
        type: "danger", 
        message: "Failed to remove from favorites" 
      });
    }
  };

  const handleFetchError = (error: string) => {
    setAlert({ type: "danger", message: error });
  };

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className={styles.container}><p>Loading...</p></div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AppHeader />
        <div className={styles.container}><p>User not found</p></div>
      </>
    );
  }

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <img
                  src={user.profileImgUrl}
                  alt={user.username}
                  className={styles.userAvatar}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
                  }}
                />
              </div>

              <div className={styles.profileInfo}>
                <h1 className={styles.username}>{user.username}</h1>
                
                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{user.totalServies}</span>
                    <span className={styles.statLabel}>Servies</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{user.followerCount}</span>
                    <span className={styles.statLabel}>Followers</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{user.followingCount}</span>
                    <span className={styles.statLabel}>Following</span>
                  </div>
                </div>
                
                <button 
                  className={`${styles.followBtn} ${user.following ? styles.followingBtn : ''}`}
                  onClick={handleFollowToggle}
                >
                  {user.following ? (
                    <>
                      <UserCheck size={18} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>

              <div className={styles.profileDetails}>
                {user.bio && (
                  <p className={styles.bio}>{user.bio}</p>
                )}
                <div className={styles.detailsRow}>
                  {user.country && (
                    <div className={styles.detail}>
                      <MapPin size={16} />
                      <span>{user.country}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className={styles.detail}>
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {(['profile', 'servies', 'lists', 'watchlist', 'network'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className={styles.tabContent}>
            {tabLoading ? (
              <p>Loading...</p>
            ) : activeTab === "profile" ? (
              <div className={styles.profileTab}>
              <h2 className={styles.sectionTitle}>Favorite Servies</h2>
              
              <FavoritesManager
                userId={id}
                onAdd={handleAddFavorite}
                onRemove={handleRemoveFavorite}
                onFetchError={handleFetchError}
                isEditable={isEditingFavorites}
              />
            </div>
            ) : activeTab === "servies" ? (
              <div className={styles.serviesTab}>
                <h2 className={styles.sectionTitle}>All Servies ({servies.length})</h2>
                <ServieGrid servies={servies} />
              </div>
            ) : activeTab === "lists" ? (
              <div className={styles.listsTab}>
                <h2 className={styles.sectionTitle}>Lists ({lists.length})</h2>
                <div className={styles.listGrid}>
                  {lists.length === 0 ? (
                    <p>No lists created yet</p>
                  ) : (
                    lists.map((list) => (
                      <div 
                        key={list.id} 
                        className={styles.listCard}
                        onClick={() => navigate(`/list/${list.id}`)}
                      >
                        <h3>{list.name}</h3>
                        <p className={styles.listDescription}>{list.description}</p>
                        <span className={styles.listCount}>{list.totalServiesCount} servies</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeTab === "watchlist" ? (
              <div className={styles.watchlistTab}>
                <h2 className={styles.sectionTitle}>Watchlist ({watchlist.length})</h2>
                <ServieGrid servies={watchlist} />
              </div>
            ) : (
              <div className={styles.networkTab}>
                <div className={styles.networkSection}>
                  <h2 className={styles.sectionTitle}>Following ({following.length})</h2>
                  <div className={styles.userGrid}>
                    {following.map((f) => (
                      <div 
                        key={f.id} 
                        className={styles.userCard}
                        onClick={() => navigate(`/profile/${f.id}`)}
                      >
                        <div className={styles.userCardPlaceholder}>{f.username.charAt(0).toUpperCase()}</div>
                        <h4>{f.username}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.networkSection}>
                  <h2 className={styles.sectionTitle}>Followers ({followers.length})</h2>
                  <div className={styles.userGrid}>
                    {followers.map((f) => (
                      <div 
                        key={f.id} 
                        className={styles.userCard}
                        onClick={() => navigate(`/profile/${f.id}`)}
                      >
                        <div className={styles.userCardPlaceholder}>{f.username.charAt(0).toUpperCase()}</div>
                        <h4>{f.username}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;