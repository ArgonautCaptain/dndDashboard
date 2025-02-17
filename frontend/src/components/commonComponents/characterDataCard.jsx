import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';


const CharacterDataCard = ({ roles, activeRole }) => {
  const [characterData, setCharacterData] = useState(null);

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
CharacterDataCard.propTypes = {
  roles: PropTypes.array.isRequired,
  activeRole: PropTypes.string.isRequired,
};

export default CharacterDataCard;
