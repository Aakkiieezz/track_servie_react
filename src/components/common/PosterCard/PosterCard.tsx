import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "@/components/common/ProgressBar/ProgressBar";
import styles from "./PosterCard.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PosterCardProps {
  // Identity
  tmdbId: number;
  childtype: "movie" | "tv";
  title: string;
  seasonNo?: number;          // present → season card (skips top bubble)

  // Dates
  releaseDate?: string;
  firstAirDate?: string;
  lastAirDate?: string;

  // Poster
  posterPath?: string | null;

  // State — controlled from outside
  watched: boolean;
  liked: boolean;

  // Progress
  episodesWatched?: number | null;
  totalEpisodes?: number | null;

  // Runtime (season only)
  totalWatchedRuntime?: number | null;
  totalRuntime?: number | null;

  // Popularity
  popularity?: number | null;

  // Blur completed posters
  blurCompleted?: boolean;

  // Callbacks — parent handles all API calls
  onWatchClick: () => void;
  onLikeClick: () => void;
  onOptionsClick: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRuntime(minutes: number): string {
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.length > 0 ? parts.join(" ") : "0m";
}

function buildPosterSrc(posterPath?: string | null): string {
  if (!posterPath) return "https://placehold.co/220x330?text=No+Image";
  return `http://localhost:8080/track-servie/posterImgs_resize220x330_q0.85${posterPath.replace(".jpg", ".webp")}`;
}

function buildPosterFallback(posterPath?: string | null): string {
  if (!posterPath) return "https://placehold.co/220x330?text=No+Image";
  return `https://image.tmdb.org/t/p/original${posterPath}`;
}

function formatYearRange(props: PosterCardProps): string {
  if (props.childtype === "movie") {
    return props.releaseDate
      ? `(${new Date(props.releaseDate).getFullYear()})`
      : "";
  }
  const first = props.firstAirDate ? new Date(props.firstAirDate).getFullYear() : null;
  const last  = props.lastAirDate  ? new Date(props.lastAirDate).getFullYear()  : null;
  const now   = new Date().getFullYear();
  if (!first) return "";
  if (!last)  return `(${first})`;
  return last === now ? `(${first} – present)` : `(${first} – ${last})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PosterCard: React.FC<PosterCardProps> = (props) => {
  const {
    tmdbId, childtype, title, seasonNo,
    posterPath, watched, liked,
    episodesWatched, totalEpisodes,
    totalWatchedRuntime, totalRuntime,
    popularity, blurCompleted = false,
    onWatchClick, onLikeClick, onOptionsClick,
  } = props;

  const isSeason      = seasonNo !== undefined;
  const hasProgress   = episodesWatched != null && totalEpisodes != null;
  const hasRuntime    = totalWatchedRuntime != null && totalRuntime != null;
  const hasPopularity = popularity != null;
  const shouldBlur    = blurCompleted && watched;

  const detailLink  = isSeason ? `/servies/${tmdbId}/Season/${seasonNo}` : "/servie";
  const detailState = isSeason ? undefined : { childType: childtype, tmdbId };

  return (
    <div className={styles.card}>

      {/* ── Glass bubble — title above tile (movie / tv only) ── */}
      {!isSeason && (
        <div className={styles.topBubble}>
          <span className={styles.bubbleTitle}>{title}</span>
          <span className={styles.bubbleYear}>{formatYearRange(props)}</span>
        </div>
      )}

      {/* ── Poster wrapper ── */}
      <div className={styles.posterWrapper}>

        {/* Poster image */}
        <Link to={detailLink} state={detailState}>
          <img
            className={`${styles.poster} ${shouldBlur ? styles.blurred : ""}`}
            src={buildPosterSrc(posterPath)}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = buildPosterFallback(posterPath);
            }}
            alt={title}
          />
        </Link>

        {/* ── Popularity badge — top-right corner, on hover ── */}
        {hasPopularity && (
          <div className={styles.popularityBadge}>
            ★ {popularity!.toFixed(1)}
          </div>
        )}

        {/* ── Progress bar — on hover, only when data present ── */}
        {hasProgress && (
          <div className={styles.progressWrap}>
            <div className={styles.epLabel}>
              {episodesWatched} / {totalEpisodes}
            </div>
            {hasRuntime && (
              <div className={styles.runtimeLabel}>
                {formatRuntime(totalWatchedRuntime!)} / {formatRuntime(totalRuntime!)}
              </div>
            )}
            <ProgressBar
              episodesWatched={episodesWatched!}
              totalEpisodes={totalEpisodes!}
            />
          </div>
        )}

        {/* ── Bottom overlay — eye + heart + three-dots ── */}
        <div className={styles.bottomOverlay}>
          <div className={styles.iconRow}>

            <button
              className={styles.iconBtn}
              onClick={(e) => { e.preventDefault(); onWatchClick(); }}
              title={watched ? "Mark as unwatched" : "Mark as watched"}
            >
              <i className={`bi ${watched ? "bi-eye-fill" : "bi-eye-slash-fill"} ${watched ? styles.eyeOn : styles.eyeOff}`} />
            </button>

            <button
              className={styles.iconBtn}
              onClick={(e) => { e.preventDefault(); onLikeClick(); }}
              title={liked ? "Unlike" : "Like"}
            >
              <i className={`bi bi-suit-heart-fill ${liked ? styles.heartLiked : styles.heartUnliked}`} />
            </button>

            <button
              className={styles.iconBtn}
              onClick={(e) => { e.preventDefault(); onOptionsClick(); }}
              title="More options"
            >
              <i className={`bi bi-three-dots-vertical ${styles.dotsIcon}`} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PosterCard;