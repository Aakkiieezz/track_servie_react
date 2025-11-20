import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import PosterFanStack from "@/components/PosterFanStack";
import styles from "./ListsPage.module.css";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit } from "lucide-react";
import { EditListModal, DeleteListModal } from "@/components/ListPageModals";

interface ListItem {
  id: number;
  name: string;
  description?: string;
  totalServiesCount: number;
}

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingListId, setDeletingListId] = useState<number | null>(null);
  const [deletingListName, setDeletingListName] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  const [previews, setPreviews] = useState<Record<number, string[]>>({});
  const navigate = useNavigate();

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<{ lists: ListItem[] }>("list/all");
      if (res.status === 200 && res.data) {
        setLists(res.data.lists || []);
        fetchPreviews(res.data.lists || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch lists." });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviews = async (listItems: ListItem[]) => {
    const items = listItems.slice(0, 20);
    try {
      const promises = items.map(async (li) => {
        try {
          const r = await axiosInstance.get<string[]>(`list/${li.id}/previews`);
          if (r.status === 200 && r.data) {
            return { id: li.id, posters: r.data };
          }
        } catch (e) {
          // ignore
        }
        return { id: li.id, posters: [] as string[] };
      });

      const results = await Promise.all(promises);
      const map: Record<number, string[]> = {};
      results.forEach((it) => (map[it.id] = it.posters || []));
      setPreviews((prev) => ({ ...prev, ...map }));
    } catch (err) {
      console.error("Error fetching previews", err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreateList = async () => {
    if (!editName.trim()) {
      setAlert({ type: "warning", message: "List name required" });
      return;
    }
    try {
      setSaving(true);
      const response = await axiosInstance.post("list", null, {
        params: { name: editName, description: editDescription },
      });
      if (response.status === 200 || response.status === 201) {
        setAlert({ type: "success", message: "List created successfully" });
        setShowEditModal(false);
        setEditName("");
        setEditDescription("");
        fetchLists();
      }
    } catch (err) {
      console.error(err);
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
    if (!editName.trim()) {
      setAlert({ type: "warning", message: "List name required" });
      return;
    }
    try {
      setSaving(true);
      const response = await axiosInstance.put(`list/${editingListId}`, null, {
        params: { name: editName, description: editDescription },
      });
      if (response.status === 200) {
        setAlert({ type: "success", message: "List updated successfully" });
        closeEditModal();
        fetchLists();
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
      const response = await axiosInstance.delete(`list/${deletingListId}`);
      if (response.status === 200) {
        setAlert({ type: "success", message: "List deleted successfully" });
        closeDeleteModal();
        fetchLists();
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
    setEditingListId(null);
    setEditName("");
    setEditDescription("");
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingListId(null);
    setDeletingListName("");
  };

  const openDeleteModal = (list: ListItem) => {
    setDeletingListId(list.id);
    setDeletingListName(list.name);
    setShowDeleteModal(true);
  };

  const openCreateModal = () => {
    setEditingListId(null);
    setEditName("");
    setEditDescription("");
    setShowEditModal(true);
  };

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>All Lists</h2>
            <div className={styles.headerActions}>
              <button className="btn btn-success" onClick={openCreateModal}>
                <span className="me-1">+</span> Create New List
              </button>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
              {alert.message}
              <button type="button" className="btn-close" onClick={() => setAlert(null)} aria-label="Close" />
            </div>
          )}

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
                      onClick={() => navigate(`/list/${li.id}`)}
                    >
                      {(previews[li.id] || []).length > 0 ? (
                        <PosterFanStack
                          posters={previews[li.id] || []}
                          height={180}
                          onClick={() => navigate(`/list/${li.id}`)}
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          <div className={styles.placeholderText}>No preview</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.titleRow}>
                      <button className={styles.listNameBtn} onClick={() => navigate(`/list/${li.id}`)}>
                        <h3 className={styles.listName}>{li.name}</h3>
                      </button>
                      <div className={styles.countBadge}>{li.totalServiesCount} {li.totalServiesCount > 1 ? "servies" : "servie"}</div>
                    </div>

                    {li.description && (
                      <p className={styles.description}>{li.description}</p>
                    )}

                    <div className={styles.actions}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleEditList(li)}
                        title="Edit list"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => openDeleteModal(li)}
                        title="Delete list"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        onSave={editingListId ? handleUpdateList : handleCreateList}
        isLoading={saving}
        isEditMode={!!editingListId}
      />

      <DeleteListModal
        isOpen={showDeleteModal}
        listName={deletingListName}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteList}
        isLoading={deleting}
      />
    </>
  );
};

export default ListsPage;