import PropTypes from 'prop-types';

const CrewCard = (shipData) => {
  const commandCrewOnboard = shipData.soulsOnboard.commandCrew || 0;
  const shipMaxCommandCrew = shipData.soulsOnboard.maxCommandCrew || 0;
  const navCrewOnboard = shipData.soulsOnboard.navCrew || 0;
  const shipMaxNavCrew = shipData.soulsOnboard.maxNavCrew || 0;
  const weaponsCrewOnboard = shipData.soulsOnboard.weaponsCrew || 0;
  const shipMaxWeaponsCrew = shipData.soulsOnboard.maxWeaponsCrew || 0;
  const miscCrewOnboard = shipData.soulsOnboard.miscCrew || 0;
  const shipMaxMiscCrew = shipData.soulsOnboard.maxMiscCrew || 0;
  const shipMaxCrew = shipData.soulsOnboard.maxCrew || 0;

  // Calculate total crew onboard
  const totalCrewOnboard = commandCrewOnboard + navCrewOnboard + weaponsCrewOnboard + miscCrewOnboard;

  // Helper function to calculate color based on percentage
  const getCrewColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'lime';
    if (percentage >= 50) return 'yellow';
    return 'red';
  };

  const getCrewMorale = () => {
    if (!shipData?.soulsOnboard?.crewMorale) return '0'; // Handle missing data gracefully

    const crewMorale = shipData.soulsOnboard.crewMorale;
    return crewMorale > 0 ? `+${crewMorale}` : `${crewMorale}`;
  };

  const getMoraleClass = (crewMorale) => {
    if (crewMorale >= 6 && crewMorale <= 10) return 'morale-green';
    if (crewMorale >= 1 && crewMorale <= 5) return 'morale-lime';
    if (crewMorale === 0) return 'morale-yellow';
    if (crewMorale >= -5 && crewMorale <= -1) return 'morale-orange';
    if (crewMorale >= -10 && crewMorale <= -6) return 'morale-red';
    return ''; // Default class if out of range or undefined
  };

  const LineGraphWithGradient = ({ morale }) => {
    const normalizedMorale = Math.min(Math.max(morale, -10), 10); // Clamp morale to -10 to 10
    const position = ((normalizedMorale + 10) / 20) * 100; // Normalize to a percentage

    const getMoraleColor = (moraleValue) => {
      if (moraleValue >= 6) return "green";
      if (moraleValue >= 1) return "lime";
      if (moraleValue === 0) return "yellow";
      if (moraleValue >= -5) return "orange";
      return "red";
    };

    const moraleColor = getMoraleColor(normalizedMorale);

    return (
      <svg className="line-graph" width="100%" height="30" viewBox="0 0 100 10" style={{ display: "block", margin: "20px auto" }}>
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="moraleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "red", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "yellow", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "green", stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Line */}
        <rect x="0" y="4.5" width="100" height="1" fill="url(#moraleGradient)" />

        {/* Circle Marker */}
        <circle
          cx={position}
          cy="5"
          r="3"
          fill={moraleColor}
          stroke="white"
          strokeWidth="0.5"
        />

        {/* Labels */}
        <text x="0" y="9" fontSize="1" textAnchor="middle" fill="black">-10</text>
        <text x="50" y="9" fontSize="1" textAnchor="middle" fill="black">0</text>
        <text x="100" y="9" fontSize="1" textAnchor="middle" fill="black">10</text>
      </svg>
    );
  };

  LineGraphWithGradient.propTypes = {
    morale: PropTypes.number.isRequired,
  };

  return (
    <div className="card crew-card">
      <h3>Crew Info</h3>
      <p>
        <strong>Command Crew:</strong>{' '}
        <span style={{ color: getCrewColor(commandCrewOnboard, shipMaxCommandCrew) }}>
          {commandCrewOnboard}
        </span>{' '}
        / {shipMaxCommandCrew}
      </p>
      <p>
        <strong>Navigation Crew:</strong>{' '}
        <span style={{ color: getCrewColor(navCrewOnboard, shipMaxNavCrew) }}>
          {navCrewOnboard}
        </span>{' '}
        / {shipMaxNavCrew}
      </p>
      <p>
        <strong>Weapons Crew:</strong>{' '}
        <span style={{ color: getCrewColor(weaponsCrewOnboard, shipMaxWeaponsCrew) }}>
          {weaponsCrewOnboard}
        </span>{' '}
        / {shipMaxWeaponsCrew}
      </p>
      <p>
        <strong>Miscellaneous Crew:</strong>{' '}
        <span style={{ color: getCrewColor(miscCrewOnboard, shipMaxMiscCrew) }}>
          {miscCrewOnboard}
        </span>{' '}
        / {shipMaxMiscCrew}
      </p>
      <br />
      <p>
        <strong>TOTAL CREW:</strong>{' '}
        <span style={{ color: getCrewColor(totalCrewOnboard, shipMaxCrew) }}>
          {totalCrewOnboard}
        </span>{' '}
        / {shipMaxCrew}
      </p>
      <hr />
      <h3>
        Crew Morale Score:
      </h3>
      <div className="centered-in-card">
        <div className={`morale-display ${getMoraleClass(shipData.soulsOnboard.crewMorale || 0)}`}>
          {getCrewMorale()}
        </div>
        <LineGraphWithGradient morale={shipData.soulsOnboard.crewMorale || 0} />
      </div>
    </div>
  );
};

export default CrewCard;