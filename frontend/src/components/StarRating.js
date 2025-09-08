import React from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'medium', 
  interactive = false,
  showValue = false 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'text-gray-300';
      
      if (i <= fullStars) {
        starClass = 'text-yellow-400';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass = 'text-yellow-400';
      }

      if (interactive) {
        starClass += ' cursor-pointer hover:text-yellow-500 transition-colors duration-150';
      }

      stars.push(
        <FiStar
          key={i}
          className={`${sizeClasses[size]} ${starClass}`}
          onClick={() => handleStarClick(i)}
          style={{
            fill: i <= fullStars || (i === fullStars + 1 && hasHalfStar) ? 'currentColor' : 'none'
          }}
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {renderStars()}
      </div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
