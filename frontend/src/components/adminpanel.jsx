import { useState, useEffect, useRef } from 'react';
import { useShipData } from '../data/shipData';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { doc, updateDoc, getDoc } from 'firebase/firestore';
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
  const [selectedWeaponStat, setSelectedWeaponStat] = useState(null);
  const [newWeaponValue, setNewWeaponValue] = useState("");
  const [selectedAmmoValue, setSelectedAmmoValue] = useState(null);
  const [newAmmoValue, setNewAmmoValue] = useState("");
  const [selectedEquippedWeaponStatus, setSelectedEquippedWeaponStatus] = useState(null);
  const [newEquippedWeaponStatus, setNewEquippedWeaponStatus] = useState("");


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
  //TODO: Add condition for booleans to not cause an error so that selectedEquippedWeaponStatus can be added to this useEffect
  useEffect(() => {
    if ((selectedStat || selectedHullStat || selectedWeaponStat || selectedAmmoValue) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select text for easy editing
    }
  }, [selectedStat, selectedHullStat, selectedWeaponStat, selectedAmmoValue]);

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
            <h3 key={stat}>
              {stat}{": "}<span className="clickable-stat" onClick={() => handleStatClick(stat)}>{shipData.abilityScores[stat] ?? 0}</span>
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

  const handleWeaponStatClick = (statKey, weaponType) => {
    setSelectedWeaponStat({ statKey, weaponType });
    setSelectedAmmoValue(null); // Clear ammo selection
    setSelectedEquippedWeaponStatus(null); // Clear equipped weapon status selection
    setNewWeaponValue(shipData.weapons[weaponType].statBlock[statKey]);
  };

  const handleSubmitWeaponUpdate = async () => {
    if (!selectedWeaponStat || isNaN(parseInt(newWeaponValue))) return;

    try {
      const shipRef = doc(db, "ships", "scarlet-fury");
      const updatePath = `weapons.${selectedWeaponStat.weaponType}.statBlock.${selectedWeaponStat.statKey}`;

      await updateDoc(shipRef, { [updatePath]: parseInt(newWeaponValue) });

      setShipData((prev) => ({
        ...prev,
        weapons: {
          ...prev.weapons,
          [selectedWeaponStat.weaponType]: {
            ...prev.weapons[selectedWeaponStat.weaponType],
            statBlock: {
              ...prev.weapons[selectedWeaponStat.weaponType].statBlock,
              [selectedWeaponStat.statKey]: parseInt(newWeaponValue),
            },
          },
        },
      }));

      setSelectedWeaponStat(null);
      setNewWeaponValue("");
    } catch (error) {
      console.error("Error updating weapon stat:", error);
    }
  };

  const handleAmmoClick = (weaponType, ammoType, currentValue) => {
    setSelectedAmmoValue({ weaponType, ammoType });
    setSelectedWeaponStat(null); // Clear weapon stat selection
    setSelectedEquippedWeaponStatus(null); // Clear equipped weapon status selection
    setNewAmmoValue(currentValue);
  };

  const handleSubmitAmmoUpdate = async () => {
    if (!selectedAmmoValue || isNaN(parseInt(newAmmoValue))) return;

    const { weaponType, ammoType } = selectedAmmoValue;
    const newValue = parseInt(newAmmoValue);

    if (isNaN(newValue) || newValue < 0) return;

    const shipRef = doc(db, "ships", "scarlet-fury");
    try {
      await updateDoc(shipRef, {
        [`weapons.${weaponType}.ammo.${ammoType}.ammoStored`]: newValue,
      });
      console.log("Updated ${ammoType} for ${weaponType} to ${newValue}");
      setSelectedAmmoValue(null);
    } catch (error) {
      console.error("Error updating ammo:", error);
    }
  };

  const handleEquippedWeaponStatusClick = (weaponType, deck, side, index, key, currentValue) => {
    setSelectedEquippedWeaponStatus({ weaponType, deck, side, index, key });
    setSelectedAmmoValue(null); // Clear ammo selection
    setSelectedWeaponStat(null); // Clear weapon stat selection
    setNewEquippedWeaponStatus(currentValue);
  };

  const handleSubmitEquippedWeaponStatusUpdate = async () => {
    if (!selectedEquippedWeaponStatus) return;

    const { weaponType, deck, side, index, key } = selectedEquippedWeaponStatus;
    const isBooleanField = key === "isLoaded";
    const newValue = isBooleanField ? newEquippedWeaponStatus === "true" : parseInt(newEquippedWeaponStatus);

    if (!isBooleanField && isNaN(newValue)) return; // Validate integer input

    try {
      const shipRef = doc(db, "ships", "scarlet-fury");

      // Get the current weaponData array from Firestore
      const shipSnapshot = await getDoc(shipRef);
      if (!shipSnapshot.exists()) throw new Error("Ship data not found!");

      const currentWeaponData = shipSnapshot.data().weapons[weaponType][deck][side].weaponData;

      // Ensure index is valid
      if (!currentWeaponData || index < 0 || index >= currentWeaponData.length) {
        throw new Error("Invalid weapon index.");
      }

      // Clone the array and update the specific entry
      const updatedWeaponData = [...currentWeaponData];
      updatedWeaponData[index] = {
        ...updatedWeaponData[index],
        [key]: newValue,
      };

      // Update Firestore with the full modified array
      await updateDoc(shipRef, {
        [`weapons.${weaponType}.${deck}.${side}.weaponData`]: updatedWeaponData,
      });

      // Update local state
      setShipData((prev) => ({
        ...prev,
        weapons: {
          ...prev.weapons,
          [weaponType]: {
            ...prev.weapons[weaponType],
            [deck]: {
              ...prev.weapons[weaponType][deck],
              [side]: {
                ...prev.weapons[weaponType][deck][side],
                weaponData: updatedWeaponData,
              },
            },
          },
        },
      }));

      // Reset selection
      setSelectedEquippedWeaponStatus(null);
      setNewEquippedWeaponStatus("");
    } catch (error) {
      console.error("Error updating equipped weapon status:", error);
    }
  };



  const shipWeaponsCard = () => {
    /*
        const totalBallistaeBoltsStandard = shipData.weapons.ballistae.ammo.boltStandard.ammoStored;
        const totalCannonballsStandard = shipData.weapons.cannons.ammo.cannonballStandard.ammoStored;
        const totalMangonelStonesStandard = shipData.weapons.mangonels.ammo.mangonelStoneStandard.ammoStored;
        const totalTrebuchetStonesStandard = shipData.weapons.trebuchets.ammo.trebuchetStoneStandard.ammoStored;
     */
    const mainDeckBallistaePort = shipData.weapons.ballistae.mainDeck.portSide.weaponData.length;
    const mainDeckBallistaeStarboard = shipData.weapons.ballistae.mainDeck.starboardSide.weaponData.length;
    const lowerDeckBallistaePort = shipData.weapons.ballistae.lowerDeck.portSide.weaponData.length;
    const lowerDeckBallistaeStarboard = shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData.length;
    const mainDeckCannonsPort = shipData.weapons.cannons.mainDeck.portSide.weaponData.length;
    const mainDeckCannonsStarboard = shipData.weapons.cannons.mainDeck.starboardSide.weaponData.length;
    const lowerDeckCannonsPort = shipData.weapons.cannons.lowerDeck.portSide.weaponData.length;
    const lowerDeckCannonsStarboard = shipData.weapons.cannons.lowerDeck.starboardSide.weaponData.length;
    const mainDeckMangonelsPort = shipData.weapons.mangonels.mainDeck.portSide.weaponData.length;
    const mainDeckMangonelsStarboard = shipData.weapons.mangonels.mainDeck.starboardSide.weaponData.length;
    const mainDeckTrebuchetsPort = shipData.weapons.trebuchets.mainDeck.portSide.weaponData.length;
    const mainDeckTrebuchetsStarboard = shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData.length;
    const mainDeckTotalBallistae = mainDeckBallistaePort + mainDeckBallistaeStarboard;
    const mainDeckTotalCannons = mainDeckCannonsPort + mainDeckCannonsStarboard;
    const mainDeckTotalMangonels = mainDeckMangonelsPort + mainDeckMangonelsStarboard;
    const mainDeckTotalTrebuchets = mainDeckTrebuchetsPort + mainDeckTrebuchetsStarboard;
    const lowerDeckTotalBallistae = lowerDeckBallistaePort + lowerDeckBallistaeStarboard;
    const lowerDeckTotalCannons = lowerDeckCannonsPort + lowerDeckCannonsStarboard;
    const totalBallistae = mainDeckBallistaePort + mainDeckBallistaeStarboard + lowerDeckBallistaePort + lowerDeckBallistaeStarboard;
    const totalCannons = mainDeckCannonsPort + mainDeckCannonsStarboard + lowerDeckCannonsPort + lowerDeckCannonsStarboard;
    const totalMangonels = mainDeckMangonelsPort + mainDeckMangonelsStarboard;
    const totalTrebuchets = mainDeckTrebuchetsPort + mainDeckTrebuchetsStarboard;
    /*
        const ballistaeNormalRange = shipData.weapons.ballistae.statBlock.normalRange;
        const ballistaeMaxRange = shipData.weapons.ballistae.statBlock.maxRange;
        const cannonsNormalRange = shipData.weapons.cannons.statBlock.normalRange;
        const cannonsMaxRange = shipData.weapons.cannons.statBlock.maxRange;
        const mainDeckWeaponsPort = mainDeckBallistaePort + mainDeckCannonsPort + mainDeckMangonelsPort + mainDeckTrebuchetsPort;
        const mainDeckWeaponsStarboard = mainDeckBallistaeStarboard + mainDeckCannonsStarboard + mainDeckMangonelsStarboard + mainDeckTrebuchetsStarboard;
        const lowerDeckWeaponsPort = lowerDeckBallistaePort + lowerDeckCannonsPort;
        const lowerDeckWeaponsStarboard = lowerDeckBallistaeStarboard + lowerDeckCannonsStarboard;
     */
    return (
      <div className="admin-card weapons-info-admin-card">
        <h1>Ship Weapons Info</h1>
        <div className="weapon-categories-container">
          {["ballistae", "cannons", "mangonels", "trebuchets"].map((weaponType) => {
            const weaponData = shipData.weapons[weaponType];
            if (!weaponData) return null; // Prevent errors if a weapon type is missing
            return (
              <div key={weaponType} className="weapon-category">
                <h2>{weaponType.charAt(0).toUpperCase() + weaponType.slice(1)}</h2>
                <p>
                  <strong>Armor Class:</strong>{" "}
                  <span className="clickable-stat" onClick={() => handleWeaponStatClick("armorClass", weaponType)}>
                    {weaponData.statBlock.armorClass}
                  </span>
                </p>
                <p>
                  <strong>Max HP:</strong>{" "}
                  <span className="clickable-stat" onClick={() => handleWeaponStatClick("maxHP", weaponType)}>
                    {weaponData.statBlock.maxHP}
                  </span>
                </p>
                <p>
                  <strong>Normal Range:</strong>{" "}
                  <span className="clickable-stat" onClick={() => handleWeaponStatClick("normalRange", weaponType)}>
                    {weaponData.statBlock.normalRange} ft.
                  </span>
                </p>
                <p>
                  <strong>Max Range:</strong>{" "}
                  <span className="clickable-stat" onClick={() => handleWeaponStatClick("maxRange", weaponType)}>
                    {weaponData.statBlock.maxRange} ft.
                  </span>
                </p>
                <hr />
                <div className="equipped-weapons-container">
                  <h3>Equipped:</h3>
                  {weaponType === "ballistae" && (
                    <>
                      <p><strong>Ballistae Equipped: </strong> {totalBallistae}</p>
                      {mainDeckTotalBallistae > 0 && (
                        <>
                          <p><strong>Main Deck: </strong>{mainDeckTotalBallistae}</p>
                          <p className="equipped-weapon-item">MD Port Side:</p>
                          {shipData.weapons.ballistae.mainDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "hp", shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.ballistae.statBlock.maxHP}{" HP"}
                            </p>
                          ))}
                          <p className="equipped-weapon-item">MD Starboard Side:</p>
                          {shipData.weapons.ballistae.mainDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "hp", shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.ballistae.statBlock.maxHP} HP

                            </p>
                          ))}
                        </>
                      )}
                      {lowerDeckTotalBallistae > 0 && (
                        <>
                          <p><strong>Lower Deck: </strong>{lowerDeckTotalBallistae}</p>
                          <p className="equipped-weapon-item">LD Port Side:</p>
                          {shipData.weapons.ballistae.lowerDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "portSide", index, "isLoaded", shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "portSide", index, "hp", shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.ballistae.statBlock.maxHP} HP
                            </p>
                          ))}
                          <p className="equipped-weapon-item">LD Starboard Side:</p>
                          {shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "starboardSide", index, "isLoaded", shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "starboardSide", index, "hp", shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.ballistae.statBlock.maxHP} HP
                            </p>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  {weaponType === "cannons" && (
                    <>
                      <p><strong>Cannons Equipped: </strong> {totalCannons}</p>
                      {mainDeckTotalCannons > 0 && (
                        <>
                          <p><strong>Main Deck: </strong>{mainDeckTotalCannons}</p>
                          <p className="equipped-weapon-item">MD Port Side:</p>
                          {shipData.weapons.cannons.mainDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.cannons.mainDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.cannons.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "hp", shipData.weapons.cannons.mainDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.cannons.mainDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.cannons.statBlock.maxHP} HP
                            </p>
                          ))}
                          <p className="equipped-weapon-item">MD Starboard Side:</p>
                          {shipData.weapons.cannons.mainDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "hp", shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.cannons.statBlock.maxHP} HP
                            </p>
                          ))}
                        </>
                      )}
                      {lowerDeckTotalCannons > 0 && (
                        <>
                          <p><strong>Lower Deck: </strong>{lowerDeckTotalCannons}</p>
                          <p className="equipped-weapon-item">LD Port Side:</p>
                          {shipData.weapons.cannons.lowerDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "portSide", index, "isLoaded", shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "portSide", index, "hp", shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.cannons.statBlock.maxHP} HP
                            </p>
                          ))}
                          <p className="equipped-weapon-item">LD Starboard Side:</p>
                          {shipData.weapons.cannons.lowerDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "starboardSide", index, "isLoaded", shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "lowerDeck", "starboardSide", index, "hp", shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.cannons.statBlock.maxHP} HP
                            </p>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  {weaponType === "mangonels" && (
                    <>
                      <p><strong>Mangonels Equipped: </strong> {totalMangonels}</p>
                      {mainDeckTotalMangonels > 0 && (
                        <>
                          <p><strong>Main Deck: </strong>{mainDeckTotalMangonels}</p>
                          <p className="equipped-weapon-item">MD Port Side:</p>
                          {shipData.weapons.mangonels.mainDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "hp", shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.mangonels.statBlock.maxHP} HP
                            </p>
                          ))}
                          <p className="equipped-weapon-item">MD Starboard Side:</p>
                          {shipData.weapons.mangonels.mainDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "hp", shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.mangonels.statBlock.maxHP} HP
                            </p>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  {weaponType === "trebuchets" && (
                    <>
                      <p><strong>Trebuchets Equipped: </strong> {totalTrebuchets}</p>
                      {mainDeckTotalTrebuchets > 0 && (
                        <>
                          <p><strong>Main Deck: </strong>{mainDeckTotalTrebuchets}</p>
                          <p className="equipped-weapon-item">MD Port Side:</p>
                          {shipData.weapons.trebuchets.mainDeck.portSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "portSide", index, "hp", shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.trebuchets.statBlock.maxHP} HP
                            </p>
                          ))}
                          <p className="equipped-weapon-item">MD Starboard Side:</p>
                          {shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData.map((weapon, index) => (
                            <p key={index} className="equipped-weapon-sub-item">
                              {index}:{" "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].isLoaded)}
                              >
                                ({shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                              </span>{" - "}
                              <span
                                className="clickable-stat"
                                onClick={() => handleEquippedWeaponStatusClick(weaponType, "mainDeck", "starboardSide", index, "hp", shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].hp)}
                              >
                                {shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].hp}
                              </span>
                              {" / "}{shipData.weapons.trebuchets.statBlock.maxHP} HP
                            </p>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
                <hr />
                <h3>Ammo:</h3>
                {Object.entries(weaponData.ammo)
                  .sort(([ammoTypeA], [ammoTypeB]) => {
                    const standardAmmoTypes = {
                      ballistae: ["boltStandard"],
                      cannons: ["cannonballStandard"],
                      mangonels: ["mangonelStoneStandard"],
                      trebuchets: ["trebuchetStoneStandard"],
                    };

                    const weaponStandardAmmo = standardAmmoTypes[weaponType] || [];

                    const isAStandard = weaponStandardAmmo.includes(ammoTypeA);
                    const isBStandard = weaponStandardAmmo.includes(ammoTypeB);

                    if (isAStandard && !isBStandard) return -1; // A should come first
                    if (!isAStandard && isBStandard) return 1;  // B should come first

                    return ammoTypeA.localeCompare(ammoTypeB); // Alphabetical order otherwise
                  })
                  .map(([ammoType, ammoData]) => (
                    <p key={ammoType} className="equipped-ammo-item">
                      <strong>
                        {ammoType
                          .replace(/(trebuchet|mangonel|bolt|cannonball|stone)/gi, "")
                          .replace(/([a-z])([A-Z])/g, "$1 $2")
                          .trim()}:
                      </strong>{" "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleAmmoClick(weaponType, ammoType, ammoData.ammoStored)}
                      >
                        {ammoData.ammoStored}
                      </span>
                    </p>
                  ))}
                {selectedWeaponStat && (
                  <div className="stat-edit-container weapon-stat-edit-container">
                    <h3>
                      Editing{" "}
                      {selectedWeaponStat.statKey
                        .replace(/([a-z])([A-Z])/g, "$1 $2") // Convert camelCase to spaced words
                        .replace(/^./, (char) => char.toUpperCase())}{" "}  {/* Capitalize first letter */}
                      for{" "}
                      {selectedWeaponStat.weaponType
                        .replace(/^./, (char) => char.toUpperCase())} {/* Capitalize first letter */}
                    </h3>
                    <p>
                      <input
                        ref={inputRef}
                        type="number"
                        value={newWeaponValue}
                        onChange={(e) => setNewWeaponValue(e.target.value)}
                      />
                    </p>
                    <p>
                      <button onClick={handleSubmitWeaponUpdate}>Submit</button>
                      <button onClick={() => setSelectedWeaponStat(null)}>Cancel</button>
                    </p>
                  </div>
                )}
                {selectedAmmoValue && (
                  <div className="stat-edit-container weapon-stat-edit-container">
                    <h3>
                      Editing{" "}
                      {selectedAmmoValue.ammoType
                        .replace(/(trebuchet|mangonel|bolt|cannonball|stone)/gi, "")
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .trim()
                        .replace(/^./, (char) => char.toUpperCase())}{" "}
                      Ammo Count for{" "}
                      {selectedAmmoValue.weaponType
                        .replace(/^./, (char) => char.toUpperCase())}
                    </h3>
                    <p>
                      <input
                        ref={inputRef}
                        type="number"
                        value={newAmmoValue}
                        onChange={(e) => setNewAmmoValue(e.target.value)}
                      />
                    </p>
                    <p>
                      <button onClick={handleSubmitAmmoUpdate}>Submit</button>
                      <button onClick={() => setSelectedAmmoValue(null)}>Cancel</button>
                    </p>
                  </div>
                )}
                {selectedEquippedWeaponStatus && (
                  <div className="stat-edit-container weapon-stat-edit-container">
                    <h3>
                      Editing{" "}
                      {selectedEquippedWeaponStatus.key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase())}
                      {" "} for {selectedEquippedWeaponStatus.weaponType} {" "}
                      on {selectedEquippedWeaponStatus.deck} Deck, {selectedEquippedWeaponStatus.side} Side, Weapon #{selectedEquippedWeaponStatus.index + 1}
                    </h3>

                    <p>
                      {selectedEquippedWeaponStatus.key === "isLoaded" ? (
                        // Boolean toggle for isLoaded
                        <select
                          ref={inputRef}
                          value={newEquippedWeaponStatus}
                          onChange={(e) => setNewEquippedWeaponStatus(e.target.value)}
                        >
                          <option value="true">Loaded</option>
                          <option value="false">Unloaded</option>
                        </select>
                      ) : (
                        // Numeric input for HP
                        <input
                          ref={inputRef}
                          type="number"
                          value={newEquippedWeaponStatus}
                          onChange={(e) => setNewEquippedWeaponStatus(e.target.value)}
                        />
                      )}
                    </p>

                    <p>
                      <button onClick={handleSubmitEquippedWeaponStatusUpdate}>Submit</button>
                      <button onClick={() => setSelectedEquippedWeaponStatus(null)}>Cancel</button>
                    </p>
                  </div>
                )}

              </div>
            );
          })}
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
          <h3 key={section}>
            {section.replace("hull", "")}:{" "}
            <span className="clickable-stat" onClick={() => handleHullStatClick(section)}>
              {shipData.hull[section]}
            </span>{" "}
            /{" "}
            <span className="clickable-stat" onClick={() => handleHullStatClick(`${section}Max`)}>
              {shipData.hull[`${section}Max`]}
            </span>
          </h3>
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
