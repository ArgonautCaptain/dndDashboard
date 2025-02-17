import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import getProgressColor from '../../utils/getProgressColor.js';
import calculatedSpeed from '../../utils/calculatedSpeed.js';

const SailsCard = (shipData) => {
  // Helper function to calculate dynamic color
  const getTextColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 75) return 'lime';
    if (percentage > 25) return 'yellow';
    return 'red';
  };

  const getSpeedColor = (speed) => {
    if (speed > 40) return 'lime'; // High speed (e.g., green)
    if (speed > 20) return 'yellow'; // Moderate speed
    return 'red'; // Low speed
  };

  const sailsCurrentHP = shipData.movementSails.sailForeHP + shipData.movementSails.sailMainHP + shipData.movementSails.sailAftHP;

  const sailsMaxHP = shipData.movementSails.sailForeMaxHP + shipData.movementSails.sailMainMaxHP + shipData.movementSails.sailAftMaxHP;

  return (
    <div className="card sails-card">
      <Box className="progress-container">
        <CircularProgress
          variant="determinate"
          value={(sailsCurrentHP / sailsMaxHP) * 100}
          size={120}
          thickness={4}
          style={{
            color: getProgressColor(sailsCurrentHP, sailsMaxHP),
            position: 'absolute',
          }}
        />
      </Box>
      <h3>Sails</h3>
      <p>
        <strong>✙ Sails HP:</strong>{' '}
        <span
          style={{
            color: getTextColor(sailsCurrentHP, sailsMaxHP),
          }}
        >
          {sailsCurrentHP}
        </span>{' '}
        / {sailsMaxHP}
      </p>
      <p>
        <strong>🛡 Armor Class:</strong> {shipData.movementSails.armorClass}
      </p>
      <p>
        <strong>𓊝 Sailing Speed:</strong>{' '}
        <span
          style={{
            color: getSpeedColor(
              calculatedSpeed(shipData.movementSails.speed, sailsCurrentHP, sailsMaxHP)
            ),
          }}
        >
          {calculatedSpeed(shipData.movementSails.speed, sailsCurrentHP, sailsMaxHP)} ft.
        </span>
      </p>
    </div>
  );
};

export default SailsCard;