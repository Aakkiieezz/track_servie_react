import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import AppHeader from "@/components/AppHeader";
import PosterFanStack from "@/components/PosterFanStack";
import styles from "./ListsPage.module.css";
import { useNavigate } from "react-router-dom";

/**
 * Assumptions:
 * - main GET `list/all` returns objects like { id, name, description, totalServiesCount }
 * - preview posters are fetched from `list/{id}/preview` which returns { posters: string[] }
 *   (You said you'll create an API for that)
 */

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
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [previews, setPreviews] = useState<Record<number, string[]>>({}); // listId -> posters
  const navigate = useNavigate();

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<{ lists: ListItem[] }>("list/all");
      if (res.status === 200 && res.data) {
        setLists(res.data.lists || []);
        // fetch previews for visible lists
        fetchPreviews(res.data.lists || []);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to fetch lists." });
    } finally {
      setLoading(false);
    }
  };

  // fetch the preview posters for up to first N lists (to avoid many requests)
  const fetchPreviews = async (listItems: ListItem[]) => {
    const items = listItems.slice(0, 20); // limit to 20 preview requests at once
    try {
      const promises = items.map(async (li) => {
        try {
          // Backend returns: string[] directly, not { posters: string[] }
          const r = await axiosInstance.get<string[]>(`list/${li.id}/previews`);
          if (r.status === 200 && r.data) {
            return { id: li.id, posters: r.data }; // Use r.data directly
          }
        } catch (e) {
          // ignore error for individual preview
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setAlert({ type: "warning", message: "List name required" });
      return;
    }
    try {
      setCreating(true);
      const response = await axiosInstance.post("list", null, {
        params: { name: newListName, description: newListDescription },
      });
      if (response.status === 200 || response.status === 201) {
        setAlert({ type: "success", message: "List created successfully" });
        setShowModal(false);
        setNewListName("");
        setNewListDescription("");
        fetchLists();
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to create list" });
    } finally {
      setCreating(false);
    }
  };

  const openList = (listId: number) => {
    navigate(`/list/${listId}`);
  };

  return (
    <>
      <AppHeader />

      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <h2 className={styles.pageTitle}>All Lists</h2>
            <div className={styles.headerActions}>
              <button className="btn btn-success" onClick={() => setShowModal(true)}>
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
                      // clicking poster area navigates to list page
                      onClick={() => openList(li.id)}
                    >
                      <PosterFanStack
                        posters={previews[li.id] || []}
                        height={180}
                        onClick={() => openList(li.id)}
                      />
                      {/* if no preview posters, show placeholder */}
                      {(previews[li.id] || []).length === 0 && (
                        <div className={styles.placeholder}>
                          <div className={styles.placeholderText}>No preview</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.right}>
                    <div className={styles.titleRow}>
                      <button className={styles.listNameBtn} onClick={() => openList(li.id)}>
                        <h3 className={styles.listName}>{li.name}</h3>
                      </button>
                      <div className={styles.countBadge}>{li.totalServiesCount} {li.totalServiesCount > 1 ? "servies" : "servie"}</div>
                    </div>

                    {li.description && (
                      <p className={styles.description}>{li.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create list modal (bootstrap) */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New List</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} disabled={creating}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input className="form-control" value={newListName} onChange={(e) => setNewListName(e.target.value)} disabled={creating} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={3} value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} disabled={creating} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={creating}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateList} disabled={creating}>{creating ? "Saving..." : "Save List"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListsPage;
