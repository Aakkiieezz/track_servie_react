import React, { useState, useEffect } from "react";
import axiosInstance from '../../../utils/axiosInstance';
import styles from './NetworkTab.module.css';

interface FollowUser {
	id: number;
	username: string;
	profileImgUrl: string;
}

interface NetworkTabProps {
	activeNetworkTab: "Following" | "Followers";
	setActiveNetworkTab: React.Dispatch<React.SetStateAction<"Following" | "Followers">>;
	userId: number;
}

const ProfileNetworkTab: React.FC<NetworkTabProps> = ({ activeNetworkTab, setActiveNetworkTab, userId }) => {
	const [following, setFollowing] = useState<FollowUser[]>([]);
	const [followers, setFollowers] = useState<FollowUser[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<FollowUser[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Load following list
	useEffect(() => {
		if (activeNetworkTab === "Following")
			axiosInstance.get(`follows/${userId}/following`, { params: { page: 0, size: 20 } })
				.then(res => setFollowing(res.data.content))
				.catch(() => setFollowing([]));
	}, [activeNetworkTab]);

	// Load followers list
	useEffect(() => {
		if (activeNetworkTab === "Followers")
			axiosInstance.get(`follows/${userId}/followers`, { params: { page: 0, size: 20 } })
				.then(res => setFollowers(res.data.content))
				.catch(() => setFollowers([]));
	}, [activeNetworkTab]);

	// Debounced search
	useEffect(() => {
		const delayDebounce = setTimeout(() => {
			if (searchQuery.trim().length > 1) {
				setIsSearching(true);
				axiosInstance.get(`/user/search?username=${searchQuery}`)
					.then(res => {
						setSearchResults(res.data);
						setIsSearching(false);
					})
					.catch(err => {
						console.error("Error searching users:", err);
						setIsSearching(false);
					});
			} else {
				setSearchResults([]);
				setIsSearching(false);
			}
		}, 500);

		return () => clearTimeout(delayDebounce);
	}, [searchQuery]);

	const renderUserList = (users: FollowUser[], emptyMessage: string) => {
		if (users.length === 0) return (
			<div className={styles.emptyState}>
				<i className="bi bi-people"></i>
				<p>{emptyMessage}</p>
			</div>
		);

		return (
			<div className={styles.userList}>
				{users.map(user => (
					<div
						key={user.id}
						className={styles.userCard}
						onClick={() => window.location.href = `/profile/${user.id}`}
					>
						<img
							src={user.profileImgUrl}
							alt={user.username}
							className={styles.userAvatar}
							onError={(e) => {
								(e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
							}}
						/>
						<div className={styles.userInfo}>
							<span className={styles.userName}>{user.username}</span>
						</div>
						<i className="bi bi-chevron-right"></i>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className={styles.networkTab}>
			{/* Sub-tabs */}
			<div className={styles.subTabs}>
				<button
					className={`${styles.subTabButton} ${activeNetworkTab === "Following" ? styles.active : ""}`}
					onClick={() => setActiveNetworkTab("Following")}
				>
					<i className="bi bi-person-check"></i>
					Following ({following.length})
				</button>
				<button
					className={`${styles.subTabButton} ${activeNetworkTab === "Followers" ? styles.active : ""}`}
					onClick={() => setActiveNetworkTab("Followers")}
				>
					<i className="bi bi-people"></i>
					Followers ({followers.length})
				</button>
			</div>

			{/* Search bar */}
			<div className={styles.searchContainer}>
				<div className={styles.searchInputWrapper}>
					<i className="bi bi-search"></i>
					<input
						type="text"
						className={styles.searchInput}
						placeholder="Search users..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					{searchQuery && (
						<button
							className={styles.clearButton}
							onClick={() => setSearchQuery("")}
						>
							<i className="bi bi-x"></i>
						</button>
					)}
				</div>

				{/* Search Results */}
				{searchQuery && (
					<div className={styles.searchResults}>
						{isSearching ? (
							<div className={styles.searchLoading}>
								<div className={styles.spinner}></div>
								<span>Searching...</span>
							</div>
						) : searchResults.length > 0 ? (
							<div className={styles.userList}>
								{searchResults.map(user => (
									<div
										key={user.id}
										className={styles.userCard}
										onClick={() => window.location.href = `/profile/${user.id}`}
									>
										<img
											src={user.profileImgUrl}
											alt={user.username}
											className={styles.userAvatar}
											onError={(e) => {
												(e.target as HTMLImageElement).src = "src/assets/defaultProfileImg.jpg";
											}}
										/>
										<div className={styles.userInfo}>
											<span className={styles.userName}>{user.username}</span>
										</div>
										<i className="bi bi-chevron-right"></i>
									</div>
								))}
							</div>
						) : (
							<div className={styles.emptyState}>
								<i className="bi bi-search"></i>
								<p>No users found</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Tab content */}
			{!searchQuery && (
				<div className={styles.tabContent}>
					{activeNetworkTab === "Following" &&
						renderUserList(following, "You're not following anyone yet")
					}
					{activeNetworkTab === "Followers" &&
						renderUserList(followers, "No followers yet")
					}
				</div>
			)}
		</div>
	);
};

export default ProfileNetworkTab;