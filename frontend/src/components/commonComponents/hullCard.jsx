import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import getProgressColor from '../../utils/getProgressColor.js';

const HullCard = (shipData) => {
  const getTextColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 75) return 'lime';
    if (percentage > 25) return 'yellow';
    return 'red';
  };

  const hullHP = shipData.hull.hullBow + shipData.hull.hullPort + shipData.hull.hullStarboard + shipData.hull.hullStern;
  const hullMaxHP = shipData.hull.hullBowMax + shipData.hull.hullPortMax + shipData.hull.hullStarboardMax + shipData.hull.hullSternMax;

  return (
    <div className="card hull-card">
      <Box className="progress-container">
        <CircularProgress
          variant="determinate"
          value={(hullHP / hullMaxHP) * 100}
          size={120}
          thickness={4}
          style={{
            color: getProgressColor(hullHP, hullMaxHP),
            position: 'absolute',
          }}
        />
      </Box>
      <h3>Hull</h3>
      <p>
        <strong>✙ Hull HP:</strong>{' '}
        <span style={{ color: getTextColor(hullHP, hullMaxHP) }}>
          {hullHP}
        </span>{' '}
        / {hullMaxHP}
      </p>
      <p>
        <strong>🛡 Armor Class:</strong> {shipData.hull.armorClass}
      </p>
      <p>
        <strong>⚔ Damage Threshold:</strong> {shipData.hull.damageThreshold}
      </p>
    </div>
  );
};

export default HullCard;