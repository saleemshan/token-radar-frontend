import React from 'react';
import { TbBadgeFilled } from 'react-icons/tb';

const RankBadge = ({ rank }: { rank: number }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) {
      return '#FFD70095'; // Gold
    }
    if (rank === 2) {
      return '#C0C0C095'; // Silver
    }
    if (rank === 3) {
      return '#CD7F3295'; // Bronze
    }

    return 'transparent';
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute text-2xs">{rank}</div>
      <TbBadgeFilled
        className="text-2xl"
        style={{ color: getRankColor(rank) }}
      />
    </div>
  );
};

export default RankBadge;
