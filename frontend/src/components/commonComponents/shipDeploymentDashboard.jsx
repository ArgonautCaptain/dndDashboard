import BoatswainPanel from "../deploymentPanels/boatswainPanel.jsx";
import BoatswainActionsPanel from "../deploymentPanels/boatswainActionsPanel.jsx";
import MasterGunnerPanel from "../deploymentPanels/masterGunnerPanel.jsx";
import PropTypes from "prop-types";

const ShipDeploymentDashboard = ({ shipData, roles, activeRole, handleSetActiveRole, activeRoleTab, setActiveRoleTab }) => {


  // Find the features for the active role
  const activeFeatures = roles.find((role) => role.name === activeRole)?.features || [];

  const getRolePanelTitle = (role) => {
    switch (role) {
      case 'First Mate':
        return 'Helm Control Panel';
      case 'Comms Officer':
        return 'Speaking Stone Panel';
      case 'Boatswain':
        return 'Damage Report Panel';
      case 'Quartermaster':
        return 'Ship Manifest Panel';
      case 'Lookout':
        return 'Lookout Placeholder Panel';
      case 'Master Gunner':
        return 'Weapons Panel';
      case 'Captain':
        return 'Captain Placeholder Panel';
      case 'Personnel Officer':
        return 'Personnel Officer Placeholder Panel';
      default:
        return 'Role Panel';
    }
  };

  return (
    <div className="card">
      <div className="ship-deployments">
        <h2 className="dashboard-heading">Deployment Dashboard</h2>
        <div className="tabs-navigation">
          {roles.map((role) => (
            <button
              key={role.name}
              className={`tab-button ${activeRole === role.name ? 'active' : ''}`}
              onClick={() => handleSetActiveRole(role.name)}
            >
              {role.name}
            </button>
          ))}
        </div>
        <div className="role-dashboard">
          <div className="role-tabs-navigation">
            <button
              className={`role-tab-button ${activeRoleTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveRoleTab(0)}
            >
              Features
            </button>
            <button
              className={`role-tab-button ${activeRoleTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveRoleTab(1)}
            >
              Actions
            </button>
            <button
              className={`role-tab-button ${activeRoleTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveRoleTab(2)}
            >
              {getRolePanelTitle(activeRole)}
            </button>
          </div>
          <div className="role-tab-content">
            {activeRoleTab === 2 && (
              <>
                <BoatswainPanel shipData={shipData} activeRole={activeRole} activeRoleTab={activeRoleTab} />
                <MasterGunnerPanel shipData={shipData} activeRole={activeRole} activeRoleTab={activeRoleTab} />
                {activeRole !== 'Boatswain' && activeRole !== 'Master Gunner' && (
                  <>
                    <p>This is the {getRolePanelTitle(activeRole)} control panel.</p>
                    <h1>Coming Soon</h1>
                  </>
                )}
              </>
            )}
            {activeRoleTab === 1 && (
              <>
                <BoatswainActionsPanel activeRole={activeRole} />
                {activeRole !== 'Boatswain' && (
                  <p>This is the {activeRole} actions panel.</p>
                )}
                <h1>Coming Soon</h1>
              </>
            )}
            {activeRoleTab === 0 && (
              <table className="features-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Feature</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFeatures.map((ability, index) => {
                    const isUnavailable =
                      ability.rank > roles.find((role) => role.name === activeRole)?.rank;

                    return (
                      <tr key={index} className={isUnavailable ? 'unavailable-feature' : ''}>
                        <td>{ability.rank}</td>
                        <td>{ability.name}</td>
                        <td className="ability-description">{ability.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ShipDeploymentDashboard.propTypes = {
  shipData: PropTypes.object.isRequired,
  roles: PropTypes.array.isRequired,
  activeRole: PropTypes.string.isRequired,
  handleSetActiveRole: PropTypes.func.isRequired,
  activeRoleTab: PropTypes.number.isRequired,
  setActiveRoleTab: PropTypes.func.isRequired,
};

export default ShipDeploymentDashboard;