import TSAbilityRollSpan from '../talespireComponents/tsAbilityRollSpan.jsx';
import calculateModifier from '../../utils/calculateModifier.js';

const ShipAbilityScoresCard = (shipData) => {
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

export default ShipAbilityScoresCard;