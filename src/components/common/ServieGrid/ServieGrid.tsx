import React from "react";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { Servie } from "@/types/servie";

interface ServieGridProps {
  servies: Servie[];
  blurCompleted?: boolean;
  onWatchChange?: (tmdbId: number, childtype: string, newWatched: boolean) => void;
}

const ServieGrid: React.FC<ServieGridProps> = ({ servies = [], blurCompleted = false, onWatchChange }) => {
  return (
    <div className="row center">
      {servies.map((servie) => (
        <div
          key={`${servie.childtype}-${servie.tmdbId}`}
          className="col-xxl-1 col-sm-2 col-3"
          style={{ padding: "0.2%" }}
        >
          <ServieCard
            servie={servie}
            blurCompleted={blurCompleted}
            onWatchChange={onWatchChange}
          />
        </div>
      ))}
    </div>
  );
};

export default ServieGrid;