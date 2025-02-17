import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import getProgressColor from '../../utils/getProgressColor.js';
import steeringStatus from '../../utils/steeringStatus.js';

const HelmCard = (shipData) => {
  // Helper function to calculate dynamic color
  const getTextColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 75) return 'lime';
    if (percentage > 25) return 'yellow';
    return 'red';
  };

  return (
    <div className="card helm-card">
      <Box className="progress-container">
        <CircularProgress
          variant="determinate"
          value={(shipData.helmControl.hitPoints / shipData.helmControl.maxHP) * 100}
          size={120} // Adjust size to fit the card
          thickness={4} // Adjust thickness for better aesthetics
          style={{
            color: getProgressColor(shipData.helmControl.hitPoints, shipData.helmControl.maxHP),
            position: 'absolute',
          }}
        />
      </Box>
      <h3>Helm</h3>
      <p>
        <strong>✙ Helm HP:</strong>{' '}
        <span
          style={{
            color: getTextColor(shipData.helmControl.hitPoints, shipData.helmControl.maxHP),
          }}
        >
          {shipData.helmControl.hitPoints}
        </span>{' '}
        / {shipData.helmControl.maxHP}
      </p>
      <p>
        <strong>🛡 Armor Class:</strong> {shipData.helmControl.armorClass}
      </p>
      <p>
        <strong>☸ Steering:</strong> <span style={{ color: getTextColor(shipData.helmControl.hitPoints, shipData.helmControl.maxHP) }}>{steeringStatus(shipData.helmControl.hitPoints)}</span>
      </p>
    </div>
  );
};

export default HelmCard;