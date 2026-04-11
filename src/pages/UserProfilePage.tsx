import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/common/AppHeader/AppHeader";
import styles from "./UserProfilePage.module.css";
import { UserPlus, UserCheck, MapPin, Mail } from "lucide-react";
import { useAlert } from "../contexts/AlertContext";

import ProfileOverviewTab from "@/components/ProfilePage/OverviewTab/OverviewTab";
import ServiesTab from "@/components/ProfilePage/ServiesTab";
import ProfileListsTab from "@/components/ProfilePage/ListsTab/ListsTab";
import ProfileWatchlistTab from "@/components/ProfilePage/WatchlistTab";
import ProfileNetworkTab from "@/components/ProfilePage/NetworkTab/NetworkTab";
import ProfileStatsTab from "@/components/ProfilePage/StatsTab/StatsTab";
import MovieCollectionsTab from "@/components/ProfilePage/MovieCollectionsTab/MovieCollectionsTab";

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
	following: boolean;
	totalServies: number;
}

type TabType = "overview" | "servies" | "lists" | "watchlist" | "movie-collections" | "network" | "stats";

const tabs: TabType[] = [
	"overview",
	"servies",
	"lists",
	"watchlist",
	"movie-collections",
	"network",
	"stats",
];

const UserProfilePage: React.FC = () => {

	const { userId, tab } = useParams<{ userId: string; tab?: TabType }>();

	const profileUserId = Number(
		(userId === "me" || userId === undefined)
			? localStorage.getItem("userId")
			: userId
	);

	const loggedInUserId = Number(localStorage.getItem("userId"));
	const isOwnProfile = profileUserId === loggedInUserId;

	const { setAlert } = useAlert();

	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);

	const [activeTab, setActiveTab] = useState<TabType>(tab || "overview");
	const [tabLoading, setTabLoading] = useState(false);

	const [activeNetworkTab, setActiveNetworkTab] = useState<"Following" | "Followers">("Following");

	const [watchedCounts, setWatchedCounts] = useState<{ movie: number; tv: number }>({ movie: 0, tv: 0 });

	// -------------------------
	// Fetch Watched Counts
	// -------------------------
	const fetchWatchedCounts = async () => {
		try {
			const res = await axiosInstance.get(`user/${profileUserId}/watched-counts`);
			setWatchedCounts({ movie: res.data.movie, tv: res.data.tv });
		} catch (err) {
			console.error(err);
		}
	};

	// -------------------------
	// Fetch Profile
	// -------------------------
	const fetchUserProfile = async () => {
		if (!profileUserId) return;

		try {
			setLoading(true);
			const res = await axiosInstance.get<UserProfile>(`user/${profileUserId}/overview`);
			if (res.status === 200)
				setUser(res.data);
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to fetch user overview" });
		} finally {
			setLoading(false);
		}
	};

	// -------------------------
	// Fetch Tab Data
	// -------------------------
	const fetchTabData = async (tab: TabType) => {

		if (!profileUserId) return;

		try {
			setTabLoading(true);

			// No cases needed anymore
			// Each tab fetches its own data

		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: `Failed to fetch ${tab} data` });
		} finally {
			setTabLoading(false);
		}
	};

	// -------------------------
	// Effects
	// -------------------------
	useEffect(() => {
		fetchUserProfile();
		fetchWatchedCounts();
	}, [userId]);

	useEffect(() => {
		if (tab) setActiveTab(tab);
		else setActiveTab("overview");
	}, [tab]);

	useEffect(() => {
		fetchTabData(activeTab);
	}, [activeTab, userId]);

	// -------------------------
	// Follow Toggle
	// -------------------------
	const handleFollowToggle = async () => {
		if (!user) return;

		try {
			if (user.following) {
				await axiosInstance.delete(`follows/${user.id}`);
				setUser({ ...user, following: false, followerCount: user.followerCount - 1 });
			} else {
				await axiosInstance.post(`follows/${user.id}`);
				setUser({ ...user, following: true, followerCount: user.followerCount + 1 });
			}

			setAlert({ type: "success", message: user.following ? "Unfollowed successfully" : "Followed successfully" });
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to update follow status" });
		}
	};

	// -------------------------
	// Favorite handlers
	// -------------------------
	const handleAddFavorite = (index: number) => {
		console.log("to implement Add favorite", index);
	};

	const handleRemoveFavorite = async (tmdbId: number) => {
		try {
			await axiosInstance.delete(`user/${profileUserId}/servies/${tmdbId}/favorite`);
			setAlert({ type: "success", message: "Removed from favorites" });
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to remove favorite" });
		}
	};

	const handleFetchError = (error: string) => {
		setAlert({ type: "danger", message: error });
	};

	// -------------------------
	// Loading
	// -------------------------
	if (loading) {
		return (
			<>
				<AppHeader />
				<div className={styles.container}>
					<p>Loading...</p>
				</div>
			</>
		);
	}

	if (!user) {
		return (
			<>
				<AppHeader />
				<div className={styles.container}>
					<p>User not found</p>
				</div>
			</>
		);
	}

	return (
		<>
			<AppHeader />

			<div className={styles.pageContainer}>
				<div className={styles.container}>

					<div className={styles.topSection}>
						{/* Profile Header - Full (overview only) */}
						{activeTab === "overview" && (
							<div className={`${styles.headerSection} ${activeTab !== "overview" ? styles.headerCollapsed : ""}`}>
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
										<h1 className={styles.username}>
											{user.username}
										</h1>

										<div className={styles.statsRow}>
											<div className={styles.stat}>
												<span className={styles.statValue}>
													{user.totalServies}
												</span>
												<span className={styles.statLabel}>
													Servies
												</span>
											</div>

											<div className={styles.stat}>
												<span className={styles.statValue}>
													{user.followerCount}
												</span>
												<span className={styles.statLabel}>
													Followers
												</span>
											</div>

											<div className={styles.stat}>
												<span className={styles.statValue}>
													{user.followingCount}
												</span>
												<span className={styles.statLabel}>
													Following
												</span>
											</div>
										</div>

										{!isOwnProfile && (
											<button
												className={`${styles.followBtn} ${user.following ? styles.followingBtn : ""}`}
												onClick={handleFollowToggle}
											>
												{user.following ? (
													<>
														<UserCheck size={18} />
														Following
													</>
												) : (
													<>
														<UserPlus size={18} />
														Follow
													</>
												)}
											</button>
										)
										}
									</div>

									<div className={styles.profileDetails}>
										{user.bio && (
											<p className={styles.bio}>{user.bio}</p>
										)}

										<div className={styles.detailsRow}>
											{user.country && (
												<div className={styles.detail}>
													<MapPin size={16} />
													{user.country}
												</div>
											)}

											{user.email && (
												<div className={styles.detail}>
													<Mail size={16} />
													{user.email}
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Tabs - with collapsed mini-header when not on overview */}
						<div className={`${styles.tabsContainer} ${activeTab !== "overview" ? styles.tabsSticky : ""}`}>
							<div className={styles.tabsRow}>

								{/* Left — mini profile (animates in) */}
								<div className={`${styles.miniHeader} ${activeTab !== "overview" ? styles.miniHeaderVisible : ""}`}>
									<img
										src={user.profileImgUrl}
										alt={user.username}
										className={styles.miniAvatar}
										onError={(e) => {
											(e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
										}}
									/>
									<span className={styles.miniUsername}>{user.username}</span>
								</div>

								{/* Center — tabs */}
								<div className={styles.tabs}>
									{tabs.map((tab) => (
										<button
											key={tab}
											className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
											onClick={() => setActiveTab(tab)}
										>
											{tab.charAt(0).toUpperCase() + tab.slice(1)}
										</button>
									))}
								</div>

								{/* Right — spacer to keep tabs centered */}
								<div className={`${styles.miniHeaderSpacer} ${activeTab !== "overview" ? styles.miniHeaderVisible : ""}`} />

							</div>
						</div>
					</div>


					{/* Tab Content */}
					<div className={`${styles.tabContent} ${activeTab !== "overview" ? styles.tabContentOffset : ""}`}>

						{tabLoading && <p>Loading...</p>}

						{!tabLoading && activeTab === "overview" && (
							<ProfileOverviewTab
								userId={profileUserId}
								watchedCounts={watchedCounts}
								onAdd={handleAddFavorite}
								onRemove={handleRemoveFavorite}
								onFetchError={handleFetchError}
							/>
						)}

						{!tabLoading && activeTab === "servies" && (
							<ServiesTab
								userId={profileUserId}
								watchedCounts={watchedCounts}
							/>
						)}

						{!tabLoading && activeTab === "lists" && (
							<ProfileListsTab
								userId={profileUserId}
								isOwnProfile={isOwnProfile}
							/>
						)}

						{!tabLoading && activeTab === "watchlist" && (
							<ProfileWatchlistTab userId={profileUserId} />
						)}

						{!tabLoading && activeTab === "movie-collections" && (
							<MovieCollectionsTab userId={profileUserId} />
						)}

						{!tabLoading && activeTab === "network" && (
							<ProfileNetworkTab
								activeNetworkTab={activeNetworkTab}
								setActiveNetworkTab={setActiveNetworkTab}
								userId={profileUserId}
							/>
						)}

						{!tabLoading && activeTab === "stats" && (
							<ProfileStatsTab userId={profileUserId} onFetchError={handleFetchError} />
						)}

					</div>
				</div>
			</div>
		</>
	);
};

export default UserProfilePage;