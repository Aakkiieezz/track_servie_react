import { useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./DataTab.module.css";
import { useAlert } from '@/contexts/AlertContext';

const DataTab: React.FC = () => {
    const { setAlert } = useAlert();
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    const handleExportData = async () => {
        try {
            setExporting(true);
            const response = await axiosInstance.get(
                "http://localhost:8080/track-servie/export/user-data",
                {
                    responseType: "blob",
                }
            );

            const fileName = response.headers["x-filename"] || "backup.zip";
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setAlert({ type: "success", message: "Data exported successfully." });
        } catch (error) {
            console.error("Error downloading file:", error);
            setAlert({ type: "danger", message: "Error downloading file." });
        } finally {
            setExporting(false);
        }
    };

    const handleImportData = async () => {
        try {
            setImporting(true);
            const response = await axiosInstance.get("user/data/export", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "account_data.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            setAlert({ type: "success", message: "Data exported successfully." });
        } catch (error) {
            console.error("Error exporting data:", error);
            setAlert({ type: "danger", message: "Error exporting data." });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className={styles.dataTabContent}>
            <div className={styles.centeredContent}>
                {/* Data Export Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-download"></i>
                        Export Your Data
                    </h3>

                    <p className={styles.sectionDescription}>
                        Download all your account data in a compressed format. This includes
                        your watchlist, favorites, lists, ratings, and other account
                        information.
                    </p>

                    <div className={styles.cardWrapper}>
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <i className="bi bi-file-earmark-zip"></i>
                                <div className={styles.cardText}>
                                    <h4 className={styles.cardTitle}>Complete Backup</h4>
                                    <p className={styles.cardDescription}>
                                        Get a complete backup of your data in ZIP format
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleExportData}
                                disabled={exporting}
                                className={styles.actionButton}
                            >
                                {exporting ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-download"></i>
                                        Export
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Import Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-upload"></i>
                        Import Your Data
                    </h3>

                    <p className={styles.sectionDescription}>
                        Restore or migrate your data from a previous backup. Make sure you
                        have a valid backup file before proceeding.
                    </p>

                    <div className={styles.cardWrapper}>
                        <div className={styles.card}>
                            <div className={styles.cardContent}>
                                <i className="bi bi-file-earmark-csv"></i>
                                <div className={styles.cardText}>
                                    <h4 className={styles.cardTitle}>Data Import</h4>
                                    <p className={styles.cardDescription}>
                                        Import your previously exported account data
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleImportData}
                                disabled={importing}
                                className={styles.actionButton}
                            >
                                {importing ? (
                                    <>
                                        <i className="bi bi-hourglass-split"></i>
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-upload"></i>
                                        Import
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Privacy Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="bi bi-shield-check"></i>
                        Data Privacy
                    </h3>

                    <div className={styles.privacyCardWrapper}>
                        <div className={styles.privacyCard}>
                            <div className={styles.privacyItem}>
                                <i className="bi bi-lock"></i>
                                <div className={styles.privacyContent}>
                                    <span className={styles.privacyLabel}>Your Data is Secure</span>
                                    <span className={styles.privacyDescription}>
                                        All exports are encrypted and protected during download
                                    </span>
                                </div>
                            </div>

                            <div className={styles.privacyItem}>
                                <i className="bi bi-cloud"></i>
                                <div className={styles.privacyContent}>
                                    <span className={styles.privacyLabel}>Cloud Backup</span>
                                    <span className={styles.privacyDescription}>
                                        Keep your backups safe in your preferred storage location
                                    </span>
                                </div>
                            </div>

                            <div className={styles.privacyItem}>
                                <i className="bi bi-person-lock"></i>
                                <div className={styles.privacyContent}>
                                    <span className={styles.privacyLabel}>Privacy Respected</span>
                                    <span className={styles.privacyDescription}>
                                        We never share or access your personal data
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTab;