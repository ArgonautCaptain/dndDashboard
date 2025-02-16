import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ShipTopBar from '../components/shipTopBar.jsx';
import ShipAbilityScoresCard from '../components/shipAbilityScoresCard.jsx';
import HelmCard from '../components/helmCard.jsx';
import SailsCard from '../components/sailsCard.jsx';
import HullCard from '../components/hullCard.jsx';
import DefensesConditionsCard from '../components/defensesConditionsCard.jsx';
import ShipSavingThrowsCard from '../components/shipSavingThrowsCard.jsx';
import CrewCard from '../components/crewCard.jsx';
import ShipDeploymentDashboard from '../components/shipDeploymentDashboard.jsx';


const ShipDashboard = () => {
  const [shipData, setShipData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem("activeRole") || null;
  });
  const [characterData, setCharacterData] = useState(null);

  useEffect(() => {
    const shipRef = doc(db, "ships", "scarlet-fury");

    const unsubscribe = onSnapshot(shipRef, (snapshot) => {
      if (snapshot.exists()) {
        setShipData(snapshot.data());
      } else {
        console.error("No such document!");
      }
    });

    return () => unsubscribe();
  }, []);




  const initializeRoles = () => {
    if (!shipData?.officers) return;

    const roleOrder = ["firstMate", "commsOfficer", "boatswain", "quartermaster", "lookout", "masterGunner", "captain", "personnelOfficer"];

    const excludedRoles = ["captain", "personnelOfficer"];

    const updatedRoles = Object.entries(shipData.officers)
      .filter(([key]) => !excludedRoles.includes(key)) // Exclude these roles
      .sort((a, b) => roleOrder.indexOf(a[0]) - roleOrder.indexOf(b[0]))
      .map(([key, officer]) => ({
        id: officer.id || key,
        name: officer.name || key,
        rank: officer.currentRank || 1,
        features: officer.feats || [],
      }));

    setRoles(updatedRoles);
  };

  useEffect(() => {
    if (shipData?.officers) {
      initializeRoles();
    }
  }, [shipData]);

  useEffect(() => {
    if (roles.length > 0) {
      if (!roles.some((role) => role.name === activeRole)) {
        const firstRole = roles[0].name;
        setActiveRole(firstRole);
        localStorage.setItem("activeRole", firstRole);
      }
    }
  }, [roles]);

  const handleSetActiveRole = (role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
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

  // Fetch character data dynamically when roles and activeRole are ready
  useEffect(() => {
    const fetchData = async () => {
      if (roles.length > 0 && activeRole) {
        const activeRoleData = roles.find((role) => role.name === activeRole);
        if (activeRoleData && activeRoleData.id) {
          const stats = await fetchCharacterStats(activeRoleData.id);
          setCharacterData(stats);
        }
      }
    };

    fetchData();
  }, [activeRole, roles]);

  if (!shipData || roles.length === 0) {
    return <p>Loading ship stats...</p>;
  }

  /*   console.log("shipData", shipData);
    console.log("roles", roles);
    console.log("activeRole", activeRole);
    console.log("activeRoleTab", activeRoleTab); */

  return (
    <div className="sheet-container">
      {/* Top Bar */}
      {ShipTopBar(shipData)}
      {/* Horizontal Cards */}
      <div className="horizontal-cards">
        {ShipAbilityScoresCard(shipData)}
        {HelmCard(shipData)}
        {SailsCard(shipData)}
        {HullCard(shipData)}
        {DefensesConditionsCard()}
      </div>
      {/* Lower Grid */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="column">
          {ShipSavingThrowsCard(shipData)}
          {CrewCard(shipData)}
        </div>

        {/* Middle Column */}
        <ShipDeploymentDashboard
          shipData={shipData}
          roles={roles}
          activeRole={activeRole}
          handleSetActiveRole={handleSetActiveRole}
          activeRoleTab={activeRoleTab}
          setActiveRoleTab={setActiveRoleTab}
        />
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