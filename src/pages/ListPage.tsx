import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import ServieGrid from "../components/HomePage/ServieGrid";
import styles from "./ListPage.module.css";
import PosterFanStack from "@/components/PosterFanStack";
import { Trash2, Edit } from "lucide-react";
import { EditListModal, DeleteListModal } from "@/components/ListPageModals";
import type { Servie } from "@/types/servie";
import { useAlert } from "../contexts/AlertContext";

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

  const [list, setList] = useState<ListDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setAlert } = useAlert();
  
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
        setTimeout(() => navigate("/lists"), 1500);
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

  const heroPosters = (list.servies || []).slice(0, 5).map(s => s.posterPath).filter(Boolean);

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.heroRow}>
            <div className={styles.posterHero}>
              <PosterFanStack posters={heroPosters} height={240} onClick={() => {}} />
            </div>

            <div className={styles.infoSection}>
              <h1 className={styles.listTitle}>{list.name}</h1>
              <div className={styles.metaRow}>
                <span className={styles.countBadge}>{(list.servies || []).length} servies</span>
              </div>

              {list.description && <p className={styles.description}>{list.description}</p>}

              <div className={styles.heroActions}>
                <button 
                  className={styles.actionBtn}
                  onClick={handleEditClick}
                  title="Edit list"
                >
                  <Edit size={18} />
                  <span>Edit</span>
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  onClick={() => setShowDeleteModal(true)}
                  title="Delete list"
                >
                  <Trash2 size={18} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.serviesGrid}>
            <ServieGrid servies={list.servies || []} />
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
    </>
  );
};

export default ListPage;