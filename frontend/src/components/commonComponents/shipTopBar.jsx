const ShipTopBar = (shipData) => {
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

export default ShipTopBar;