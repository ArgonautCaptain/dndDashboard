  // Progress wheel dynamic color
  const getProgressColor = (currentHP, maxHP) => {
    const percentage = (currentHP / maxHP) * 100;

    if (percentage > 75) {
      return '#00ff00';
    } else if (percentage > 25) {
      return '#ffff00';
    } else {
      return '#ff0000';
    }
  };

  export default getProgressColor;