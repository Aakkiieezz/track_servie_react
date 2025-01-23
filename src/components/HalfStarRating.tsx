import React, { useState } from "react";

interface HalfStarRatingProps {
  maxStars?: number;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

const HalfStarRating: React.FC<HalfStarRatingProps> = ({
  maxStars = 5,
  initialRating = 0,
  onRatingChange,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [rating, setRating] = useState(initialRating);
  const [showRemove, setShowRemove] = useState(false);

  const handleMouseOver = (value: number) => {
    setHoverRating(value);
  };

  const handleClick = (value: number) => {
    setRating(value);
    if (onRatingChange) onRatingChange(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(null); // Reset hover state when mouse leaves the stars
    setShowRemove(false); // Hide cross button
  };

  const handleRemoveRating = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent interference with star clicks
    setRating(0); // Reset rating to 0
    setHoverRating(null); // Ensure stars are cleared visually
    if (onRatingChange) onRatingChange(0); // Notify parent of the reset
    setShowRemove(false); // Hide the cross button
  };

  return (
    <div
      className="half-star-rating"
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: `${maxStars * 24}px`, // Restrict the total width to star count
      }}
      onMouseLeave={handleMouseLeave} // Reset hover state on mouse leave
    >
      {/* Hidden Cross Button */}
      {showRemove && initialRating > 0 && (
        <span
          onClick={handleRemoveRating}
          style={{
            position: "absolute",
            left: "-24px", // Slightly left of the first star
            zIndex: 10, // Ensure click priority
          }}
        >
          <i
            className="bi bi-x"
            style={{
              color: "white", // White cross icon
              fontSize: "15px", // Smaller cross size
              backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background
              borderRadius: "50%", // Make it circular
              width: "17px", // Fixed width and height for circle
              height: "17px", // Fixed width and height for circle
              display: "flex", // Center the icon inside the circle
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer", // Pointer cursor on hover
            }}
          ></i>
        </span>
      )}
      {/* Stars */}
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              position: "relative",
              fontSize: "24px", // Fixed star size
              cursor: "pointer",
              width: "24px", // Restrict each star's hover area
            }}
            onMouseEnter={() => {
              if (index === 0) setShowRemove(false); // Hide cross when hovering on the first star
              handleMouseOver(starValue);
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              if (mouseX < 12) {
                // If mouse is on the left half of the star
                handleMouseOver(starValue - 0.5);
              } else {
                // If mouse is on the right half of the star
                handleMouseOver(starValue);
              }
            }}
          >
            {/* Full Star */}
            <span
              onClick={() => handleClick(starValue)}
              style={{
                color: (hoverRating ?? rating) >= starValue ? "gold" : "lightgray",
                zIndex: 1,
              }}
            >
              ★
            </span>
            {/* Half Star Overlay */}
            <span
              onClick={() => handleClick(starValue - 0.5)}
              style={{
                color: (hoverRating ?? rating) >= starValue - 0.5 ? "gold" : "lightgray",
                position: "absolute",
                width: "50%",
                overflow: "hidden",
                zIndex: 2,
              }}
            >
              ★
            </span>
          </div>
        );
      })}
      {/* Trigger Area for Cross Button */}
      <div
        onMouseEnter={() => setShowRemove(true)} // Show cross when hovering here
        style={{
          width: "12px", // Half the width of a star
          height: "24px", // Match the height of the star
          position: "absolute",
          left: "-24px", // Slightly left of the first star
          top: "0",
          zIndex: 3,
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default HalfStarRating;
