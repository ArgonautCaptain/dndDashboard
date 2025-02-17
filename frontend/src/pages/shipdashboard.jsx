import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ShipTopBar from '../components/commonComponents/shipTopBar.jsx';
import ShipAbilityScoresCard from '../components/commonComponents/shipAbilityScoresCard.jsx';
import HelmCard from '../components/commonComponents/helmCard.jsx';
import SailsCard from '../components/commonComponents/sailsCard.jsx';
import HullCard from '../components/commonComponents/hullCard.jsx';
import DefensesConditionsCard from '../components/commonComponents/defensesConditionsCard.jsx';
import ShipSavingThrowsCard from '../components/commonComponents/shipSavingThrowsCard.jsx';
import CrewCard from '../components/commonComponents/crewCard.jsx';
import ShipDeploymentDashboard from '../components/commonComponents/shipDeploymentDashboard.jsx';
import CommandDiceCard from '../components/commonComponents/commandDiceCard.jsx';
import HullDiceCard from '../components/commonComponents/hullDiceCard.jsx';
import CharacterDataCard from '../components/commonComponents/characterDataCard.jsx';


const ShipDashboard = () => {
  const [shipData, setShipData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem("activeRole") || null;
  });


  useEffect(() => {
    const shipRef = doc(db, "ships", "scarlet-fury");

    const unsubscribe = onSnapshot(shipRef, (snapshot) => {
      if (snapshot.exists()) {
        setShipData(snapshot.data());
      } else {
        console.error("No such document!");
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeRoles = () => {
    if (!shipData?.officers) return;

    const roleOrder = ["firstMate", "commsOfficer", "boatswain", "quartermaster", "lookout", "masterGunner", "captain", "personnelOfficer"];

    const excludedRoles = ["captain", "personnelOfficer"];

    const updatedRoles = Object.entries(shipData.officers)
      .filter(([key]) => !excludedRoles.includes(key)) // Exclude these roles
      .sort((a, b) => roleOrder.indexOf(a[0]) - roleOrder.indexOf(b[0]))
      .map(([key, officer]) => ({
        id: officer.id || key,
        name: officer.name || key,
        rank: officer.currentRank || 1,
        features: officer.feats || [],
      }));

    setRoles(updatedRoles);
  };

  useEffect(() => {
    if (shipData?.officers) {
      initializeRoles();
    }
  }, [shipData]);

  useEffect(() => {
    if (roles.length > 0) {
      if (!roles.some((role) => role.name === activeRole)) {
        const firstRole = roles[0].name;
        setActiveRole(firstRole);
        localStorage.setItem("activeRole", firstRole);
      }
    }
  }, [roles]);

  const handleSetActiveRole = (role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
  };

  if (!shipData || roles.length === 0) {
    return <p>Loading ship stats...</p>;
  }

  /*   console.log("shipData", shipData);
    console.log("roles", roles);
    console.log("activeRole", activeRole);
    console.log("activeRoleTab", activeRoleTab); */

  return (
    <div className="sheet-container">
      {/* Top Bar */}
      {ShipTopBar(shipData)}
      {/* Horizontal Cards */}
      <div className="horizontal-cards">
        {ShipAbilityScoresCard(shipData)}
        {HelmCard(shipData)}
        {SailsCard(shipData)}
        {HullCard(shipData)}
        {DefensesConditionsCard()}
      </div>
      {/* Lower Grid */}
      <div className="main-grid">
        {/* Left Column */}
        <div className="column">
          {ShipSavingThrowsCard(shipData)}
          {CrewCard(shipData)}
        </div>

        {/* Middle Column */}
        <ShipDeploymentDashboard
          shipData={shipData}
          roles={roles}
          activeRole={activeRole}
          handleSetActiveRole={handleSetActiveRole}
          activeRoleTab={activeRoleTab}
          setActiveRoleTab={setActiveRoleTab}
        />
        {/* Right Column */}
        <div className="column">
          <div className="horizontal-row">
            {CommandDiceCard(shipData)}
            {HullDiceCard(shipData)}
          </div>
          <CharacterDataCard
          roles={roles}
          activeRole={activeRole}
          />
        </div>
      </div>
    </div>
  );
};

export default ShipDashboard;