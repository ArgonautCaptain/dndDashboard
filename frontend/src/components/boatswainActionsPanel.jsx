import PropTypes from 'prop-types';

const BoatswainActionsPanel = ({ activeRole }) => {
  if (activeRole !== 'Boatswain') {
    return null;
  }

  return (
    <div className="role-actions-panel">
      <h4>Actions Panel</h4>
      <p>This is the Boatswain actions panel.</p>
      <h1>Coming Soon</h1>
    </div>
  );
};

BoatswainActionsPanel.propTypes = {
  activeRole: PropTypes.string.isRequired,
};

export default BoatswainActionsPanel;