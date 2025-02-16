  // Calculate ship sailing speed
  const calculatedSpeed = (baseSpeed, currentHP, maxHP) => {
    if (currentHP === 0) {
      return 0; // If sails HP is 0, speed is 0
    }

    const reducedSpeed = baseSpeed - Math.floor((maxHP - currentHP) / 25) * 5;
    return Math.max(reducedSpeed, 0); // Ensure speed is never negative
  };

  export default calculatedSpeed;