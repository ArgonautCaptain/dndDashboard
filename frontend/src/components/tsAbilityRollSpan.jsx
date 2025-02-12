import PropTypes from 'prop-types';

//add prop for abilityModifier

function TsAbilityRollSpan({ abilityName, abilitySuffix, modifierValue, children }) {
  TsAbilityRollSpan.propTypes = {
    abilityName: PropTypes.string.isRequired,
    abilitySuffix: PropTypes.string,
    modifierValue: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  const abilityMap = {
    STR: "Strength",
    DEX: "Dexterity",
    CON: "Constitution",
    INT: "Intelligence",
    WIS: "Wisdom",
    CHA: "Charisma",
  };

  function handleRollClick() {
    if (modifierValue !== "N/A" && modifierValue !== "FAIL") {
      const expandedAbilityName = abilityMap[abilityName] || abilityName;
      const fullAbilityName = abilitySuffix ? `${expandedAbilityName}%20${abilitySuffix}` : expandedAbilityName;
      console.log(fullAbilityName);
      const tsLinkString = "talespire://dice/Ship%20" + fullAbilityName + ":1d20" + modifierValue;
      console.log(tsLinkString);
      window.open(tsLinkString);
    }
    else {
      console.log("N/A or FAIL");
    }
  };

  return (
    <span title={abilityName} className="clickable-roll" onClick={handleRollClick}>
      {children}
    </span>
  );
};

export default TsAbilityRollSpan;