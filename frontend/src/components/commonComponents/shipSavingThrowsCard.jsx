import calculateModifier from '../../utils/calculateModifier.js';
import TSAbilityRollSpan from '../talespireComponents/tsAbilityRollSpan.jsx';

const ShipSavingThrowsCard = (shipData) => {
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

export default ShipSavingThrowsCard;