  // Steering status
  const steeringStatus = (helmHP) => {
    if (helmHP === 0) {
      return "Non-functional";
    }
    return "Functional";
  };

  export default steeringStatus;