import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import deploymentFeatures from './../data/deploymentFeatures.json'


const ShipStats = () => {
  const [shipData, setShipData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState(0);


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
          { name: 'Captain', id: '136228181', roleIdentifier: 'captain' },
          { name: 'Personnel Officer', id: '136437805', roleIdentifier: 'personnelOfficer' },
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

  useEffect(() => {
    console.log('Roles Array:', roles); // Debugging roles
  }, [roles]);

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
        `http://localhost:4000/proxy/https://character-service.dndbeyond.com/character/v5/character/${characterId}`
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

    if (percentage > 50) {
      return '#00ff00'; // Green for above 50%
    } else if (percentage > 25) {
      return '#ffff00'; // Yellow for 26%-50%
    } else {
      return '#ff0000'; // Red for 25% or below
    }
  };

  const helmCard = () => {
    // Helper function to calculate dynamic color
    const getTextColor = (currentHP, maxHP) => {
      const percentage = (currentHP / maxHP) * 100;
      if (percentage > 50) return 'lime'; // Green for above 50%
      if (percentage > 25) return 'yellow'; // Yellow for 26%-50%
      return 'red'; // Red for 25% or below
    };

    return (
      <div className="card helm-card">
        <Box className="progress-container">
          <CircularProgress
            variant="determinate"
            value={(shipData.controlHelm.hitPoints / shipData.controlHelm.maxHP) * 100}
            size={120} // Adjust size to fit the card
            thickness={4} // Adjust thickness for better aesthetics
            style={{
              color: getProgressColor(shipData.controlHelm.hitPoints, shipData.controlHelm.maxHP),
              position: 'absolute',
            }}
          />
        </Box>
        <h3>Helm</h3>
        <p>
          <strong>Helm HP:</strong>{' '}
          <span
            style={{
              color: getTextColor(shipData.controlHelm.hitPoints, shipData.controlHelm.maxHP),
            }}
          >
            {shipData.controlHelm.hitPoints}
          </span>{' '}
          / {shipData.controlHelm.maxHP}
        </p>
        <p>Move up to the speed of one of the ship's sails, with one 90-degree turn.</p>
        <p>
          <strong>Steering:</strong> {steeringStatus(shipData.controlHelm.hitPoints)}
        </p>
      </div>
    );
  };

  const hullCard = () => {
    const getTextColor = (currentHP, maxHP) => {
      const percentage = (currentHP / maxHP) * 100;
      if (percentage > 50) return 'lime'; // Green for above 50%
      if (percentage > 25) return 'yellow'; // Yellow for 26%-50%
      return 'red'; // Red for 25% or below
    };

    return (
      <div className="card hull-card">
        <Box className="progress-container">
          <CircularProgress
            variant="determinate"
            value={(shipData.hull.hitPoints / shipData.hull.maxHP) * 100}
            size={120}
            thickness={4}
            style={{
              color: getProgressColor(shipData.hull.hitPoints, shipData.hull.maxHP),
              position: 'absolute',
            }}
          />
        </Box>
        <h3>Hull</h3>
        <p>
          <strong>Hull HP:</strong>{' '}
          <span style={{ color: getTextColor(shipData.hull.hitPoints, shipData.hull.maxHP) }}>
            {shipData.hull.hitPoints}
          </span>{' '}
          / {shipData.hull.maxHP}
        </p>
        <p>
          <strong>Armor Class:</strong> {shipData.hull.armorClass}
        </p>
        <p>
          <strong>Damage Threshold:</strong> {shipData.hull.damageThreshold}
        </p>
      </div>
    );
  };


  const sailsCard = () => {
    // Helper function to calculate dynamic color
    const getTextColor = (current, max) => {
      const percentage = (current / max) * 100;
      if (percentage > 50) return 'lime'; // Green for above 50%
      if (percentage > 25) return 'yellow'; // Yellow for 26%-50%
      return 'red'; // Red for 25% or below
    };

    const getSpeedColor = (speed) => {
      if (speed > 40) return 'lime'; // High speed (e.g., green)
      if (speed > 20) return 'yellow'; // Moderate speed
      return 'red'; // Low speed
    };

    return (
      <div className="card sails-card">
        <Box className="progress-container">
          <CircularProgress
            variant="determinate"
            value={(shipData.movementSails.hitPoints / shipData.movementSails.maxHP) * 100}
            size={120}
            thickness={4}
            style={{
              color: getProgressColor(shipData.movementSails.hitPoints, shipData.movementSails.maxHP),
              position: 'absolute',
            }}
          />
        </Box>
        <h3>Sails</h3>
        <p>
          <strong>Sails HP:</strong>{' '}
          <span
            style={{
              color: getTextColor(shipData.movementSails.hitPoints, shipData.movementSails.maxHP),
            }}
          >
            {shipData.movementSails.hitPoints}
          </span>{' '}
          / {shipData.movementSails.maxHP}
        </p>
        <p>
          <strong>Sailing Speed:</strong>{' '}
          <span
            style={{
              color: getSpeedColor(
                calculatedSpeed(shipData.movementSails.speed, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)
              ),
            }}
          >
            {calculatedSpeed(shipData.movementSails.speed, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)} ft.
          </span>
        </p>
        <p>
          <strong>With Wind:</strong>{' '}
          <span
            style={{
              color: getSpeedColor(
                calculatedSpeed(shipData.movementSails.speedModifiers.withWind, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)
              ),
            }}
          >
            {calculatedSpeed(shipData.movementSails.speedModifiers.withWind, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)} ft.
          </span>
        </p>
        <p>
          <strong>Into Wind:</strong>{' '}
          <span
            style={{
              color: getSpeedColor(
                calculatedSpeed(shipData.movementSails.speedModifiers.intoWind, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)
              ),
            }}
          >
            {calculatedSpeed(shipData.movementSails.speedModifiers.intoWind, shipData.movementSails.hitPoints, shipData.movementSails.maxHP)} ft.
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
            return (
              <div key={score} className="score-card">
                <p className="score-name">{score}</p>
                <p className="score-modifier">
                  {modifier >= 0 ? '+' : ''}
                  {modifier}
                </p>
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
            const savingThrow = modifier === "N/A" ? "FAIL" : modifier >= 0 ? `+${modifier}` : modifier;

            return (
              <div key={score} className={`saving-throw ${index % 2 === 0 ? "left" : "right"}`}>
                <span>{score}</span>
                <span>{savingThrow}</span>
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
    return "Nominal";
  };

  // State to track the active role and ability scores
  const [activeRole, setActiveRole] = useState('First Mate');
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


  if (!shipData) {
    return <p>Loading ship stats...</p>;
  }

  const shipDeploymentDashboard = () => {
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
                onClick={() => setActiveRole(role.name)}
              >
                {role.name}
              </button>
            ))}
          </div>

          {/* Role Dashboard */}
          <div className="role-dashboard">
            <div className="role-tabs-navigation">
              {['Features', 'Placeholder 1', 'Placeholder 2'].map((tab, index) => (
                <button
                  key={tab}
                  className={`role-tab-button ${activeRoleTab === index ? 'active' : ''}`}
                  onClick={() => setActiveRoleTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="role-tab-content">
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
                      const isUnavailable = ability.rank > roles.find((role) => role.name === activeRole)?.rank;

                      return (
                        <tr key={index} className={isUnavailable ? 'unavailable-feature' : ''}>
                          <td>{ability.rank}</td>
                          <td>{ability.name}</td>
                          <td>{ability.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {activeRoleTab === 1 && <p>Placeholder content for Tab 1</p>}
              {activeRoleTab === 2 && <p>Placeholder content for Tab 2</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const commandDiceCard = () => {
    //TODO: MAKE THE BUTTON POP UP A CONFIRMATION MODAL AND THEN HAVE IT SUBTRACT A COMMAND DIE FROM FIREBASE ("Are you sure you want to use a command die? You will have x remaining")
    //TODO: MAKE THE FORMATTING OF THE BUTTON BETTER
    return (
      <div className="card command-dice-card">
        <h3>Command Dice</h3>
        <p><strong>Type:</strong> d{shipData.shipDice.commandDiceType}</p>
        <p><strong>Current Command Dice:</strong> {shipData.shipDice.commandDiceLeft} / {shipData.shipDice.commandDiceMax}</p>
        <button className="centered-in-card">Roll Command Die!</button>
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
        <button className="centered-in-card">Roll Hull Die!</button>
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
                return (
                  <div key={ability} className="character-score-card">
                    <p className="character-score-name">{ability}</p>
                    <p className="character-score-modifier">
                      {modifier >= 0 ? '+' : ''}{modifier}
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

export default ShipStats;
