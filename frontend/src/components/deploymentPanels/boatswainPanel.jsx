import getDamageColor from '../../utils/getDamageColor';
import PropTypes from 'prop-types';

const BoatswainPanel = ({ shipData, activeRole }) => {
  if (activeRole !== "Boatswain") {
    return null;
  }

  const bowHullColor = getDamageColor(shipData.hull.hullBow, shipData.hull.hullBowMax);
  const portHullColor = getDamageColor(shipData.hull.hullPort, shipData.hull.hullPortMax);
  const starboardHullColor = getDamageColor(shipData.hull.hullStarboard, shipData.hull.hullStarboardMax);
  const sternHullColor = getDamageColor(shipData.hull.hullStern, shipData.hull.hullSternMax);


  const foresailColor = getDamageColor(shipData.movementSails.sailForeHP, shipData.movementSails.sailForeMaxHP);
  const mainsailColor = getDamageColor(shipData.movementSails.sailMainHP, shipData.movementSails.sailMainMaxHP);
  const aftSailColor = getDamageColor(shipData.movementSails.sailAftHP, shipData.movementSails.sailAftMaxHP);

  const helmColor = getDamageColor(shipData.helmControl.hitPoints, shipData.helmControl.maxHP);


  return (
    <div className="role-utility-panel">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 900 240"
        className="ship-damage-report-svg"
        style={{ background: "#00000000" }}
      >
        {/* Bow Hull */}
        <path
          id="Bow"
          d="M220,10 L160,10 C120,10,40,60,40,120 C40,180,120,230,160,230 L220,230"
          fill="none"
          stroke={bowHullColor}
          strokeMiterlimit="1"
          strokeWidth="4"
        />
        <text
          x="55"
          y="120"
          stroke={bowHullColor}
          fill={bowHullColor}
          textAnchor="left"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Bow: {shipData.hull.hullBow} / {shipData.hull.hullBowMax}
        </text>

        {/* Port Hull */}
        <line
          id="Port"
          x1="240"
          y1="230"
          x2="720"
          y2="230"
          fill="none"
          stroke={portHullColor}
          strokeMiterlimit="1"
          strokeWidth="4"
        />
        <text
          x="500"
          y="210"
          stroke={portHullColor}
          fill={portHullColor}
          textAnchor="middle"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Port: {shipData.hull.hullPort} / {shipData.hull.hullPortMax}
        </text>

        {/* Starboard Hull */}
        <line
          id="Starboard"
          x1="240"
          y1="10"
          x2="720"
          y2="10"
          fill="none"
          stroke={starboardHullColor}
          strokeMiterlimit="1"
          strokeWidth="4"
        />
        <text
          x="500"
          y="30"
          stroke={starboardHullColor}
          fill={starboardHullColor}
          textAnchor="middle"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Starboard: {shipData.hull.hullStarboard} / {shipData.hull.hullStarboardMax}
        </text>

        {/* Stern Hull */}
        <path
          id="Stern"
          d="M740,10 H840 C860,10,880,30,880,50 V190 C880,210,860,230,840,230 H740"
          fill="none"
          stroke={sternHullColor}
          strokeMiterlimit="1"
          strokeWidth="4"
        />
        <text
          x="790"
          y="120"
          stroke={sternHullColor}
          fill={sternHullColor}
          textAnchor="right"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Stern: {shipData.hull.hullStern} / {shipData.hull.hullSternMax}
        </text>
        {/* Foresail */}
        <rect
          width="170"
          height="50"
          x="160"
          y="95"
          rx="5"
          ry="5"
          stroke="grey"
          fill="none"
        />
        <circle
          cx="300"
          cy="120"
          r="15"
          fill={foresailColor}
          stroke={foresailColor}
          strokeWidth="1"
        />
        <text
          x="175"
          y="120"
          stroke={foresailColor}
          fill={foresailColor}
          textAnchor="right"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Foresail: {shipData.movementSails.sailForeHP} / {shipData.movementSails.sailForeMaxHP}
        </text>
        {/* Mainsail */}
        <rect
          width="170"
          height="50"
          x="360"
          y="95"
          rx="5"
          ry="5"
          stroke="grey"
          fill="none"
        />
        <circle
          cx="500"
          cy="120"
          r="15"
          fill={mainsailColor}
          stroke={mainsailColor}
          strokeWidth="1"
        />
        <text
          x="375"
          y="120"
          stroke={mainsailColor}
          fill={mainsailColor}
          textAnchor="right"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Mainsail: {shipData.movementSails.sailMainHP} / {shipData.movementSails.sailMainMaxHP}
        </text>
        {/* Aft Sail */}
        <rect
          width="170"
          height="50"
          x="560"
          y="95"
          rx="5"
          ry="5"
          stroke="grey"
          fill="none"
        />
        <circle
          cx="700"
          cy="120"
          r="15"
          fill={aftSailColor}
          stroke={aftSailColor}
          strokeWidth="1"
        />
        <text
          x="575"
          y="120"
          stroke={aftSailColor}
          fill={aftSailColor}
          textAnchor="right"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Aft Sail: {shipData.movementSails.sailAftHP} / {shipData.movementSails.sailAftMaxHP}
        </text>
        {/* Helm */}
        <path
          stroke="grey"
          fill="none"
          d="M745,85 h30 c0,0,5,0,5,5 v60 c0,0,0,5,5,5 h25 c0,0,5,0,5,5 v35 c0,0,0,5,-5,5 h-100 c0,0,-5,0,-5,-5 v-35 c0,0,0,-5,5,-5 h25 c0,0,5,0,5,-5 v-60 c0,0,0,-5,5,-5"
        />
        <rect
          width="20"
          height="50"
          x="750"
          y="95"
          fill="none"
          stroke={helmColor}
          strokeWidth="4"
        />
        <line
          id="helm"
          x1="760"
          y1="105"
          x2="760"
          y2="135"
          stroke={helmColor}
          strokeWidth="4"
        />
        <text
          x="760"
          y="177.5"
          stroke={helmColor}
          fill={helmColor}
          textAnchor="middle"
          dominantBaseline="middle"
          className="ship-svg-text"
        >
          Helm {shipData.helmControl.hitPoints} / {shipData.helmControl.maxHP}
        </text>
      </svg>
    </div>
  )
};
BoatswainPanel.propTypes = {
  shipData: PropTypes.shape({
    hull: PropTypes.shape({
      hullBow: PropTypes.number.isRequired,
      hullBowMax: PropTypes.number.isRequired,
      hullPort: PropTypes.number.isRequired,
      hullPortMax: PropTypes.number.isRequired,
      hullStarboard: PropTypes.number.isRequired,
      hullStarboardMax: PropTypes.number.isRequired,
      hullStern: PropTypes.number.isRequired,
      hullSternMax: PropTypes.number.isRequired,
    }).isRequired,
    movementSails: PropTypes.shape({
      sailForeHP: PropTypes.number.isRequired,
      sailForeMaxHP: PropTypes.number.isRequired,
      sailMainHP: PropTypes.number.isRequired,
      sailMainMaxHP: PropTypes.number.isRequired,
      sailAftHP: PropTypes.number.isRequired,
      sailAftMaxHP: PropTypes.number.isRequired,
    }).isRequired,
    helmControl: PropTypes.shape({
      hitPoints: PropTypes.number.isRequired,
      maxHP: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  activeRole: PropTypes.string.isRequired,
};

export default BoatswainPanel;