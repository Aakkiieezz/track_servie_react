import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

interface ListDto2 {
  id: number;
  name: string;
  description?: string;
  totalServiesCount: number;
}

interface ListDtoDetails {
  lists: ListDto2[];
}

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ListDto2[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>("");
  const [newListDescription, setNewListDescription] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  const fetchLists = async () => {
    try {
      setLoading(true);
      console.log("AllListPage -> API Call -> request");

      const response = await axiosInstance.get<ListDtoDetails>(`list/all`);

      if (response.status === 200) {
        console.log("AllListPage -> API Call -> response:", response.data);
        setLists(response.data.lists || []);
      }
    } catch (error) {
      console.error("Error fetching lists", error);
      setAlert({ type: "danger", message: "Failed to fetch lists !!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const navigate = useNavigate();
  const handleOpenList = (listId: number) => {
    navigate(`/list/${listId}`);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setAlert({ type: "warning", message: "List name is required!" });
      return;
    }

    try {
      setCreating(true);
      setAlert(null);
      
      console.log("Creating new list...");
      
      const response = await axiosInstance.post(
        `list`,
        null,
        {
          params: {
            name: newListName,
            description: newListDescription
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("List created successfully:", response.data);
        setAlert({ type: "success", message: "List created successfully!" });
        setShowModal(false);
        setNewListName("");
        setNewListDescription("");
        
        // Refresh the lists
        fetchLists();
      }
    } catch (error) {
      console.error("Error creating list", error);
      setAlert({ type: "danger", message: "Failed to create list!" });
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewListName("");
    setNewListDescription("");
    setAlert(null);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Lists</h2>
        <button
          className="btn btn-success"
          onClick={() => setShowModal(true)}
        >
          <span className="me-1">+</span> Create New List
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : lists.length === 0 ? (
        <p>No lists found.</p>
      ) : (
        <div>
          {lists.map((list, index) => (
            <div key={list.id}>
              <div
                style={{ cursor: "pointer", padding: "1rem 0" }}
                onClick={() => handleOpenList(list.id)}
              >
                <strong style={{ color: "blue", fontSize: "1.1rem" }}>
                  {list.name}
                </strong>
                <div className="text-muted small mt-1">
                  {list.totalServiesCount} {list.totalServiesCount > 1 ? 'servies' : 'servie'}
                </div>
                {list.description && (
                  <p 
                    className="text-secondary mb-0 mt-2" 
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '2'
                    }}
                  >
                    {list.description}
                  </p>
                )}
              </div>
              {index < lists.length - 1 && (
                <hr style={{ margin: 0, borderColor: '#aaa' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating new list */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New List</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={creating}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="listName" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="listName"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                    disabled={creating}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="listDescription" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="listDescription"
                    rows={3}
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Enter list description (optional)"
                    disabled={creating}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateList}
                  disabled={creating}
                >
                  {creating ? "Saving..." : "Save List"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListsPage;