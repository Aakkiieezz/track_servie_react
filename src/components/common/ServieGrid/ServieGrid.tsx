import React from "react";
import ServieCard from "@/components/common/PosterCard/ServieCard";
import type { Servie } from "@/types/servie";

interface ServieGridProps {
  servies: Servie[];
  blurCompleted?: boolean;
  onWatchChange?: (tmdbId: number, childtype: string, newWatched: boolean) => void;
  fadedKeys?: Set<string>;
  columnsPerRow?: number;
}

const ServieGrid: React.FC<ServieGridProps> = ({
  servies = [],
  blurCompleted = false,
  onWatchChange,
  fadedKeys,
  columnsPerRow = 6
}) => {
  const itemWidth = `${100 / columnsPerRow}%`;
  return (
    <div className="row center">
      {servies.map((servie) => {
        const servieKey = `${servie.childtype}-${servie.tmdbId}`;
        return (
          <div
            key={servieKey}
            style={{ 
              flex: `0 0 ${itemWidth}`,
              maxWidth: itemWidth,
              padding: "0.2%" 
            }}
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