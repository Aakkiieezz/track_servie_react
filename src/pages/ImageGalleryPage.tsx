import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useLocation } from 'react-router-dom';
import './ImageGalleryPage.css'
import { Download, Image as ImageIcon } from 'lucide-react'; // ⬅️ Add these icons at the top

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
}

interface CustomImagePayload {
  childType: string;   // e.g. "movie" or "tv"
  tmdbId: number;
  imageType: "poster" | "backdrop";
  filePath: string;    // full or relative file path
}

const ImageGalleryPage: React.FC = () => {
  const location = useLocation();
  const { childType, tmdbId } = location.state as LocationState;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [activeTab, setActiveTab] = useState('POSTER');
  const [activeLanguage, setActiveLanguage] = useState<string>('');

  const tabConfigs: TabConfig[] = [
    { label: 'POSTERS', value: 'POSTER', gridClass: 'poster-grid', imageClass: 'poster' },
    { label: 'BACKDROPS', value: 'BACKDROP', gridClass: 'backdrop-grid', imageClass: 'backdrop' },
    { label: 'LOGOS', value: 'LOGO', gridClass: 'logo-grid', imageClass: 'logo' }
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

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="gallery-loading-content">
          <div className="gallery-spinner"></div>
          <p className="gallery-loading-text">Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-error">
        <div className="gallery-error-content">
          <p className="gallery-error-title">Error loading images</p>
          <p className="gallery-error-message">{error}</p>
          <button onClick={fetchImages} className="gallery-retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 🟢 Add API call for setting custom image
  const handleSetCustomImage = async (imageType: "poster" | "backdrop", filePath: string) => {
    try {

      const payload: CustomImagePayload = {
        childType,   // variable already available in your component
        tmdbId,      // same
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

  // 🟢 Add image download handler
  const handleDownload = (filePath: string) => {
    const url = getImageUrl(filePath);
    const link = document.createElement('a');
    link.href = url;
    link.download = filePath.split('/').pop() || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTabConfig = getCurrentTabConfig();
  const availableLanguages = getAvailableLanguages(activeTab);
  const currentImages = getCurrentImages();

  return (
    <div className="image-gallery-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Film className="w-8 h-8" />
          Image Gallery
        </h1>
      </div>

      <div className="gallery-tabs">
        {tabConfigs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`gallery-tab ${activeTab === tab.value ? 'active' : ''}`}
          >
            {tab.label}
            {groupedData[tab.value] && (
              <span className="gallery-tab-count">
                ({Object.values(groupedData[tab.value]).flat().length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="gallery-content">
        {availableLanguages.length > 0 && (
          <div className="language-sidebar">
            <div className="language-sidebar-inner">
              <p className="language-sidebar-title">Language</p>
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={`language-button ${activeLanguage === lang ? 'active' : ''}`}
                >
                  {lang.toUpperCase()}
                  <span className="language-count">
                    ({groupedData[activeTab][lang].length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="gallery-grid-container">
          {currentImages.length === 0 ? (
            <div className="gallery-empty">
              No images available for this selection
            </div>
          ) : (
            <div className={`gallery-grid ${currentTabConfig.gridClass}`}>
              {currentImages.map((image, idx) => (
                <div 
                  key={idx}
                  className={`gallery-image-container ${currentTabConfig.imageClass}`}
                >
                  <img
                    src={getImageUrl(image.file_path)}
                    alt={`${activeTab} ${idx + 1}`}
                    loading="lazy"
                  />
                  {/* 🟢 Overlay Buttons Container */}
                  <div className="image-buttons-overlay">
                    <button
                      className="overlay-btn"
                      title="Download image"
                      onClick={() => handleDownload(image.file_path)}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      className="overlay-btn"
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