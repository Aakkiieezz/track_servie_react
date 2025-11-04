import React, { useState, useEffect } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useLocation } from 'react-router-dom';
import styles from './ImageGalleryPage.module.css';
import AppHeader from '@/components/AppHeader';

interface ImageData {
  iso_639_1: string | null;
  iso_3166_1: string | null;
  file_path: string;
  aspect_ratio: number;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
}

interface BackendResponse {
  id: number;
  backdrops: ImageData[];
  logos: ImageData[];
  posters: ImageData[];
}

interface GroupedData {
  [type: string]: {
    [language: string]: ImageData[];
  };
}

interface TabConfig {
  label: string;
  value: string;
  gridClass: string;
  imageClass: string;
}

interface LocationState {
  childType: string;
  tmdbId: number;
  title: string;
  releaseDate?: string;
  firstAirDate?: string;
  lastAirDate?: string;
}

interface CustomImagePayload {
  childType: string;
  tmdbId: number;
  imageType: "poster" | "backdrop";
  filePath: string;
}

const ImageGalleryPage: React.FC = () => {
  const location = useLocation();
  const { childType, tmdbId, title, releaseDate, firstAirDate, lastAirDate } = location.state as LocationState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [activeTab, setActiveTab] = useState('POSTER');
  const [activeLanguage, setActiveLanguage] = useState<string>('');

  const tabConfigs: TabConfig[] = [
    { label: 'POSTERS', value: 'POSTER', gridClass: styles.posterGrid, imageClass: styles.poster },
    { label: 'BACKDROPS', value: 'BACKDROP', gridClass: styles.backdropGrid, imageClass: styles.backdrop },
    { label: 'LOGOS', value: 'LOGO', gridClass: styles.logoGrid, imageClass: styles.logo }
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    // Set default language when active tab changes
    if (groupedData[activeTab]) {
      const languages = Object.keys(groupedData[activeTab]);
      if (languages.length > 0)
        setActiveLanguage(languages[0]);
    }
  }, [activeTab, groupedData]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("ImageGalleryPage -> API Call -> request:", childType, tmdbId);

      const response = await axiosInstance.get<BackendResponse>(`/images/${childType}/${tmdbId}`);
      const data = response.data;

      // Data is already grouped by type (backdrops, logos, posters)
      // Now group by language within each type
      const grouped: GroupedData = {};

      // Map backend keys to display keys
      const typeMapping: { [key: string]: string } = {
        'posters': 'POSTER',
        'backdrops': 'BACKDROP',
        'logos': 'LOGO'
      };

      // Process each type
      Object.entries(typeMapping).forEach(([backendKey, displayKey]) => {
        if (data[backendKey as keyof BackendResponse]) {
          grouped[displayKey] = {};

          const images = data[backendKey as keyof BackendResponse] as ImageData[];

          images.forEach((item) => {
            const language = item.iso_639_1 || 'null';

            if (!grouped[displayKey][language])
              grouped[displayKey][language] = [];

            grouped[displayKey][language].push(item);
          });
        }
      });

      setGroupedData(grouped);

      // Set initial active language
      if (grouped['POSTER']) {
        const languages = Object.keys(grouped['POSTER']).sort();
        if (languages.length > 0) {
          setActiveLanguage(languages[0]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLanguages = (type: string): string[] => {
    return groupedData[type] ? Object.keys(groupedData[type]).sort() : [];
  };

  const getCurrentImages = (): ImageData[] => {
    return groupedData[activeTab]?.[activeLanguage] || [];
  };

  const getCurrentTabConfig = (): TabConfig => {
    return tabConfigs.find(t => t.value === activeTab) || tabConfigs[0];
  };

  const getImageUrl = (filePath: string): string => {
    return `https://image.tmdb.org/t/p/original${filePath}`;
  };

  const getDisplayTitle = (): string => {
    if (childType === "movie" && releaseDate) {
      const year = new Date(releaseDate).getFullYear();
      return `${title} (${year})`;
    } else if (childType === "tv" && firstAirDate) {
      const startYear = new Date(firstAirDate).getFullYear();

      if (lastAirDate) {
        const endYear = new Date(lastAirDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const displayEndYear = endYear === currentYear ? "present" : endYear;
        return `${title} (${startYear} - ${displayEndYear})`;
      }

      return `${title} (${startYear})`;
    }

    return title || "Image Gallery";
  };

  const handleSetCustomImage = async (imageType: "poster" | "backdrop", filePath: string) => {
    try {
      const payload: CustomImagePayload = {
        childType,
        tmdbId,
        imageType,
        filePath,
      };

      console.log("Set Custom Image ->", payload);

      await axiosInstance.post(`images/${childType}/${tmdbId}/set-custom`,
        null,
        {
          params: {
            imageType,
            filePath,
          },
        }
      );

      alert("Custom image set successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to set custom image");
    }
  };

  const handleDownload = (filePath: string) => {
    const url = getImageUrl(filePath);
    const link = document.createElement('a');
    link.href = url;
    link.download = filePath.split('/').pop() || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorContent}>
          <p className={styles.errorTitle}>Error loading images</p>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchImages} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentTabConfig = getCurrentTabConfig();
  const availableLanguages = getAvailableLanguages(activeTab);
  const currentImages = getCurrentImages();

  return (
    <div className={styles.container}>
      <AppHeader />
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          {getDisplayTitle()}
        </h1>
      </div>

      <div className={styles.tabs}>
        {tabConfigs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`${styles.tab} ${activeTab === tab.value ? styles.active : ''}`}
          >
            {tab.label}
            {groupedData[tab.value] && (
              <span className={styles.tabCount}>
                ({Object.values(groupedData[tab.value]).flat().length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {availableLanguages.length > 0 && (
          <div className={styles.languageSidebar}>
            <div className={styles.languageSidebarInner}>
              <p className={styles.languageSidebarTitle}>Language</p>
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`${styles.languageButton} ${activeLanguage === lang ? styles.active : ''}`}
                >
                  {lang.toUpperCase()}
                  <span className={styles.languageCount}>
                    ({groupedData[activeTab][lang].length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.gridContainer}>
          {currentImages.length === 0 ? (
            <div className={styles.empty}>
              No images available for this selection
            </div>
          ) : (
            <div className={`${styles.grid} ${currentTabConfig.gridClass}`}>
              {currentImages.map((image, idx) => (
                <div
                  key={idx}
                  className={`${styles.imageContainer} ${currentTabConfig.imageClass}`}
                >
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={`${activeTab} ${idx + 1}`}
                    loading="lazy"
                  />
                  <div className={styles.imageButtonsOverlay}>
                    <button
                      className={styles.overlayBtn}
                      title="Download image"
                      onClick={() => handleDownload(image.file_path)}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className={styles.overlayBtn}
                      title="Set as custom"
                      onClick={() =>
                        handleSetCustomImage(activeTab.toLowerCase() as "poster" | "backdrop", image.file_path)
                      }
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryPage;