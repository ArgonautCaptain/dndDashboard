const getDamageColor = (currentHP, maxHP) => {
  const percentage = (currentHP / maxHP) * 100;
  if (percentage > 99) return 'lime';
  if (percentage > 49) return 'yellow';
  return 'red';
};

export default getDamageColor;