import React from "react";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { Servie } from "@/types/servie";

interface ServieGridProps {
  servies: Servie[];
  blurCompleted?: boolean;
  onWatchChange?: (tmdbId: number, childtype: string, newWatched: boolean) => void;
  fadedKeys?: Set<string>;
}

const ServieGrid: React.FC<ServieGridProps> = ({
  servies = [],
  blurCompleted = false,
  onWatchChange,
  fadedKeys,
}) => {
  return (
    <div className="row center">
      {servies.map((servie) => {
        const servieKey = `${servie.childtype}-${servie.tmdbId}`;
        return (
          <div
            key={servieKey}
            className="col-xxl-1 col-sm-2 col-3"
            style={{ padding: "0.2%" }}
          >
            <ServieCard
              servie={servie}
              blurCompleted={blurCompleted}
              onWatchChange={onWatchChange}
              faded={fadedKeys?.has(servieKey) ?? false}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ServieGrid;