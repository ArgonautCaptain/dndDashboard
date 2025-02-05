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
  const [selectedDiceType, setSelectedDiceType] = useState(null);
  const [newDiceSideCount, setNewDiceSideCount] = useState("");
  const [selectedDiceCount, setSelectedDiceCount] = useState(null);
  const [newDiceCount, setNewDiceCount] = useState("");
  const [selectedMovementStat, setSelectedMovementStat] = useState(null);
  const [newMovementValue, setNewMovementValue] = useState("");

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
    if ((selectedStat || selectedHullStat || selectedWeaponStat || selectedAmmoValue || selectedMovementStat) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select text for easy editing
    }
  }, [selectedStat, selectedHullStat, selectedWeaponStat, selectedAmmoValue, selectedMovementStat]);

  //ability score card functions

  const shipInfoCard = () => {
    const abilityScoreOrder = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

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

        // Reset selection
        setSelectedStat(null);
        setNewStatValue("");
      } catch (error) {
        console.error("Error updating ability score:", error);
      }
    };

    const shipStatEditor = () => {
      return (
        <>
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
        </>
      )
    };

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
        {shipStatEditor()}
      </div>
    );
  };

  //hull card

  const shipHullCard = () => {

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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitHullUpdate(); // Submit on Enter key
                  if (e.key === 'Escape') setSelectedHullStat(null); // Cancel on Escape key
                }}
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

  //weapons card

  const shipWeaponsCard = () => {
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

    // Weapon stat functions

    const weaponStats = (type, data) => {
      return (
        <>
          <h2>{type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <p>
            <strong>Armor Class:</strong>{" "}
            <span className="clickable-stat" onClick={() => handleWeaponStatClick("armorClass", type)}>
              {data.statBlock.armorClass}
            </span>
          </p>
          <p>
            <strong>Max HP:</strong>{" "}
            <span className="clickable-stat" onClick={() => handleWeaponStatClick("maxHP", type)}>
              {data.statBlock.maxHP}
            </span>
          </p>
          <p>
            <strong>Normal Range:</strong>{" "}
            <span className="clickable-stat" onClick={() => handleWeaponStatClick("normalRange", type)}>
              {data.statBlock.normalRange} ft.
            </span>
          </p>
          <p>
            <strong>Max Range:</strong>{" "}
            <span className="clickable-stat" onClick={() => handleWeaponStatClick("maxRange", type)}>
              {data.statBlock.maxRange} ft.
            </span>
          </p>
        </>
      )
    };

    const weaponStatEditor = () => {
      return (
        <>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitWeaponUpdate(); // Submit on Enter key
                    if (e.key === 'Escape') setSelectedWeaponStat(null); // Cancel on Escape key
                  }}
                />
              </p>
              <p>
                <button onClick={handleSubmitWeaponUpdate}>Submit</button>
                <button onClick={() => setSelectedWeaponStat(null)}>Cancel</button>
              </p>
            </div>
          )}
        </>
      )
    };

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

    //Equipped weapon status functions

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

    const ballistaeEquipped = (type) => {
      return (
        <>
          {type === "ballistae" && (
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "hp", shipData.weapons.ballistae.mainDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "hp", shipData.weapons.ballistae.mainDeck.starboardSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "portSide", index, "isLoaded", shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "portSide", index, "hp", shipData.weapons.ballistae.lowerDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "starboardSide", index, "isLoaded", shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "starboardSide", index, "hp", shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData[index].hp)}
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
        </>
      )
    };

    const cannonsEquipped = (type) => {
      return (
        <>
          {type === "cannons" && (
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.cannons.mainDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.cannons.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "hp", shipData.weapons.cannons.mainDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "hp", shipData.weapons.cannons.mainDeck.starboardSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "portSide", index, "isLoaded", shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "portSide", index, "hp", shipData.weapons.cannons.lowerDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "starboardSide", index, "isLoaded", shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "lowerDeck", "starboardSide", index, "hp", shipData.weapons.cannons.lowerDeck.starboardSide.weaponData[index].hp)}
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
        </>
      )
    };

    const mangonelsEquipped = (type) => {
      return (
        <>
          {type === "mangonels" && (
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "hp", shipData.weapons.mangonels.mainDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "hp", shipData.weapons.mangonels.mainDeck.starboardSide.weaponData[index].hp)}
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
        </>
      )
    };

    const trebuchetsEquipped = (type) => {
      return (
        <>
          {type === "trebuchets" && (
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "isLoaded", shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "portSide", index, "hp", shipData.weapons.trebuchets.mainDeck.portSide.weaponData[index].hp)}
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
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "isLoaded", shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].isLoaded)}
                      >
                        ({shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].isLoaded ? "L" : "U"})
                      </span>{" - "}
                      <span
                        className="clickable-stat"
                        onClick={() => handleEquippedWeaponStatusClick(type, "mainDeck", "starboardSide", index, "hp", shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData[index].hp)}
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
        </>
      )
    };

    const weaponStatusEditor = () => {
      return (
        <>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitEquippedWeaponStatusUpdate(); // Submit on Enter key
                      if (e.key === 'Escape') setSelectedEquippedWeaponStatus(null); // Cancel on Escape key
                    }}
                  />
                )}
              </p>

              <p>
                <button onClick={handleSubmitEquippedWeaponStatusUpdate}>Submit</button>
                <button onClick={() => setSelectedEquippedWeaponStatus(null)}>Cancel</button>
              </p>
            </div>
          )}
        </>
      )
    };

    // Ammo count editor functions

    const ammoStores = (ammoEntries, type) => {
      return (
        <>
          {ammoEntries.sort(([ammoTypeA], [ammoTypeB]) => {
            const standardAmmoTypes = {
              ballistae: ["boltStandard"],
              cannons: ["cannonballStandard"],
              mangonels: ["mangonelStoneStandard"],
              trebuchets: ["trebuchetStoneStandard"],
            };

            const weaponStandardAmmo = standardAmmoTypes[type] || [];

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
                  onClick={() => handleAmmoClick(type, ammoType, ammoData.ammoStored)}
                >
                  {ammoData.ammoStored}
                </span>
              </p>
            ))}
        </>
      )
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
        setSelectedAmmoValue(null);
      } catch (error) {
        console.error("Error updating ammo:", error);
      }
    };

    const ammoCountEditor = () => {
      return (
        <>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitAmmoUpdate(); // Submit on Enter key
                    if (e.key === 'Escape') setSelectedAmmoValue(null); // Cancel on Escape key
                  }}
                />
              </p>
              <p>
                <button onClick={handleSubmitAmmoUpdate}>Submit</button>
                <button onClick={() => setSelectedAmmoValue(null)}>Cancel</button>
              </p>
            </div>
          )}
        </>
      )
    };



    return (
      <div className="admin-card weapons-info-admin-card">
        <h1>Ship Weapons Info</h1>
        <div className="weapon-categories-container">
          {["ballistae", "cannons", "mangonels", "trebuchets"].map((weaponType) => {
            const weaponData = shipData.weapons[weaponType];
            if (!weaponData) return null; // Prevent errors if a weapon type is missing
            return (
              <div key={weaponType} className="weapon-category">
                {weaponStats(weaponType, weaponData)}
                <hr />
                <div className="equipped-weapons-container">
                  <h3>Equipped:</h3>
                  {ballistaeEquipped(weaponType)}
                  {cannonsEquipped(weaponType)}
                  {mangonelsEquipped(weaponType)}
                  {trebuchetsEquipped(weaponType)}
                </div>
                <hr />
                <h3>Ammo:</h3>
                {ammoStores(Object.entries(weaponData.ammo), weaponType)}
                {/* Value Editor Containers */}
                {weaponStatEditor()}
                {ammoCountEditor()}
                {weaponStatusEditor()}

              </div>
            );
          })}
        </div>
      </div>
    )
  };

  //dice card functions

  const shipDiceCard = () => {

    const handleDiceTypeClick = (whichDice) => {
      setSelectedDiceType(whichDice);
      setNewDiceSideCount(shipData.shipDice[whichDice]);
    };

    const handleSubmitDiceTypeUpdate = async () => {
      if (!selectedDiceType || isNaN(parseInt(newDiceSideCount))) return;

      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await updateDoc(shipRef, {
          [`shipDice.${selectedDiceType}`]: parseInt(newDiceSideCount)
        });
        console.log(`Updated ${selectedDiceType} to d${newDiceSideCount}`);
        setSelectedDiceType(null);
        setNewDiceSideCount("");
      } catch (error) {
        console.error("Error updating dice data:", error);
      }
    };

    const diceTypeEditor = () => {
      return (
        <>
          {selectedDiceType && (
            <div className="stat-edit-container">
              <h3>Editing Dice Type for {selectedDiceType}</h3>
              <p>
                <select
                  ref={inputRef}
                  value={newDiceSideCount}
                  onChange={(e) => setNewDiceSideCount(e.target.value)}
                >
                  <option value="4">d4</option>
                  <option value="6">d6</option>
                  <option value="8">d8</option>
                  <option value="10">d10</option>
                  <option value="12">d12</option>
                  <option value="20">d20</option>
                </select>
              </p>
              <p>
                <button onClick={handleSubmitDiceTypeUpdate}>Submit</button>
                <button onClick={() => setSelectedDiceType(null)}>Cancel</button>
              </p>
            </div>

          )}
        </>
      )
    };

    const handleDiceCountClick = (whichDice) => {
      setSelectedDiceCount(whichDice);
      setNewDiceCount(shipData.shipDice[whichDice]);
    };

    const handleSubmitDiceCountUpdate = async () => {
      if (!selectedDiceCount || isNaN(parseInt(newDiceCount))) return;

      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await updateDoc(shipRef, {
          [`shipDice.${selectedDiceCount}`]: parseInt(newDiceCount)
        });
        console.log(`Updated ${selectedDiceCount} to ${newDiceCount}`);
        setSelectedDiceCount(null);
        setNewDiceCount("");
      } catch (error) {
        console.error("Error updating dice data:", error);
      }
    };

    const diceCountEditor = () => {
      return (
        <>
          {selectedDiceCount && (
            <div className="stat-edit-container">
              <h3>Editing Dice Count for {selectedDiceCount}</h3>
              <p>
                <input
                  ref={inputRef}
                  type="number"
                  value={newDiceCount}
                  onChange={(e) => setNewDiceCount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitDiceCountUpdate(); // Submit on Enter key
                    if (e.key === 'Escape') setSelectedDiceCount(null); // Cancel on Escape key
                  }}
                />
              </p>
              <p>
                <button onClick={handleSubmitDiceCountUpdate}>Submit</button>
                <button onClick={() => setSelectedDiceCount(null)}>Cancel</button>
              </p>
            </div>
          )}
        </>
      )
    };

    return (
      <div className="admin-card dice-info-admin-card">
        <h1>Ship Dice Info</h1>
        <h3>
          <strong>Command Dice:</strong>
          <span className="clickable-stat" onClick={() => handleDiceTypeClick("commandDiceType", shipData.shipDice.commandDiceType)}>
            {" d"}{shipData.shipDice.commandDiceType}{" "}
          </span>
          {"( "}
          <span className="clickable-stat" onClick={() => handleDiceCountClick("commandDiceLeft")}>
            {shipData.shipDice.commandDiceLeft}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleDiceCountClick("commandDiceMax")}>
            {shipData.shipDice.commandDiceMax}
          </span>
          {" )"}
        </h3>
        <h3>
          <strong>Hull Dice:</strong>
          <span className="clickable-stat" onClick={() => handleDiceTypeClick("hullDiceType", shipData.shipDice.hullDiceType)}>
            {" d"}{shipData.shipDice.hullDiceType}{" "}
          </span>
          {"( "}
          <span className="clickable-stat" onClick={() => handleDiceCountClick("hullDiceLeft")}>
            {shipData.shipDice.hullDiceLeft}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleDiceCountClick("hullDiceMax")}>
            {shipData.shipDice.hullDiceMax}
          </span>
          {" )"}
        </h3>
        {diceCountEditor()}
        {diceTypeEditor()}
      </div>
    )
  };

  //movement card functions

  const shipMovementCard = () => {
    const sailsCurrentHP = shipData.movementSails.sailForeHP + shipData.movementSails.sailMainHP + shipData.movementSails.sailAftHP;
    const sailsMaxHP = shipData.movementSails.sailForeMaxHP + shipData.movementSails.sailMainMaxHP + shipData.movementSails.sailAftMaxHP;

    const calculatedSpeed = (baseSpeed, currentHP, maxHP) => {
      if (currentHP === 0) {
        return 0; // If sails HP is 0, speed is 0
      }

      const reducedSpeed = baseSpeed - Math.floor((maxHP - currentHP) / 25) * 5;
      return Math.max(reducedSpeed, 0); // Ensure speed is never negative
    };

    const handleMovementStatClick = (componentKey, statKey, currentValue) => {
      setSelectedMovementStat({ componentKey, statKey });
      setNewMovementValue(currentValue);
    };

    const handleSubmitMovementStatUpdate = async () => {
      if (!selectedMovementStat || isNaN(parseInt(newMovementValue))) return;

      const { componentKey, statKey } = selectedMovementStat;
      const newValue = parseInt(newMovementValue);

      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await updateDoc(shipRef, {
          [`${componentKey}.${statKey}`]: newValue,
        });
        console.log(`Updated ${componentKey}.${statKey} to ${newValue}`);
        setSelectedMovementStat(null);
        setNewMovementValue("");
      } catch (error) {
        console.error("Error updating movement data:", error);
      }
    };

    const movementStatEditor = () => {
      return (
        <>
          {selectedMovementStat && (
            <div className="stat-edit-container">
              <h3>Editing{" "}
                {selectedMovementStat.statKey
                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                  .replace(/^./, (char) => char.toUpperCase())}{" "}
                  Value for{" "}
                {selectedMovementStat.componentKey
                  .replace(/([a-z])([A-Z])/g, "$1 $2")
                  .replace(/^./, (char) => char.toUpperCase())}
              </h3>
              <p>
                <input
                  ref={inputRef}
                  type="number"
                  value={newMovementValue}
                  onChange={(e) => setNewMovementValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitMovementStatUpdate(); // Submit on Enter key
                    if (e.key === 'Escape') setSelectedMovementStat(null); // Cancel on Escape key
                  }}
                />
              </p>
              <p>
                <button onClick={handleSubmitMovementStatUpdate}>Submit</button>
                <button onClick={() => setSelectedMovementStat(null)}>Cancel</button>
              </p>
            </div>
          )}
        </>
      )
    }

    return (
      <div className="admin-card movement-info-admin-card">
        <h1>Ship Movement Info</h1>
        <p><strong>Helm HP: </strong>
          <span className="clickable-stat" onClick={() => handleMovementStatClick("helmControl", "hitPoints", shipData.helmControl.hitPoints)}>
            {shipData.helmControl.hitPoints}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("helmControl", "maxHP", shipData.helmControl.maxHP)}>
            {shipData.helmControl.maxHP}
          </span>
        </p>
        <p><strong>Helm Armor Class: </strong>
          <span className="clickable-stat" onClick={() => handleMovementStatClick("helmControl", "armorClass", shipData.helmControl.armorClass)}>
            {shipData.helmControl.armorClass}
          </span>
        </p>
        <p><strong>Sails HP:</strong></p>
        <p className="sails-data">
          {"Fore Sails: "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailForeHP", shipData.movementSails.sailForeHP)}>
            {shipData.movementSails.sailForeHP}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailForeMaxHP", shipData.movementSails.sailForeMaxHP)}>
            {shipData.movementSails.sailForeMaxHP}
          </span>
        </p>
        <p className="sails-data">
          {"Main Sails: "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailMainHP", shipData.movementSails.sailMainHP)}>
            {shipData.movementSails.sailMainHP}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailMainMaxHP", shipData.movementSails.sailMainMaxHP)}>
            {shipData.movementSails.sailMainMaxHP}
          </span>
        </p>
        <p className="sails-data">
          {"Aft Sails: "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailAftHP", shipData.movementSails.sailAftHP)}>
            {shipData.movementSails.sailAftHP}
          </span>
          {" / "}
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "sailAftMaxHP", shipData.movementSails.sailAftMaxHP)}>
            {shipData.movementSails.sailAftMaxHP}
          </span>
        </p>
        <p><strong>Base Sailing Speed: </strong>
          <span className="clickable-stat" onClick={() => handleMovementStatClick("movementSails", "speedBase", shipData.movementSails.speedBaseHP)}>
            {shipData.movementSails.speedBase}
          </span>
          {" ft."}
        </p>
        <p><strong>Calculated Current Speed: </strong>{calculatedSpeed(shipData.movementSails.speed, sailsCurrentHP, sailsMaxHP)}{" ft."}</p>
        <p><strong>Travel Pace: </strong>
          {shipData.travelPace}
        </p>
        {movementStatEditor()}
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
              <div className="dm-panel-container">
                <div className="dm-panel-left-container">
                  {shipInfoCard()}
                  {shipHullCard()}
                </div>
                <div className="dm-panel-center-container">
                  {shipWeaponsCard()}
                </div>
                <div className="dm-panel-right-container">
                  {shipDiceCard()}
                  {shipMovementCard()}
                  {shipCrewCard()}
                </div>
              </div>
            </>
          )}
        </div>
      }
    </>
  );
};

export default AdminPanel;
