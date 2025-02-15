import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { Box } from '@mui/material';
import deploymentFeatures from '../data/deploymentFeatures.json'
import TSAbilityRollSpan from '../components/tsAbilityRollSpan';
import { keyframes } from "@mui/system";
import { Button } from '@mui/material';


const ShipDashboard = () => {
  const [shipData, setShipData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const [orders, setOrders] = useState([]); // Empty orders list
  const [attackModalOpen, setAttackModalOpen] = useState(false);


  // Real-time listener for Firestore updates
  useEffect(() => {
    const shipRef = doc(db, 'ships', 'scarlet-fury');

    const unsubscribe = onSnapshot(shipRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setShipData(data);

        // Dynamically create roles array with ranks from shipData
        const updatedRoles = [
          { name: 'First Mate', id: '135428623', roleIdentifier: 'firstMate' },
          { name: 'Comms Officer', id: '92996621', roleIdentifier: 'commsOfficer' },
          { name: 'Boatswain', id: '135429531', roleIdentifier: 'boatswain' },
          { name: 'Quartermaster', id: '45298843', roleIdentifier: 'quartermaster' },
          { name: 'Lookout', id: '135427111', roleIdentifier: 'lookout' },
          { name: 'Master Gunner', id: '135431531', roleIdentifier: 'masterGunner' },
          /*           { name: 'Captain', id: '136228181', roleIdentifier: 'captain' },
                    { name: 'Personnel Officer', id: '136437805', roleIdentifier: 'personnelOfficer' }, */
        ].map(role => ({
          ...role,
          rank: data.officerRanks[role.roleIdentifier] || 1, // Fallback to 1 if no rank found
          features: deploymentFeatures.shipDeploymentRoles[role.roleIdentifier]?.feats || []
        }));

        setRoles(updatedRoles);
      } else {
        console.error('No such document!');
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  const weaponsActionsPerTurn = shipData ? shipData.gunnerOrders.actionsCurrentTotal : 0;
  const weaponsActionsRemaining = shipData ? shipData.gunnerOrders.actionsRemaining : 0;

  // Calculate ship sailing speed
  const calculatedSpeed = (baseSpeed, currentHP, maxHP) => {
    if (currentHP === 0) {
      return 0; // If sails HP is 0, speed is 0
    }

    const reducedSpeed = baseSpeed - Math.floor((maxHP - currentHP) / 25) * 5;
    return Math.max(reducedSpeed, 0); // Ensure speed is never negative
  };

  // Calculate ability modifiers
  const calculateModifier = (score) => {
    if (score === 0) {
      return "N/A";
    }
    return Math.floor((score - 10) / 2);
  };

  const commandDiceCard = () => {
    //TODO: MAKE THE BUTTON POP UP A CONFIRMATION MODAL AND THEN HAVE IT SUBTRACT A COMMAND DIE FROM FIREBASE ("Are you sure you want to use a command die? You will have x remaining")
    //TODO: MAKE THE FORMATTING OF THE BUTTON BETTER
    return (
      <div className="card command-dice-card">
        <h3>Command Dice</h3>
        <p><strong>Type:</strong> d{shipData.shipDice.commandDiceType}</p>
        <p><strong>Current Command Dice:</strong> {shipData.shipDice.commandDiceLeft} / {shipData.shipDice.commandDiceMax}</p>
        {/* <button className="centered-in-card">Roll Command Die!</button> */}
      </div>
    )
  }

  const hullDiceCard = () => {
    //TODO: SAME AS COMMAND DICE CARD
    return (
      <div className="card hull-dice-card">
        <h3>Hull Dice</h3>
        <p><strong>Type:</strong> d{shipData.shipDice.hullDiceType}</p>
        <p><strong>Current Hull Dice:</strong> {shipData.shipDice.hullDiceLeft} / {shipData.shipDice.hullDiceMax}</p>
        {/* <button className="centered-in-card">Roll Hull Die!</button> */}
      </div>
    )
  }

  const characterDataCard = () => {
    return (
      <div className="card character-data-card">
        {characterData ? (
          <>
            {/* Character Name as Header */}
            <h3 className="character-name-header">{characterData.name}</h3>

            {/* Grid with Two Columns */}

            {/* Left Column */}
            <div className="character-info">
              <div><strong>Deployment Role:</strong> {activeRole}</div>
              <div><strong>Deployment Rank:</strong> {roles.find((role) => role.name === activeRole)?.rank || 'Unknown'}</div>
            </div>
            <hr />
            {/* Right Column */}
            <div className="character-scores-grid">
              {Object.entries(characterData.stats).map(([ability, score]) => {
                const modifier = Math.floor((score - 10) / 2);
                const modifierString = typeof modifier === 'number' ? (modifier >= 0 ? `+${modifier}` : `${modifier}`) : 'N/A';
                return (
                  <div key={ability} className="character-score-card">
                    <p className="character-score-name">{ability}</p>
                    <p className="character-score-modifier">
                      {modifierString}
                    </p>
                    <p className="character-score-value">{score}</p>
                  </div>
                );
              })}
            </div>

          </>
        ) : (
          <p>Loading character data...</p>
        )}
      </div>
    )
  }


  const crewCard = (
    commandCrewOnboard,
    shipMaxCommandCrew,
    navCrewOnboard,
    shipMaxNavCrew,
    weaponsCrewOnboard,
    shipMaxWeaponsCrew,
    miscCrewOnboard,
    shipMaxMiscCrew,
    shipMaxCrew
  ) => {
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

  const fetchCharacterStats = async (characterId) => {
    try {
      const response = await fetch(
        `https://dnddashboard-backend.onrender.com/proxy/https://character-service.dndbeyond.com/character/v5/character/${characterId}`
      );
      const characterData = await response.json();

      // Log the full response for debugging
      // console.log('Character Data:', characterData);

      if (!characterData.data || !characterData.data.stats) {
        throw new Error('Stats data is missing in the API response.');
      }

      // Extract character name
      const characterName = characterData.data.name || 'Unknown Character';

      // Extract base stats
      const baseStats = characterData.data.stats.reduce((acc, stat) => {
        acc[stat.id] = stat.value;
        return acc;
      }, {});
      // console.log('Base Stats:', baseStats);

      // Map subType strings to stat IDs
      const subTypeToStatId = {
        'strength-score': 1,
        'dexterity-score': 2,
        'constitution-score': 3,
        'intelligence-score': 4,
        'wisdom-score': 5,
        'charisma-score': 6,
      };

      // Extract all modifiers
      const allModifiers = [
        ...(characterData.data.modifiers.race || []),
        ...(characterData.data.modifiers.class || []),
        ...(characterData.data.modifiers.background || []),
        ...(characterData.data.modifiers.feat || []),
        ...(characterData.data.modifiers.item || []),
        ...(characterData.data.modifiers.condition || []),
      ];
      // console.log('All Modifiers:', allModifiers);

      // Filter and process ability score modifiers
      const filteredModifiers = allModifiers.filter(
        (mod) => mod.type === 'bonus' && subTypeToStatId[mod.subType]
      );
      // console.log('Filtered Modifiers:', filteredModifiers);

      // Calculate bonuses for each stat
      const statBonuses = {};
      filteredModifiers.forEach((mod) => {
        const statId = subTypeToStatId[mod.subType];
        if (!statBonuses[statId]) statBonuses[statId] = 0;
        statBonuses[statId] += mod.value || 0;

        // Log detailed modifier info for debugging
        // console.log(`Modifier Applied: StatID ${statId}, Value ${mod.value}, Source: ${mod.componentId}`);
      });
      // console.log('Stat Bonuses:', statBonuses);

      // Combine base stats and bonuses
      const finalStats = {};
      for (let statId in baseStats) {
        finalStats[statId] = (baseStats[statId] || 0) + (statBonuses[statId] || 0);

        // Log the calculation step for debugging
        // console.log(`Final Stat Calculation: StatID ${statId}, Base ${baseStats[statId]}, Bonus ${statBonuses[statId] || 0}`);
      }
      // console.log('Final Stats:', finalStats);

      return {
        name: characterName,
        stats: {
          STR: finalStats[1] || 0,
          DEX: finalStats[2] || 0,
          CON: finalStats[3] || 0,
          INT: finalStats[4] || 0,
          WIS: finalStats[5] || 0,
          CHA: finalStats[6] || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching character stats:', error);
      return null;
    }
  };

  // Progress wheel dynamic color
  const getProgressColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;

    if (percentage > 75) {
      return '#00ff00';
    } else if (percentage > 25) {
      return '#ffff00';
    } else {
      return '#ff0000';
    }
  };

  const helmCard = () => {
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

  const hullCard = () => {
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


  const sailsCard = () => {
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

  const shipTopBar = () => {
    return (
      <div className="top-bar">
        <h1>{shipData.name}</h1>
        <p>
          <strong>Size:</strong> {shipData.size} | <strong>Creature Capacity:</strong> {shipData.creatureCapacity} |{' '}
          <strong>Cargo Capacity:</strong> {shipData.cargoCapacity} | <strong>Travel Pace:</strong> {shipData.travelPace}
        </p>
      </div>
    )
  };

  const shipAbilityScoresCard = () => {
    return (
      <div className="card ability-scores">
        <h3>Ship Ability Scores</h3>
        <div className="scores-grid">
          {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((score) => {
            const modifier = calculateModifier(shipData.abilityScores[score]);
            const modifierString = typeof modifier === 'number' ? (modifier >= 0 ? `+${modifier}` : `${modifier}`) : 'N/A';
            return (
              <div key={score} className="score-card">
                <p className="score-name">{score}</p>
                <TSAbilityRollSpan abilityName={score} modifierValue={modifierString}>
                  <p className="score-modifier">
                    {modifierString}
                  </p>
                </TSAbilityRollSpan>
                <p className="score-value">{shipData.abilityScores[score]}</p>
              </div>
            );
          })}
        </div>
      </div>
    )
  };

  const shipSavingThrowsCard = () => {
    return (
      <div className="card saving-throws-card">
        <h3>Ship Saving Throws</h3>
        <div className="saving-throws-grid">
          {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((score, index) => {
            const modifier = calculateModifier(shipData.abilityScores[score]);
            const modifierString = typeof modifier === 'number' ? (modifier >= 0 ? `+${modifier}` : `${modifier}`) : 'FAIL';

            return (
              <div key={score} className={`saving-throw ${index % 2 === 0 ? "left" : "right"}`}>
                <span>{score}</span>
                <TSAbilityRollSpan abilityName={score} abilitySuffix={"Saving%20Throw"} modifierValue={modifierString}>
                  {modifierString}
                </TSAbilityRollSpan>
              </div>
            );
          })}
        </div>
      </div>
    )
  };

  // Steering status
  const steeringStatus = (helmHP) => {
    if (helmHP === 0) {
      return "Non-functional";
    }
    return "Functional";
  };

  // State to track the active role and ability scores
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || 'First Mate'; // Default to 'First Mate' if no value in localStorage
  });

  const handleActiveRoleChange = (roleName) => {
    setActiveRole(roleName);
    localStorage.setItem('activeRole', roleName);
  };

  const [characterData, setCharacterData] = useState(null);

  // Fetch character data dynamically when roles and activeRole are ready
  useEffect(() => {
    const fetchData = async () => {
      if (roles.length > 0 && activeRole) {
        const activeRoleData = roles.find((role) => role.name === activeRole);
        if (activeRoleData && activeRoleData.id) {
          const stats = await fetchCharacterStats(activeRoleData.id);
          setCharacterData(stats);
        }
        // console.log('Active Role:', activeRole);
      }
    };

    fetchData();
  }, [activeRole, roles]); // Dependency includes roles to ensure it's populated

  // Find the features for the active role
  const activeFeatures = roles.find((role) => role.name === activeRole)?.features || [];




  const getRolePanelTitle = (role) => {
    switch (role) {
      case 'First Mate':
        return 'Helm Control Panel';
      case 'Comms Officer':
        return 'Speaking Stone Panel';
      case 'Boatswain':
        return 'Damage Report Panel';
      case 'Quartermaster':
        return 'Ship Manifest Panel';
      case 'Lookout':
        return 'Lookout Placeholder Panel';
      case 'Master Gunner':
        return 'Weapons Panel';
      case 'Captain':
        return 'Captain Placeholder Panel';
      case 'Personnel Officer':
        return 'Personnel Officer Placeholder Panel';
      default:
        return 'Role Panel';
    }
  };

  const getDamageColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 99) return 'lime';
    if (percentage > 49) return 'yellow';
    return 'red';
  };

  const boatswainPanel = () => {
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
          width="900px"
          height="240px"
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

  const boatswainActionsPanel = () => {
    return (
      <div className="role-actions-panel">
        <h4>Actions Panel</h4>
        <p>This is the Boatswain actions panel.</p>
        <h1>Coming Soon</h1>
      </div>
    );
  };

  if (!shipData) {
    return <p>Loading ship stats...</p>;
  }

  const totalBallistaeBoltsStandard = shipData.weapons.ballistae.ammo.boltStandard.ammoStored;
  const totalCannonballsStandard = shipData.weapons.cannons.ammo.cannonballStandard.ammoStored;
  /*
    const totalMangonelStonesStandard = shipData.weapons.mangonels.ammo.mangonelStoneStandard.ammoStored;
    const totalTrebuchetStonesStandard = shipData.weapons.trebuchets.ammo.trebuchetStoneStandard.ammoStored;
   */
  const mainDeckBallistaePort = shipData.weapons.ballistae.mainDeck.portSide.weaponData.length;
  const mainDeckBallistaeStarboard = shipData.weapons.ballistae.mainDeck.starboardSide.weaponData.length;
  const lowerDeckBallistaePort = shipData.weapons.ballistae.lowerDeck.portSide.weaponData.length;
  const lowerDeckBallistaeStarboard = shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData.length;
  const mainDeckCannonsPort = shipData.weapons.cannons.mainDeck.portSide.weaponData.length;
  const mainDeckCannonsStarboard = shipData.weapons.cannons.mainDeck.starboardSide.weaponData.length;
  const lowerDeckCannonsPort = shipData.weapons.cannons.lowerDeck.portSide.weaponData.length;
  const lowerDeckCannonsStarboard = shipData.weapons.cannons.lowerDeck.starboardSide.weaponData.length;
  const mainDeckMangonelsPort = shipData.weapons.mangonels.mainDeck.portSide.weaponData.length;
  const mainDeckMangonelsStarboard = shipData.weapons.mangonels.mainDeck.starboardSide.weaponData.length;
  const mainDeckTrebuchetsPort = shipData.weapons.trebuchets.mainDeck.portSide.weaponData.length;
  const mainDeckTrebuchetsStarboard = shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData.length;
  const totalBallistae = mainDeckBallistaePort + mainDeckBallistaeStarboard + lowerDeckBallistaePort + lowerDeckBallistaeStarboard;
  const totalCannons = mainDeckCannonsPort + mainDeckCannonsStarboard + lowerDeckCannonsPort + lowerDeckCannonsStarboard;


  /*
    const totalMangonels = mainDeckMangonelsPort + mainDeckMangonelsStarboard;
    const totalTrebuchets = mainDeckTrebuchetsPort + mainDeckTrebuchetsStarboard;
    */

  const ballistaeNormalRange = shipData.weapons.ballistae.statBlock.normalRange;
  const ballistaeMaxRange = shipData.weapons.ballistae.statBlock.maxRange;
  const cannonsNormalRange = shipData.weapons.cannons.statBlock.normalRange;
  const cannonsMaxRange = shipData.weapons.cannons.statBlock.maxRange;
  const mainDeckWeaponsPort = mainDeckBallistaePort + mainDeckCannonsPort + mainDeckMangonelsPort + mainDeckTrebuchetsPort;
  const mainDeckWeaponsStarboard = mainDeckBallistaeStarboard + mainDeckCannonsStarboard + mainDeckMangonelsStarboard + mainDeckTrebuchetsStarboard;
  const lowerDeckWeaponsPort = lowerDeckBallistaePort + lowerDeckCannonsPort;
  const lowerDeckWeaponsStarboard = lowerDeckBallistaeStarboard + lowerDeckCannonsStarboard;

  const ballistaWeaponStats = () => {
    return (
      <>
        <h4>
          Ballista
        </h4>
        <p>
          <strong>Armor Class:</strong> {shipData.weapons.ballistae.statBlock.armorClass}
        </p>
        <p>
          <strong>Range:</strong> {ballistaeNormalRange} / {ballistaeMaxRange} ft.
        </p>
        <p className="ammo-description">
          <strong>Ballista Bolt:</strong> +{shipData.weapons.ballistae.ammo.boltStandard.toHit} to hit, {shipData.weapons.ballistae.ammo.boltStandard.damageDiceNumber}d{shipData.weapons.ballistae.ammo.boltStandard.damageDiceType} damage
        </p>
      </>
    )
  };

  const cannonWeaponStats = () => {
    return (
      <>
        <h4>
          Cannon
        </h4>
        <p>
          <strong>Armor Class:</strong> {shipData.weapons.cannons.statBlock.armorClass}
        </p>
        <p>
          <strong>Range:</strong> {cannonsNormalRange} / {cannonsMaxRange} ft.
        </p>
        <p className="ammo-description">
          <strong>Cannonball:</strong> +{shipData.weapons.cannons.ammo.cannonballStandard.toHit} to hit, {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceNumber}d{shipData.weapons.cannons.ammo.cannonballStandard.damageDiceType} damage
        </p>
      </>
    )
  };

  const xOffsetTracker = {
    main: { port: 0, starboard: 0 },
    lower: { port: 0, starboard: 0 },
  };

  const renderWeapons = (weaponData, deck, side, type) => {
    const isPort = side === "port";
    const isMainDeck = deck === "main";
    const initialOffset = (30 * (6 - (isMainDeck ? (isPort ? mainDeckWeaponsPort : mainDeckWeaponsStarboard) : (isPort ? lowerDeckWeaponsPort : lowerDeckWeaponsStarboard))));
    const startX = 250 + initialOffset + xOffsetTracker[deck][side];
    const startY = isMainDeck ? (isPort ? 162 : -7) : (isPort ? 162 : -7);
    const iconSpacing = 80;
    const width = 65;
    const height = 80;
    const viewBox = type === "cannon" ? "0 0 31 84" : "0 0 78 65";

    const icons = weaponData.map((weapon, i) => {
      const fillColor = weapon.isLoaded ? "lime" : "red";
      const textColor = "white";
      const xOffset = startX + i * iconSpacing;
      const yOffset = startY;

      const tooltipContent = type === "ballista" ? (
        <>
          <h3 style={{ margin: 0 }}>Ballista</h3>
          <p>
            <strong>Armor Class:</strong> {shipData.weapons.ballistae.statBlock.armorClass}
          </p>
          <p>
            <strong>Range:</strong> {ballistaeNormalRange}/{ballistaeMaxRange} ft.
          </p>
          <p>
            <strong>Damage:</strong> +{shipData.weapons.ballistae.ammo.boltStandard.toHit} to hit,{" "}
            {shipData.weapons.ballistae.ammo.boltStandard.damageDiceNumber}d
            {shipData.weapons.ballistae.ammo.boltStandard.damageDiceType}
          </p>
          <p>
            <strong>Loaded:</strong>{" "}
            <span
              style={{
                color: weapon.isLoaded ? "lime" : "red",
                fontWeight: "bold",
              }}
            >
              {weapon.isLoaded ? "Yes" : "No"}
            </span>
          </p>
        </>
      ) : (
        <>
          <h3 style={{ margin: 0 }}>Cannon</h3>
          <p>
            <strong>Armor Class:</strong> {shipData.weapons.cannons.statBlock.armorClass}
          </p>
          <p>
            <strong>Range:</strong> {cannonsNormalRange}/{cannonsMaxRange} ft.
          </p>
          <p>
            <strong>Damage:</strong> +{shipData.weapons.cannons.ammo.cannonballStandard.toHit} to hit,{" "}
            {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceNumber}d
            {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceType}
          </p>
          <p>
            <strong>Loaded:</strong>{" "}
            <span
              style={{
                color: weapon.isLoaded ? "lime" : "red",
                fontWeight: "bold",
              }}
            >
              {weapon.isLoaded ? "Yes" : "No"}
            </span>
          </p>
        </>
      );


      return (
        <Tooltip key={`${deck}-${side}-${i}`} title={<pre className="weapon-tooltip">{tooltipContent}</pre>} arrow placement="top">
          <g
            className={`weapon-group ${weapon.hasOrders ? 'active-weapon' : ''}`}
            style={{ cursor: "pointer", height: height, width: width }}
            onClick={() => {
              addOrder(
                weapon.isLoaded ? "Fire" : "Reload",
                type === "cannon" ? "Cannon" : "Ballista",
                type === "cannon" ? "cannons" : "ballistae",
                `${deck.charAt(0).toUpperCase() + deck.slice(1)} Deck ${side.charAt(0).toUpperCase() + side.slice(1)}`,
                `${deck + "Deck"}`,
                `${side + "Side"}`,
                i
              );

            }}
          >

            <rect
              x={xOffset - 5}
              y={yOffset - 5}
              width={width + 20}
              height={height + 20}
              fill="transparent"
              pointerEvents="visible"
              className="weapon-icon"
            />
            <svg
              x={xOffset}
              y={yOffset}
              width={width}
              height={height}
              viewBox={viewBox}
              xmlns="http://www.w3.org/2000/svg"
              className="weapon-svg"
            >

              {type === "ballista" && (
                <path
                  id={`Ballista-${side}`}
                  d={isPort ? "m.94,48.01c4.47.4,8.45,3.6,13.78,7.02,4.41,2.83,9.74,5.7,16.97,6.85l-1.21-8.47s0,0,0,0c-6.2-.68-10.84-2.07-14.86-3.48-4.41-1.55-8.11-3.13-12.21-3.74l30.85-26.59-1.74,31.07,2.06,14.32h7.91s2.06-14.31,2.06-14.31l-1.72-30.61,30.82,26.12c-4.1.6-7.8,2.19-12.2,3.74-4.02,1.41-8.66,2.81-14.86,3.48l-1.21,8.47c7.23-1.16,12.55-4.03,16.97-6.86,5.33-3.41,9.31-6.61,13.78-7.01.31-.01.62-.04.94-.04v-2.05h0s-34.4-29.16-34.4-29.16l-.94-16.76h-6.34s-.91,16.26-.91,16.26L.04,45.92s-.02,0-.04,0v.03s0,0,0,0h0s0,2.02,0,2.02c.32,0,.62.03.94.04Zm36.38-31.05l.9-.78,1.5,1.27v38.47s-1.2,4.81-1.2,4.81h0s0,0,0,0h0s-1.21-4.81-1.21-4.81V16.96Z" : "m76.1,16.99c-4.47-.4-8.45-3.6-13.78-7.02-4.41-2.83-9.74-5.7-16.97-6.85l1.21,8.47s0,0,0,0c6.2.68,10.84,2.07,14.86,3.48,4.41,1.55,8.11,3.13,12.21,3.74l-30.85,26.59,1.74-31.07-2.06-14.32h-7.91l-2.06,14.31,1.72,30.61L3.4,18.8c4.1-.6,7.8-2.19,12.2-3.74,4.02-1.41,8.66-2.81,14.86-3.48l1.21-8.47c-7.23,1.16-12.55,4.03-16.97,6.86-5.33,3.41-9.31,6.61-13.78,7.01-.31.01-.62.04-.94.04v2.05h0l34.4,29.16.94,16.76h6.34l.91-16.26,34.4-29.66s.02,0,.04,0v-.03s0,0,0,0h0s0-2.02,0-2.02c-.32,0-.62-.03-.94-.04Zm-36.38,31.05l-.9.78-1.5-1.27V9.07s1.2-4.81,1.2-4.81h0s0,0,0,0h0s1.21,4.81,1.21,4.81v38.96Z"}
                  fill={fillColor}
                  stroke="grey"
                  strokeWidth="2"
                />
              )}
              {type === "cannon" && (
                <>
                  <polyline
                    id={`Base-${side}`}
                    points={isPort ? "21.1 56.5 28.5 56.5 28.5 2.5 2.5 2.5 2.5 56.5 10.01 56.5" : "9.9 27.73 2.5 27.73 2.5 81.73 28.5 81.73 28.5 27.73 20.99 27.73"}
                    fill="#000000"
                    stroke="grey"
                    strokeWidth="2"
                  />
                  <path
                    id={`Cannon-${side}`}
                    d={isPort ? "m8.78,19.02l.17.35.08,2.67c.04,1.47.1,3.54.13,4.61.26,8.66.29,10.17.24,10.26-.03.06-.04.13-.01.17.08.12.11.53.14,2.01.03,1.16.4,14.3.59,20.88.03,1.08.11,3.7.17,5.83.28,9.67.28,9.71.37,9.96.15.43.2,1.29.14,2.24-.03.48-.08.95-.12,1.06-.22.75.11,1.46.9,1.92,1.5.88,4.7,1.01,6.89.29.99-.33,1.66-.8,1.97-1.37.12-.22.13-.31.13-.92,0-.37-.05-.95-.1-1.28-.11-.75-.11-1.41,0-1.89.16-.71.19-1.23.25-3.81.03-1.43.13-5.45.22-8.94.09-3.48.22-8.32.28-10.76.06-2.43.16-6.2.22-8.38.06-2.17.12-4.62.13-5.44.02-.82.06-2.38.09-3.47.03-1.09.08-3.02.11-4.29.03-1.26.08-3.19.11-4.29.03-1.09.08-3.15.12-4.57.06-2.55.06-2.58.2-2.81.35-.61.52-1.57.41-2.28-.14-.89-.57-1.69-1.31-2.43-.55-.55-1.17-.97-1.86-1.26-.49-.2-1.38-.43-1.87-.48-.2-.02-.47-.04-.61-.06l-.24-.03.16-.14c.19-.16.4-.66.4-.96,0-.26-.13-.69-.28-.94-.07-.11-.24-.25-.4-.33-.91-.45-2.01.24-2.01,1.26,0,.4.11.68.35.94l.18.18h-.36c-1.1,0-2.35.28-3.22.72-1.69.85-2.9,2.57-3.03,4.3-.04.56.04,1.01.26,1.47Z" : "m22.22,65.21l-.17-.35-.08-2.67c-.04-1.47-.1-3.54-.13-4.61-.26-8.66-.29-10.17-.24-10.26.03-.06.04-.13.01-.17-.08-.12-.11-.53-.14-2.01-.03-1.16-.4-14.3-.59-20.88-.03-1.08-.11-3.7-.17-5.83-.28-9.67-.28-9.71-.37-9.96-.15-.43-.2-1.29-.14-2.24.03-.48.08-.95.12-1.06.22-.75-.11-1.46-.9-1.92-1.5-.88-4.7-1.01-6.89-.29-.99.33-1.66.8-1.97,1.37-.12.22-.13.31-.13.92,0,.37.05.95.1,1.28.11.75.11,1.41,0,1.89-.16.71-.19,1.23-.25,3.81-.03,1.43-.13,5.45-.22,8.94-.09,3.48-.22,8.32-.28,10.76-.06,2.43-.16,6.2-.22,8.38-.06,2.17-.12,4.62-.13,5.44-.02.82-.06,2.38-.09,3.47-.03,1.09-.08,3.02-.11,4.29-.03,1.26-.08,3.19-.11,4.29-.03,1.09-.08,3.15-.12,4.57-.06,2.55-.06,2.58-.2,2.81-.35.61-.52,1.57-.41,2.28.14.89.57,1.69,1.31,2.43.55.55,1.17.97,1.86,1.26.49.2,1.38.43,1.87.48.2.02.47.04.61.06l.24.03-.16.14c-.19.16-.4.66-.4.96,0,.26.13.69.28.94.07.11.24.25.4.33.91.45,2.01-.24,2.01-1.26,0-.4-.11-.68-.35-.94l-.18-.18h.36c1.1,0,2.35-.28,3.22-.72,1.69-.85,2.9-2.57,3.03-4.3.04-.56-.04-1.01-.26-1.47Z"}
                    fill={fillColor}
                    stroke="grey"
                    strokeWidth="2"
                  />
                </>
              )}

            </svg>
            <text
              x={xOffset + width / 2}
              y={isPort ? (yOffset + height - 85) : (yOffset + height + 10)}
              fill={textColor}
              textAnchor="middle"
              fontSize="10px"
            >
              {weapon.hp} / {type === "cannon" ? shipData.weapons.cannons.statBlock.maxHP : shipData.weapons.ballistae.statBlock.maxHP} HP
            </text>
          </g>
        </Tooltip >
      );
    });

    xOffsetTracker[deck][side] += weaponData.length * iconSpacing;

    return icons;
  };

  const addOrder = async (action, weaponType, weaponTypeGroup, locationString, deck, side, weaponIndex) => {

    const newOrder = { action, weaponType, locationString, weaponIndex };
    const isDuplicateOrder = orders.some(
      (order) =>
        order.action === newOrder.action &&
        order.weaponType === newOrder.weaponType &&
        order.locationString === newOrder.locationString &&
        order.weaponIndex === newOrder.weaponIndex
    );
    const alreadyHasOrders = shipData.weapons[weaponTypeGroup][deck][side].weaponData[weaponIndex].hasOrders;

    if (!isDuplicateOrder && !alreadyHasOrders) {
      if (weaponsActionsRemaining > 0) {
        setOrders([...orders, newOrder]);
        try {
          const shipRef = doc(db, "ships", "scarlet-fury");
          await updateDoc(shipRef, {
            [`gunnerOrders.actionsRemaining`]: weaponsActionsRemaining - 1,
          });
        } catch (error) {
          console.error("Error updating actions remaining:", error);
        }
        try {
          const shipRef = doc(db, "ships", "scarlet-fury");

          // Get the current weaponData array from Firestore
          const shipSnapshot = await getDoc(shipRef);
          if (!shipSnapshot.exists()) throw new Error("Ship data not found!");

          const currentWeaponData = shipSnapshot.data().weapons[weaponTypeGroup][deck][side].weaponData;

          // Ensure index is valid
          if (!currentWeaponData || weaponIndex < 0 || weaponIndex >= currentWeaponData.length) {
            throw new Error("Invalid weapon index.");
          }

          // Clone the array and update the specific entry
          const updatedWeaponData = [...currentWeaponData];
          updatedWeaponData[weaponIndex] = {
            ...updatedWeaponData[weaponIndex],
            hasOrders: true,
          };

          // Update Firestore with the full modified array
          await updateDoc(shipRef, {
            [`weapons.${weaponTypeGroup}.${deck}.${side}.weaponData`]: updatedWeaponData,
          });
        } catch (error) {
          console.error("Error updating weapon data:", error);
        }
      } else {
        alert("You have no actions remaining this turn!");
      }
    } else if (isDuplicateOrder) {
      const orderIndex = orders.findIndex(
        (order) =>
          order.action === newOrder.action &&
          order.weaponType === newOrder.weaponType &&
          order.locationString === newOrder.locationString &&
          order.weaponIndex === newOrder.weaponIndex
      );
      removeOrder(orderIndex);
    } else if (alreadyHasOrders) {
      alert("This weapon already has orders submitted this turn!");
    }

  };


  const removeOrder = async (index) => {
    const currentLocationString = orders[index].locationString;
    const weaponTypeGroup = orders[index].weaponType === "Cannon" ? "cannons" : "ballistae";
    const deck = currentLocationString.split(" ")[0].toLowerCase() + "Deck";
    const side = currentLocationString.split(" ")[2].toLowerCase() + "Side";
    const weaponIndex = orders[index].weaponIndex;

    setOrders((prevOrders) => prevOrders.filter((_, i) => i !== index));
    try {
      const shipRef = doc(db, "ships", "scarlet-fury");
      await updateDoc(shipRef, {
        [`gunnerOrders.actionsRemaining`]: weaponsActionsRemaining + 1,
      });
    } catch (error) {
      console.error("Error updating actions remaining:", error);
    }
    try {
      const shipRef = doc(db, "ships", "scarlet-fury");

      // Get the current weaponData array from Firestore
      const shipSnapshot = await getDoc(shipRef);
      if (!shipSnapshot.exists()) throw new Error("Ship data not found!");

      const currentWeaponData = shipSnapshot.data().weapons[weaponTypeGroup][deck][side].weaponData;

      // Ensure index is valid
      if (!currentWeaponData || weaponIndex < 0 || weaponIndex >= currentWeaponData.length) {
        throw new Error("Invalid weapon index.");
      }

      // Clone the array and update the specific entry
      const updatedWeaponData = [...currentWeaponData];
      updatedWeaponData[weaponIndex] = {
        ...updatedWeaponData[weaponIndex],
        hasOrders: false,
      };

      // Update Firestore with the full modified array
      await updateDoc(shipRef, {
        [`weapons.${weaponTypeGroup}.${deck}.${side}.weaponData`]: updatedWeaponData,
      });
    } catch (error) {
      console.error("Error updating weapon data:", error);
    }
  };


  const executeOrders = async () => {
    const ordersToSubmit = [];
    orders.forEach((order) => {
      const { weaponIndex, locationString, weaponType, action } = order;
      const weaponTypeGroup = weaponType === "Cannon" ? "cannons" : "ballistae";
      const deck = locationString.split(" ")[0].toLowerCase() + "Deck";
      const side = locationString.split(" ")[2].toLowerCase() + "Side";
      const ammoLoaded = shipData.weapons[weaponTypeGroup][deck][side].weaponData[weaponIndex].loadedWith;
      ordersToSubmit.push({
        weaponTypeGroup,
        deck,
        side,
        weaponIndex,
        action,
        ammoLoaded,
      });

      /* console.log(`Executing ${action} order for ${weaponType} index ${weaponIndex} on the ${locationString}`); */
    });

    /* console.log(ordersToSubmit); */

    try {
      const shipRef = doc(db, "ships", "scarlet-fury");

      const shipSnapshot = await getDoc(shipRef);
      if (!shipSnapshot.exists()) throw new Error("Ship data not found!");
      const currentOrdersData = shipSnapshot.data().gunnerOrders;
      if (currentOrdersData.requestedOrdersArePending === true) {
        alert("There are already orders in the queue. Please wait for the current orders to be executed.");
        return;
      } else {
        await updateDoc(shipRef, {
          [`gunnerOrders.orderRequest`]: ordersToSubmit,
        });
        await updateDoc(shipRef, {
          [`gunnerOrders.requestedOrdersArePending`]: true,
        });
        setOrders([]);
      }
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };

  const masterGunnerPanel = () => {


    const MasterGunnerOrdersPanel = () => {
      return (
        <div className="master-gunner-orders-panel">
          <div className="gunner-actions"><strong>Actions Remaining This Turn: </strong>{weaponsActionsRemaining}{" / "}{weaponsActionsPerTurn}</div>
          <ul>
            {orders.map((order, index) => (
              <li key={index}>
                {order.action}{" "}{order.locationString}{" "}{order.weaponType}{" #"}{order.weaponIndex + 1}
                <button onClick={() => removeOrder(index)}>❌</button>
              </li>
            ))}
          </ul>
          <button className="gunner-orders-button" onClick={executeOrders} disabled={orders.length === 0}>
            Give the Order!
          </button>
        </div>
      )
    };

    const MasterGunnerApprovedOrdersPanel = () => {
      const handleMasterGunnerApprovedOrdersButtonClick = () => {
        console.log("Master Gunner Approved Orders Button Clicked!");
        setAttackModalOpen(true);
      };

      const flash = keyframes`
      0% { background-color: #323232; }
      50% { background-color: red; }
      100% { background-color: #323232; }
      `;

      const approvedOrders = () => {
        const currentApprovedOrders = shipData.gunnerOrders.orderApproved;

        const ammoString = (ammo) => {
          switch (ammo) {
            case "boltStandard":
              return "Standard Bolt";
            case "boltFlaming":
              return "Flaming Bolt";
            case "boltHarpoon":
              return "Harpoon Bolt";
            case "cannonballStandard":
              return "Standard Cannonball";
            case "cannonballArmorPiercing":
              return "Armor-Piercing Cannonball";
            case "cannonballChainshot":
              return "Chainshot";
            case "cannonballInfernoShell":
              return "Inferno Shell";
            case "cannonballSmokeShell":
              return "Smoke Shell";
            default:
              return "Unknown";
          };
        };

        function handleD20RollClick(deck, side, weaponType, weaponIndex, modifier) {
          const tsLinkString = "talespire://dice/" + deck + "%20" + side + "%20" + weaponType + "%20#" + weaponIndex + ":1d20+" + modifier;
          console.log(tsLinkString);
          window.open(tsLinkString);
        }

        function handleDamageRollClick(weaponType, diceString) {
          const tsLinkString = "talespire://dice/" + weaponType + "%20Damage:" + diceString;
          console.log(tsLinkString);
          window.open(tsLinkString);
        }

        return (
          <table className="approved-orders-table">
            <thead>
              <tr>
                <th>Weapon:</th>
                <th>Ammo Loaded:</th>
                <th>To Hit:</th>
                <th>Damage:</th>
              </tr>
            </thead>
            <tbody>
              {currentApprovedOrders.map((order, index) => (
                <tr key={index} className="approved-order-table-item">
                  <td>
                    {order.deck
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^./, (char) => char.toUpperCase())
                    }
                    {" "}
                    {order.side
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^./, (char) => char.toUpperCase())
                    }
                    {" "}
                    {order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista"}
                    {" #"}
                    {order.weaponIndex + 1}
                  </td>
                  <td>
                    {ammoString(order.ammoLoaded)}
                  </td>
                  <td>
                    <span
                      className="clickable-roll"
                      onClick={() => {
                        handleD20RollClick(
                          order.deck.replace(/([a-z])([A-Z])/g, "$1%20$2").split("%20")[0].charAt(0).toUpperCase() + ". " + order.deck.replace(/([a-z])([A-Z])/g, "$1%20$2").split("%20")[1],
                          order.side.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ")[0].charAt(0).toUpperCase() + ". " + order.side.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ")[1],
                          order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista",
                          order.weaponIndex + 1,
                          shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].toHit
                        )
                      }}
                    >
                      {"(d20 + "}{shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].toHit}{")"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="clickable-roll"
                      onClick={() => {
                        handleDamageRollClick(
                          order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista",
                          shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceNumber + "d" + shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceType
                        )
                      }}
                    >
                      {"("}{shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceNumber}{"d"}
                      {shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceType}{")"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      };

      const handleAttackCompleteButtonClick = () => {
        console.log("Attack Complete Button Clicked!");
        //TODO - Add logic to reset the gunnerOrders data in Firestore
        //TODO - Add logic to reset the hasOrders flag for each weapon in Firestore
        //TODO - Add a confirmation prompt before resetting the data
      };

      return (
        <div className="master-gunner-approved-orders-wrapper">
          <Button
            sx={{ animation: `${flash} 2s infinite` }}
            variant="contained"
            className="master-gunner-approved-orders-button"
            onClick={handleMasterGunnerApprovedOrdersButtonClick}
          >
            {"⚔️ Attack Rolls"}
          </Button>
          {attackModalOpen && (
            <div className="attack-modal">
              <button
                className="close-modal-button"
                onClick={() => {
                  setAttackModalOpen(false);
                }}
              >
                X
              </button>
              <h1>Weapon Attacks</h1>
              <hr />
              <h2>The DM has approved the following attacks:</h2>
              {approvedOrders()}
              <button
                className="attack-complete-button"
                onClick={handleAttackCompleteButtonClick}
              >
                Attacks Complete
              </button>
            </div>
          )}
        </div>
      )
    }

    return (
      <>
        <div className="role-utility-panel">
          <div className="master-gunner-panel">
            <div className="master-gunner-panel-left">
              <h3>
                Ship Weapons
              </h3>
              <div>
                <strong>Ballistae:</strong> {totalBallistae}
              </div>
              <div>
                <strong>Cannons:</strong> {totalCannons}
              </div>
              <hr /> {/* -------------------------------------- */}
              <h3>
                Weapon Stats
              </h3>
              {ballistaWeaponStats()}
              {cannonWeaponStats()}
              <hr /> {/* -------------------------------------- */}
              <h3>
                Ammo Onboard
              </h3>
              <div>
                <strong>Ballista Bolts:</strong> {totalBallistaeBoltsStandard}
              </div>
              <div>
                <strong>Cannonballs:</strong> {totalCannonballsStandard}
              </div>
              <hr /> {/* -------------------------------------- */}
              <h3>
                Weapons Crew
              </h3>
              <div>
                <strong>Weapons Actions / Turn:</strong> {weaponsActionsPerTurn}
              </div>
            </div>
            <div className="master-gunner-panel-right">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="850px" height="240px" style={{ background: "#00000000" }}>
                <path id="Bow" d="M220,10 L160,10 C120,10,40,60,40,120 C40,180,120,230,160,230 L220,230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <line id="Port" x1="220" y1="230" x2="740" y2="230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <line id="Starboard" x1="220" y1="10" x2="740" y2="10" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <path id="Stern" d="M740,10 H840 C860,10,880,30,880,50 V190 C880,210,860,230,840,230 H740" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <text x="500" y="120" stroke="grey" fill="grey" textAnchor="middle" dominantBaseline="middle" className="ship-svg-large-text">Main Deck</text>
                {renderWeapons(shipData.weapons.ballistae.mainDeck.portSide.weaponData, "main", "port", "ballista")}
                {renderWeapons(shipData.weapons.cannons.mainDeck.portSide.weaponData, "main", "port", "cannon")}
                {renderWeapons(shipData.weapons.ballistae.mainDeck.starboardSide.weaponData, "main", "starboard", "ballista")}
                {renderWeapons(shipData.weapons.cannons.mainDeck.starboardSide.weaponData, "main", "starboard", "cannon")}
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="850px" height="240px" style={{ background: "#00000000" }}>
                <path id="Bow" d="M220,10 L160,10 C120,10,40,60,40,120 C40,180,120,230,160,230 L220,230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <line id="Port" x1="220" y1="230" x2="740" y2="230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <line id="Starboard" x1="220" y1="10" x2="740" y2="10" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <path id="Stern" d="M740,10 H840 C860,10,880,30,880,50 V190 C880,210,860,230,840,230 H740" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
                <text x="500" y="120" stroke="grey" fill="grey" textAnchor="middle" dominantBaseline="middle" className="ship-svg-large-text">Lower Deck</text>
                {renderWeapons(shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData, "lower", "starboard", "ballista")}
                {renderWeapons(shipData.weapons.cannons.lowerDeck.starboardSide.weaponData, "lower", "starboard", "cannon")}
                {renderWeapons(shipData.weapons.ballistae.lowerDeck.portSide.weaponData, "lower", "port", "ballista")}
                {renderWeapons(shipData.weapons.cannons.lowerDeck.portSide.weaponData, "lower", "port", "cannon")}
              </svg>
              {activeRole === "Master Gunner" && activeRoleTab === 2 && shipData.gunnerOrders.approvedOrdersArePending && MasterGunnerApprovedOrdersPanel()}
            </div>
          </div>
        </div>
        {activeRole === "Master Gunner" && activeRoleTab === 2 && MasterGunnerOrdersPanel()}
      </>
    );
  };



  const shipDeploymentDashboard = () => {
    function resetMasterGunnerOrders() {
      setOrders([]);
    };
    return (
      <div className="card">
        <div className="ship-deployments">
          {/* Heading */}
          <h2 className="dashboard-heading">Deployment Dashboard</h2>

          {/* Tabs Navigation */}
          <div className="tabs-navigation">
            {roles.map((role) => (
              <button
                key={role.name}
                className={`tab-button ${activeRole === role.name ? 'active' : ''}`}
                onClick={() => {
                  handleActiveRoleChange(role.name);
                  resetMasterGunnerOrders();
                }}
              >
                {role.name}
              </button>
            ))}
          </div>

          {/* Role Dashboard */}
          <div className="role-dashboard">
            <div className="role-tabs-navigation">
              <button
                className={`role-tab-button ${activeRoleTab === 0 ? 'active' : ''}`}
                onClick={() => {
                  setActiveRoleTab(0);
                  resetMasterGunnerOrders();
                }}
              >
                Features
              </button>
              <button
                className={`role-tab-button ${activeRoleTab === 1 ? 'active' : ''}`}
                onClick={() => {
                  setActiveRoleTab(1);
                  resetMasterGunnerOrders();
                }}
              >
                Actions
              </button>
              <button
                className={`role-tab-button ${activeRoleTab === 2 ? 'active' : ''}`}
                onClick={() => {
                  setActiveRoleTab(2);
                  resetMasterGunnerOrders();
                }}
              >
                {getRolePanelTitle(activeRole)}
              </button>
            </div>

            <div className="role-tab-content">
              {activeRoleTab === 2 && (
                <>
                  {activeRole === 'Boatswain' ? (
                    boatswainPanel()
                  ) : activeRole === 'Master Gunner' ? (
                    masterGunnerPanel()
                  ) : (
                    <>
                      <p>This is the {getRolePanelTitle(activeRole)} control panel.</p>
                      <h1>Coming Soon</h1>
                    </>
                  )}
                </>
              )}
              {activeRoleTab === 1 && (
                <>
                  {activeRole === 'Boatswain' ? (
                    boatswainActionsPanel()
                  ) : (
                    <p>This is the {activeRole} actions panel.</p>
                  )}
                  <h1>Coming Soon</h1>
                </>
              )}
              {activeRoleTab === 0 && (
                <table className="features-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Feature</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFeatures.map((ability, index) => {
                      const isUnavailable =
                        ability.rank > roles.find((role) => role.name === activeRole)?.rank;

                      return (
                        <tr key={index} className={isUnavailable ? 'unavailable-feature' : ''}>
                          <td>{ability.rank}</td>
                          <td>{ability.name}</td>
                          <td className="ability-description">{ability.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}


            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="sheet-container">
      {/* Top Bar */}
      {shipTopBar()}
      {/* Horizontal Cards */}
      <div className="horizontal-cards">
        {shipAbilityScoresCard()}
        {helmCard()}
        {sailsCard()}
        {hullCard()}
        <div className="card">
          <h3>Defenses/Conditions</h3>
          <p>Immune to Poison, Psychic</p>
        </div>

      </div>

      {/* Lower Grid */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="column">
          {shipSavingThrowsCard()}
          {crewCard(
            shipData.soulsOnboard.commandCrew,
            shipData.soulsOnboard.maxCommandCrew,
            shipData.soulsOnboard.navCrew,
            shipData.soulsOnboard.maxNavCrew,
            shipData.soulsOnboard.weaponsCrew,
            shipData.soulsOnboard.maxWeaponsCrew,
            shipData.soulsOnboard.miscCrew,
            shipData.soulsOnboard.maxMiscCrew,
            shipData.soulsOnboard.maxCrew
          )}
        </div>

        {/* Middle Column */}
        {shipDeploymentDashboard()}

        {/* Right Column */}
        <div className="column">
          <div className="horizontal-row">
            {commandDiceCard()}
            {hullDiceCard()}
          </div>
          {characterDataCard()}
        </div>
      </div>
    </div>
  );
};

export default ShipDashboard;