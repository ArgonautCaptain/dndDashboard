import React, { useState, useEffect, useRef } from 'react';
import { useShipData } from '../data/shipData';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPanel = () => {
  const { shipData, setShipData } = useShipData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [newStatValue, setNewStatValue] = useState("");
  const [selectedHullStat, setSelectedHullStat] = useState(null);
  const [newHullValue, setNewHullValue] = useState("");


  const correctPassword = 'KeithBaker';

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Redirect to Ship Dashboard if shipData is not available
  useEffect(() => {
    if (!shipData) {
      navigate('/#');
    }
  }, [shipData, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      alert('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  //useEffect to auto-focus inputs when opened

  useEffect(() => {
    if ((selectedStat || selectedHullStat) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select text for easy editing
    }
  }, [selectedStat, selectedHullStat]);

  //ability score card functions

  const handleStatClick = (stat) => {
    setSelectedStat(stat);
    setNewStatValue(shipData.abilityScores[stat]); // Set initial value
  };

  const handleSubmitStatUpdate = async () => {
    if (!selectedStat || isNaN(parseInt(newStatValue))) return;

    try {
      const shipRef = doc(db, "ships", "scarlet-fury"); // Adjust to your ship's document ID
      await updateDoc(shipRef, {
        [`abilityScores.${selectedStat}`]: parseInt(newStatValue),
      });

      // Update local state
      setShipData((prev) => ({
        ...prev,
        abilityScores: {
          ...prev.abilityScores,
          [selectedStat]: parseInt(newStatValue),
        },
      }));

      // Reset selection
      setSelectedStat(null);
      setNewStatValue("");
    } catch (error) {
      console.error("Error updating ability score:", error);
    }
  };

  const shipInfoCard = () => {
    const abilityScoreOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    return (
      <div className="admin-card ship-info-admin-card">
        <h1>Ship General Info</h1>
        <p><strong>Name:</strong> {shipData.name}</p>
        <p><strong>Size:</strong> {shipData.size}</p>
        <p><strong>Cargo Capacity:</strong> {shipData.cargoCapacity}</p>
        <hr />
        <h2>Ability Scores</h2>
        <div className="ability-scores-container">
          {abilityScoreOrder.map((stat) => (
            <h3
              key={stat}
              className="clickable-stat"
              onClick={() => handleStatClick(stat)}
            >
              <strong>{stat}:</strong> {shipData.abilityScores[stat] ?? 0}
            </h3>
          ))}
        </div>

        {/* Input form appears only if a stat is selected */}
        {selectedStat && (
          <div className="stat-edit-container">
            <h3>Editing {selectedStat}</h3>
            <p>
              <input
                ref={inputRef} // Attach ref to input field
                type="number"
                value={newStatValue}
                onChange={(e) => setNewStatValue(e.target.value)}
              />
            </p>
            <p>
              <button onClick={handleSubmitStatUpdate}>Submit</button>
              <button onClick={() => setSelectedStat(null)}>Cancel</button>
            </p>
          </div>
        )}
      </div>
    );
  };

  //weapons score card functions

  const shipWeaponsCard = () => {
    return (
      <div className="admin-card weapons-info-admin-card">
        <h1>Ship Weapons Info</h1>
        <div className="weapon-categories-container">
          {Object.entries(shipData.weapons).map(([weaponType, weaponData]) => (
            <div key={weaponType} className="weapon-category">
              <h2>{weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}</h2>
              <hr />
              <p><strong>Armor Class:</strong> {weaponData.statBlock.armorClass}</p>
              <p><strong>Max HP:</strong> {weaponData.statBlock.maxHP}</p>
              <p><strong>Normal Range:</strong> {weaponData.statBlock.normalRange} ft.</p>
              <p><strong>Max Range:</strong> {weaponData.statBlock.maxRange} ft.</p>
              <hr />
              <ul>
                <h3>Ammo:</h3>
                {Object.entries(weaponData.ammo).map(([ammoType, ammoData]) => (
                  <li key={ammoType}>
                    <strong>{ammoType}: </strong>
                    {ammoData.ammoStored}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )
  };

  //hull card functions

  const handleHullStatClick = (statKey, section = null) => {
    const currentValue = section ? shipData.hull[section][statKey] : shipData.hull[statKey];
    setSelectedHullStat({ statKey, section });
    setNewHullValue(currentValue);
  };

  const handleSubmitHullUpdate = async () => {
    if (!selectedHullStat || isNaN(parseInt(newHullValue))) return;

    try {
      const shipRef = doc(db, "ships", "scarlet-fury");
      const updatePath = selectedHullStat.section
        ? `hull.${selectedHullStat.section}.${selectedHullStat.statKey}`
        : `hull.${selectedHullStat.statKey}`;

      await updateDoc(shipRef, { [updatePath]: parseInt(newHullValue) });

      setShipData((prev) => ({
        ...prev,
        hull: selectedHullStat.section
          ? {
            ...prev.hull,
            [selectedHullStat.section]: {
              ...prev.hull[selectedHullStat.section],
              [selectedHullStat.statKey]: parseInt(newHullValue),
            },
          }
          : {
            ...prev.hull,
            [selectedHullStat.statKey]: parseInt(newHullValue),
          },
      }));

      setSelectedHullStat(null);
      setNewHullValue("");
    } catch (error) {
      console.error("Error updating hull data:", error);
    }
  };

  const shipHullCard = () => {
    return (
      <div className="admin-card hull-info-admin-card">
        <h1>Ship Hull Info</h1>
        <p>
          <strong>Hull Armor Class:</strong>{" "}
          <span className="clickable-stat" onClick={() => handleHullStatClick("armorClass")}>
            {shipData.hull.armorClass}
          </span>
        </p>
        <p>
          <strong>Hull Damage Threshold:</strong>{" "}
          <span className="clickable-stat" onClick={() => handleHullStatClick("damageThreshold")}>
            {shipData.hull.damageThreshold}
          </span>
        </p>
        <hr />
        <h2><strong>Hull Sections:</strong></h2>
        {["hullBow", "hullPort", "hullStarboard", "hullStern"].map((section) => (
          <p key={section}>
            <strong>{section.replace("hull", "")}:</strong>{" "}
            <span className="clickable-stat" onClick={() => handleHullStatClick(section)}>
              {shipData.hull[section]}
            </span>{" "}
            /{" "}
            <span className="clickable-stat" onClick={() => handleHullStatClick(`${section}Max`)}>
              {shipData.hull[`${section}Max`]}
            </span>
          </p>
        ))}

        {/* Input Form for Editing */}
        {selectedHullStat && (
          <div className="stat-edit-container">
            <h3>Editing {selectedHullStat.statKey.replace("hull", "")}</h3>
            <p>
              <input
                ref={inputRef} // Attach ref to input field
                type="number"
                value={newHullValue}
                onChange={(e) => setNewHullValue(e.target.value)}
              />
            </p>
            <p>
              <button onClick={handleSubmitHullUpdate}>Submit</button>
              <button onClick={() => setSelectedHullStat(null)}>Cancel</button>
            </p>
          </div>
        )}
      </div>
    );
  };

  //movement card functions

  const shipMovementCard = () => {
    return (
      <div className="admin-card movement-info-admin-card">
        <h1>Ship Movement Info</h1>
        <p><strong>Helm HP:</strong> {shipData.helmControl.hitPoints} / {shipData.helmControl.maxHP}</p>
        <p><strong>Helm Armor Class:</strong> {shipData.helmControl.armorClass}</p>
        <p><strong>Sailing Speed:</strong> {shipData.movementSails.speed} ft.</p>
        <p><strong>With Wind:</strong> {shipData.movementSails.speedModifiers.withWind} ft.</p>
        <p><strong>Against Wind:</strong> {shipData.movementSails.speedModifiers.intoWind} ft.</p>
        <p><strong>Travel Pace:</strong> {shipData.travelPace}</p>
      </div>
    )
  };

  //crew card functions

  const shipCrewCard = () => {
    return (
      <div className="admin-card crew-info-admin-card">
        <h1>Ship Crew Info</h1>
        <p><strong>Max Crew:</strong> {shipData.soulsOnboard.maxCrew}</p>
        <p><strong>Current Crew Morale:</strong> {shipData.soulsOnboard.crewMorale}</p>
        <hr />
        <h2>Officer Ranks:</h2>
        {Object.entries(shipData.officerRanks).map(([role, rank]) => (
          <p key={role}><strong>{role}:</strong> Rank {rank}</p>
        ))}
      </div>
    )
  };

  //dice card functions

  const shipDiceCard = () => {
    return (
      <div className="admin-card dice-info-admin-card">
        <h1>Ship Dice Info</h1>
        <p><strong>Command Dice:</strong> d{shipData.shipDice.commandDiceType} ({shipData.shipDice.commandDiceLeft} / {shipData.shipDice.commandDiceMax})</p>
        <p><strong>Hull Dice:</strong> d{shipData.shipDice.hullDiceType} ({shipData.shipDice.hullDiceLeft} / {shipData.shipDice.hullDiceMax})</p>
      </div>
    )
  };

  return (
    <>
      {shipData &&
        <div className="admin-panel">
          {!isAuthenticated ? (
            <form onSubmit={handleLogin}>
              <h2>DM Login</h2>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Login</button>
            </form>
          ) : (
            <>
              <button onClick={handleLogout}>Logout</button>
              <button
                onClick={() =>
                  window.open(
                    "https://console.firebase.google.com/u/0/project/dnd-dashboard-64a3c/firestore/databases/-default-/data/~2Fships~2Fscarlet-fury",
                    '_blank'
                  )
                }
              >
                Firebase
              </button>

              {/* Ship Information Cards */}
              <div className="ship-info-container">
                {shipInfoCard()}
                {shipWeaponsCard()}
                {shipHullCard()}
                {shipMovementCard()}
                {shipCrewCard()}
                {shipDiceCard()}
              </div>
            </>
          )}
        </div>
      }
    </>
  );
};

export default AdminPanel;
