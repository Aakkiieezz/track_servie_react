import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/contexts/AlertContext";

import styles from "./ListsTab.module.css";
import { EditListModal, DeleteListModal } from "@/components/ProfilePage/ListsTab/Modals";
import PosterFanStack from "@/components/common/PosterFanStack/PosterFanStack";
import { Edit, Trash2 } from "lucide-react";

interface ListItem {
	id: number;
	name: string;
	description?: string;
	totalServiesCount: number;
}

interface Props {
	userId: number;
	isOwnProfile: boolean;
}

const ProfileListsTab: React.FC<Props> = ({ userId, isOwnProfile }) => {
	const [lists, setLists] = useState<ListItem[]>([]);
	const [loading, setLoading] = useState(false);

	const { setAlert } = useAlert();
	const navigate = useNavigate();

	const [previews, setPreviews] = useState<Record<number, (string | null)[]>>({});

	const [showEditModal, setShowEditModal] = useState(false);
	const [editingListId, setEditingListId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [saving, setSaving] = useState(false);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingListId, setDeletingListId] = useState<number | null>(null);
	const [deletingListName, setDeletingListName] = useState("");
	const [deleting, setDeleting] = useState(false);

	const fetchLists = async () => {
		try {
			setLoading(true);
			const res = await axiosInstance.get<ListItem[]>(`list/${userId}/all`);
			if (res.status === 200) {
				setLists(res.data || []);
				fetchPreviews(res.data || []);
			}
		} catch (err) {
			console.error(err);
			setAlert({ type: "danger", message: "Failed to fetch lists." });
		} finally {
			setLoading(false);
		}
	};

	const fetchPreviews = async (listItems: ListItem[]) => {
		const promises = listItems.map(async (li) => {
			try {
				const r = await axiosInstance.get<(string | null)[]>(`list/${li.id}/previews`);
				return { id: li.id, posters: r.data || [] };
			} catch {
				return { id: li.id, posters: [] };
			}
		});
		const results = await Promise.all(promises);
		const map: Record<number, (string | null)[]> = {};
		results.forEach((it) => (map[it.id] = it.posters));
		setPreviews(map);
	};

	useEffect(() => {
		fetchLists();
	}, []);

	const openCreateModal = () => {
		setEditingListId(null);
		setEditName("");
		setEditDescription("");
		setShowEditModal(true);
	};

	const handleCreateList = async () => {
		if (!editName.trim()) {
			setAlert({ type: "warning", message: "List name required" });
			return;
		}
		try {
			setSaving(true);
			await axiosInstance.post("list", null, {
				params: { name: editName, description: editDescription },
			});
			setAlert({ type: "success", message: "List created successfully" });
			setShowEditModal(false);
			fetchLists();
		} catch {
			setAlert({ type: "danger", message: "Failed to create list" });
		} finally {
			setSaving(false);
		}
	};

	const handleEditList = (list: ListItem) => {
		setEditingListId(list.id);
		setEditName(list.name);
		setEditDescription(list.description || "");
		setShowEditModal(true);
	};

	const handleUpdateList = async () => {
		try {
			setSaving(true);
			await axiosInstance.put(`list/${editingListId}`, null, {
				params: { name: editName, description: editDescription },
			});
			setAlert({ type: "success", message: "List updated successfully" });
			setShowEditModal(false);
			fetchLists();
		} catch {
			setAlert({ type: "danger", message: "Failed to update list" });
		} finally {
			setSaving(false);
		}
	};

	const openDeleteModal = (list: ListItem) => {
		setDeletingListId(list.id);
		setDeletingListName(list.name);
		setShowDeleteModal(true);
	};

	const handleDeleteList = async () => {
		try {
			setDeleting(true);
			await axiosInstance.delete(`list/${deletingListId}`);
			setAlert({ type: "success", message: "List deleted successfully" });
			setShowDeleteModal(false);
			fetchLists();
		} catch {
			setAlert({ type: "danger", message: "Failed to delete list" });
		} finally {
			setDeleting(false);
		}
	};

	const getPreviewContent = (listId: number) => {
		const posters = previews[listId] || [];
		console.log("previews for", listId, posters);
		return (
			<PosterFanStack
				posters={posters}
				height={180}
			/>
		);
	};

	return (
		<>
			<div className={styles.headerRow}>
				<h2 className={styles.pageTitle}>Lists</h2>

				{isOwnProfile &&
					(
						<button className="btn btn-success" onClick={openCreateModal}>
							+ Create List
						</button>
					)
				}
			</div>

			{loading ? (
				<p>Loading...</p>
			) : lists.length === 0 ? (
				<p>No lists found.</p>
			) : (
				<div className={styles.listRows}>
					{lists.map((li) => (
						<div className={styles.listRow} key={li.id}>
							<div className={styles.left}>
								<div
									className={styles.posterArea}
									onClick={() => navigate(`/list/${li.id}`, { state: { previews: previews[li.id] || [] } })}
								>
									{getPreviewContent(li.id)}
								</div>
							</div>

							<div className={styles.right}>
								<div className={styles.titleRow}>
									<button
										className={styles.listNameBtn}
										onClick={() => navigate(`/list/${li.id}`, { state: { previews: previews[li.id] || [] } })}
									>
										<h3 className={styles.listName}>{li.name}</h3>
									</button>

									<div className={styles.countBadge}>
										{li.totalServiesCount} servies
									</div>
								</div>

								{li.description && (
									<p className={styles.description}>{li.description}</p>
								)}

								<div className={styles.actions}>
									<button
										className={styles.actionBtn}
										onClick={() => handleEditList(li)}
									>
										<Edit size={18} />
									</button>

									<button
										className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
										onClick={() => openDeleteModal(li)}
									>
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<EditListModal
				isOpen={showEditModal}
				listName={editName}
				listDescription={editDescription}
				onNameChange={setEditName}
				onDescriptionChange={setEditDescription}
				onClose={() => setShowEditModal(false)}
				onSave={editingListId ? handleUpdateList : handleCreateList}
				isLoading={saving}
				isEditMode={!!editingListId}
			/>

			<DeleteListModal
				isOpen={showDeleteModal}
				listName={deletingListName}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteList}
				isLoading={deleting}
			/>
		</>
	);
};

export default ProfileListsTab;