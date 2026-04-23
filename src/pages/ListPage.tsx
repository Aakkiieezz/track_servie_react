import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/common/AppHeader/AppHeader";
import ServieGrid from "../components/common/ServieGrid/ServieGrid";
import styles from "./ListPage.module.css";
import PosterFanStack from "@/components/common/PosterFanStack/PosterFanStack";
import ProgressBar from "@/components/common/ProgressBar/ProgressBar";
import { Trash2, Edit } from "lucide-react";
import { EditListModal, DeleteListModal } from "@/components/ProfilePage/ListsTab/Modals";
import type { Servie } from "@/types/servie";
import { useAlert } from "@/contexts/AlertContext";
import { ListPageContext } from "../contexts/ListPageContext";

interface ListDto {
	id: number;
	name: string;
	description?: string;
	servies: Servie[];
}

const ListPage: React.FC = () => {
	const { listId } = useParams<{ listId: string }>();
	const id = listId ? Number(listId) : null;
	const navigate = useNavigate();
	const location = useLocation();

	const [list, setList] = useState<ListDto | null>(null);

	// use passed previews immediately if available from ListsTab
	const [heroPosters, setHeroPosters] = useState<(string | null)[]>(
		location.state?.previews || []
	);

	useEffect(() => {
		// Clear previews from history state after consuming — prevents stale data on refresh
		if (location.state?.previews) {
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, []);

	const [loading, setLoading] = useState<boolean>(false);
	const { setAlert } = useAlert();

	// Snapshot refs for rollback — no re-render needed, just refs
	const serviesSnapshot = useRef<Servie[]>([]);
	const heroPostersSnapshot = useRef<(string | null)[]>([]);

	// Edit modal state
	const [showEditModal, setShowEditModal] = useState(false);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [saving, setSaving] = useState(false);

	// Delete modal state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const fetchList = async () => {
		if (!id) return;

		try {
			setLoading(true);
			const requests: Promise<any>[] = [axiosInstance.get<ListDto>(`list/${id}`)];

			// only fetch previews if we didn't get them from navigation state
			if (!location.state?.previews)
				requests.push(axiosInstance.get<(string | null)[]>(`list/${id}/previews`));

			const [listRes, previewRes] = await Promise.all(requests);

			if (listRes.status === 200)
				setList(listRes.data);
			if (previewRes?.status === 200)
				setHeroPosters(previewRes.data || []);

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

	const computeHeroPosters = useCallback((servies: Servie[]): (string | null)[] => {
		const posters = servies.slice(0, 20).map(s => s.posterPath ?? null);
		const valid = posters.filter((p): p is string => !!p).slice(0, 5);
		const nulls = posters.filter(p => !p);
		return [...valid, ...nulls].slice(0, 5);
	}, []);

	// Optimistic remove — snapshot both servies and heroPosters, then recompute immediately
	const handleServieRemoved = useCallback((servie: Servie) => {
		setList((prev) => {
			if (!prev) return prev;

			serviesSnapshot.current = prev.servies;
			heroPostersSnapshot.current = [];

			const updatedServies = prev.servies.filter(
				(s) => !(s.tmdbId === servie.tmdbId && s.childtype === servie.childtype)
			);

			setHeroPosters((prevPosters) => {
				let recomputed: (string | null)[];

				// If Non-null poster — recompute fully, may pull in 6th servie to fill gap
				if (servie.posterPath)
					recomputed = computeHeroPosters(updatedServies);

				else {
					// Null poster — only remove the null slot if no remaining null servie can fill it
					const remainingNulls = updatedServies.filter(s => !s.posterPath).length;
					const currentNullSlots = prevPosters.filter(p => p === null).length;

					// If another null servie still covers this slot — nothing to change
					if (remainingNulls >= currentNullSlots)
						return prevPosters;

					// No replacement null available — splice the slot out
					const nullIndex = prevPosters.findIndex(p => p === null);
					recomputed = [...prevPosters];
					recomputed.splice(nullIndex, 1);
				}

				const changed = recomputed.some((p, i) => p !== prevPosters[i]) || recomputed.length !== prevPosters.length;
				if (!changed)
					return prevPosters;
				heroPostersSnapshot.current = prevPosters;
				return recomputed;
			});

			return { ...prev, servies: updatedServies };
		});
	}, [computeHeroPosters]);

	// Rollback — restore both snapshots on API failure
	const handleServieRollback = useCallback((_servie: Servie) => {
		setList((prev) => {
			if (!prev) return prev;
			return { ...prev, servies: serviesSnapshot.current };
		});
		if (heroPostersSnapshot.current.length > 0) {
			setHeroPosters(heroPostersSnapshot.current);
			heroPostersSnapshot.current = [];
		}
	}, []);

	const handleEditClick = () => {
		if (list) {
			setEditName(list.name);
			setEditDescription(list.description || "");
			setShowEditModal(true);
		}
	};

	const handleUpdateList = async () => {
		if (!editName.trim()) {
			setAlert({ type: "warning", message: "List name required" });
			return;
		}
		try {
			setSaving(true);
			const response = await axiosInstance.put(`list/${id}`, null, {
				params: { name: editName, description: editDescription },
			});
			if (response.status === 200) {
				setAlert({ type: "success", message: "List updated successfully" });
				closeEditModal();
				fetchList();
			}
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to update list" });
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteList = async () => {
		try {
			setDeleting(true);
			const response = await axiosInstance.delete(`list/${id}`);
			if (response.status === 200) {
				setAlert({ type: "success", message: "List deleted successfully" });
				setTimeout(() => navigate("/profile/me/lists"), 1500);
			}
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to delete list" });
		} finally {
			setDeleting(false);
		}
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditName("");
		setEditDescription("");
	};

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

	const totalCount = (list.servies || []).length;
	const completedCount = (list.servies || []).filter(s => s.completed).length;
	const completedPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<ListPageContext.Provider value={{
			listId: id!,
			onServieRemoved: handleServieRemoved,
			onServieRollback: handleServieRollback,
		}}>
			<AppHeader />

			<div className={styles.pageContainer}>
				<div className={styles.container}>
					<div className={styles.heroRow}>
						<div className={styles.posterHero}>
							<PosterFanStack posters={heroPosters} height={240} onClick={() => { }} />
						</div>

						<div className={styles.infoSection}>
							{/* Top row: title + count badge */}
							<div className={styles.topRow}>
								<h1 className={styles.listTitle}>{list.name}</h1>
								<span className={styles.countBadge}>{totalCount} servies</span>
							</div>

							{/* Description — grows to fill available space */}
							{list.description && (
								<p className={styles.description}>{list.description}</p>
							)}

							{/* Bottom row: progress (left) + actions (right) */}
							<div className={styles.bottomRow}>
								<div className={styles.progressBlock}>
									<span className={styles.watchedLabel}>you've watched</span>
									<div className={styles.watchedCount}>
										<div className={styles.watchedLeft}>
											<span className={styles.watchedMain}>{completedCount}</span>
											<span className={styles.watchedOf}>of {totalCount}</span>
										</div>
										<span className={styles.watchedPct}>{completedPct}%</span>
									</div>
									<ProgressBar
										episodesWatched={completedCount}
										totalEpisodes={totalCount}
										showLabel={false}
									/>
								</div>

								<div className={styles.heroActions}>
									<button
										className={styles.actionBtn}
										onClick={handleEditClick}
										title="Edit list"
									>
										<Edit size={16} />
										<span>Edit</span>
									</button>
									<button
										className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
										onClick={() => setShowDeleteModal(true)}
										title="Delete list"
									>
										<Trash2 size={16} />
										<span>Delete</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					<hr className={styles.divider} />

					<div className={styles.serviesGrid}>
						<ServieGrid servies={list.servies || []} columnsPerRow={12} />
					</div>
				</div>
			</div>

			{/* Modals */}
			<EditListModal
				isOpen={showEditModal}
				listName={editName}
				listDescription={editDescription}
				onNameChange={setEditName}
				onDescriptionChange={setEditDescription}
				onClose={closeEditModal}
				onSave={handleUpdateList}
				isLoading={saving}
				isEditMode={true}
			/>

			<DeleteListModal
				isOpen={showDeleteModal}
				listName={list.name}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteList}
				isLoading={deleting}
			/>
		</ListPageContext.Provider>
	);
};

export default ListPage;