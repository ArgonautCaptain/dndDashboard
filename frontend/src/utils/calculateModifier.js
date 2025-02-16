const calculateModifier = (score) => {
  if (score === 0) {
    return "N/A";
  }
  return Math.floor((score - 10) / 2);
};

export default calculateModifier;