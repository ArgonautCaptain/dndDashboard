const HullDiceCard = (shipData) => {
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

export default HullDiceCard;