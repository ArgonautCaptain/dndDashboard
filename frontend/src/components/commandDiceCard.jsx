const CommandDiceCard = (shipData) => {
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

export default CommandDiceCard;