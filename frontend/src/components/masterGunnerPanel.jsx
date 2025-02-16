import { useState } from "react";
import PropTypes from 'prop-types';
import { keyframes } from "@mui/system";
import { Button } from "@mui/material";
import { doc, runTransaction, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import removeOrder from "../utils/removeOrder.js";
import executeOrders from "../utils/executeOrders.js";
import BallistaWeaponStats from "./ballistaeWeaponStats.jsx";
import CannonWeaponStats from "./cannonWeaponStats.jsx";
import RenderWeapons from "./renderWeapons.jsx";


//TODO: Allow other roles to use their action to assist with Weapons, giving the Master Gunner an additional Weapon Action for that turn
//TODO: Allow the Personnel Officer to assign Miscellaneous Crew to assist with Weapons or Navigation

const MasterGunnerPanel = ({ shipData, activeRole, activeRoleTab }) => {
  const [orders, setOrders] = useState([]); // Empty orders list
  const [attackModalOpen, setAttackModalOpen] = useState(false);

  if (activeRole !== "Master Gunner") {
    return null;
  }

  const weaponsActionsPerTurn = shipData ? shipData.gunnerOrders.actionsCurrentTotal : 0;
  const weaponsActionsRemaining = shipData ? shipData.gunnerOrders.actionsRemaining : 0;
  const totalBallistaeBoltsStandard = shipData.weapons.ballistae.ammo.boltStandard.ammoStored;
  const totalBallistaeBoltsFlaming = shipData.weapons.ballistae.ammo.boltFlaming.ammoStored;
  const totalBallistaeBoltsHarpoon = shipData.weapons.ballistae.ammo.boltHarpoon.ammoStored;
  const totalCannonballsStandard = shipData.weapons.cannons.ammo.cannonballStandard.ammoStored;
  const totalCannonballsArmorPiercing = shipData.weapons.cannons.ammo.cannonballArmorPiercing.ammoStored;
  const totalCannonballsChainshot = shipData.weapons.cannons.ammo.cannonballChainshot.ammoStored;
  const totalCannonballsInfernoShell = shipData.weapons.cannons.ammo.cannonballInfernoShell.ammoStored;
  const totalCannonballsSmokeShell = shipData.weapons.cannons.ammo.cannonballSmokeShell.ammoStored;
  const totalMangonelStonesStandard = shipData.weapons.mangonels.ammo.mangonelStoneStandard.ammoStored;
  const totalTrebuchetStonesStandard = shipData.weapons.trebuchets.ammo.trebuchetStoneStandard.ammoStored;
  const mainDeckBallistaePort = shipData.weapons.ballistae.mainDeck.portSide.weaponData.length;
  const mainDeckBallistaeStarboard = shipData.weapons.ballistae.mainDeck.starboardSide.weaponData.length;
  const lowerDeckBallistaePort = shipData.weapons.ballistae.lowerDeck.portSide.weaponData.length;
  const lowerDeckBallistaeStarboard = shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData.length;
  const mainDeckCannonsPort = shipData.weapons.cannons.mainDeck.portSide.weaponData.length;
  const mainDeckCannonsStarboard = shipData.weapons.cannons.mainDeck.starboardSide.weaponData.length;
  const lowerDeckCannonsPort = shipData.weapons.cannons.lowerDeck.portSide.weaponData.length;
  const lowerDeckCannonsStarboard = shipData.weapons.cannons.lowerDeck.starboardSide.weaponData.length;
/*   const mainDeckMangonelsPort = shipData.weapons.mangonels.mainDeck.portSide.weaponData.length;
  const mainDeckMangonelsStarboard = shipData.weapons.mangonels.mainDeck.starboardSide.weaponData.length;
  const mainDeckTrebuchetsPort = shipData.weapons.trebuchets.mainDeck.portSide.weaponData.length;
  const mainDeckTrebuchetsStarboard = shipData.weapons.trebuchets.mainDeck.starboardSide.weaponData.length; */
  const totalBallistae = mainDeckBallistaePort + mainDeckBallistaeStarboard + lowerDeckBallistaePort + lowerDeckBallistaeStarboard;
  const totalCannons = mainDeckCannonsPort + mainDeckCannonsStarboard + lowerDeckCannonsPort + lowerDeckCannonsStarboard;
/*   const totalMangonels = mainDeckMangonelsPort + mainDeckMangonelsStarboard;
  const totalTrebuchets = mainDeckTrebuchetsPort + mainDeckTrebuchetsStarboard; */
  const ballistaeNormalRange = shipData.weapons.ballistae.statBlock.normalRange;
  const ballistaeMaxRange = shipData.weapons.ballistae.statBlock.maxRange;
  const cannonsNormalRange = shipData.weapons.cannons.statBlock.normalRange;
  const cannonsMaxRange = shipData.weapons.cannons.statBlock.maxRange;

/*   const mainDeckWeaponsStarboard = mainDeckBallistaeStarboard + mainDeckCannonsStarboard + mainDeckMangonelsStarboard + mainDeckTrebuchetsStarboard;
  const lowerDeckWeaponsPort = lowerDeckBallistaePort + lowerDeckCannonsPort;
  const lowerDeckWeaponsStarboard = lowerDeckBallistaeStarboard + lowerDeckCannonsStarboard; */


  const MasterGunnerOrdersPanel = () => {

    return (
      <div className="master-gunner-orders-panel">
        <div className="gunner-actions"><strong>Actions Remaining This Turn: </strong>{weaponsActionsRemaining}{" / "}{weaponsActionsPerTurn}</div>
        <ul>
          {orders.map((order, index) => (
            <li key={index}>
              {order.action}{" "}{order.locationString}{" "}{order.weaponType}{" #"}{order.weaponIndex + 1}
              <button onClick={() => removeOrder(shipData, index, orders, setOrders)}>❌</button>
            </li>
          ))}
        </ul>
        <button className="gunner-orders-button" onClick={() => { executeOrders(shipData, orders, setOrders) }} disabled={orders.length === 0}>
          Give the Order!
        </button>
      </div>
    )
  };

  const MasterGunnerApprovedOrdersPanel = () => {
    const handleMasterGunnerApprovedOrdersButtonClick = () => {
      /* console.log(shipData); */
      setAttackModalOpen(true);
    };

    const flash = keyframes`
    0% { background-color: #323232; }
    50% { background-color: red; }
    100% { background-color: #323232; }
    `;

    const approvedOrders = () => {
      const currentApprovedOrders = shipData.gunnerOrders.orderApproved;

      const ammoString = (ammo) => {
        switch (ammo) {
          case "boltStandard":
            return "Standard Bolt";
          case "boltFlaming":
            return "Flaming Bolt";
          case "boltHarpoon":
            return "Harpoon Bolt";
          case "cannonballStandard":
            return "Standard Cannonball";
          case "cannonballArmorPiercing":
            return "Armor-Piercing Cannonball";
          case "cannonballChainshot":
            return "Chainshot";
          case "cannonballInfernoShell":
            return "Inferno Shell";
          case "cannonballSmokeShell":
            return "Smoke Shell";
          default:
            return "Unknown";
        };
      };

      function handleD20RollClick(deck, side, weaponType, weaponIndex, modifier) {
        const tsLinkString = "talespire://dice/" + deck + "%20" + side + "%20" + weaponType + "%20#" + weaponIndex + ":1d20+" + modifier;
        /* console.log(tsLinkString); */
        window.open(tsLinkString);
      }

      function handleDamageRollClick(weaponType, diceString) {
        const tsLinkString = "talespire://dice/" + weaponType + "%20Damage:" + diceString;
        /* console.log(tsLinkString); */
        window.open(tsLinkString);
      }

      return (
        <>
          <table className="approved-orders-table">
            <thead>
              <tr>
                <th>Weapon:</th>
                <th>Ammo Loaded:</th>
                <th>To Hit:</th>
                <th>Damage:</th>
              </tr>
            </thead>
            <tbody>
              {currentApprovedOrders.filter(order => order.action === "Fire").map((order, index) => (
                <tr key={index} className="approved-order-table-item">
                  <td>
                    {order.deck
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^./, (char) => char.toUpperCase())
                    }
                    {" "}
                    {order.side
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/^./, (char) => char.toUpperCase())
                    }
                    {" "}
                    {order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista"}
                    {" #"}
                    {order.weaponIndex + 1}
                  </td>
                  <td>
                    {ammoString(order.ammoLoaded)}
                  </td>
                  <td>
                    <span
                      className="clickable-roll"
                      onClick={() => {
                        handleD20RollClick(
                          order.deck.replace(/([a-z])([A-Z])/g, "$1%20$2").split("%20")[0].charAt(0).toUpperCase() + ". " + order.deck.replace(/([a-z])([A-Z])/g, "$1%20$2").split("%20")[1],
                          order.side.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ")[0].charAt(0).toUpperCase() + ". " + order.side.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ")[1],
                          order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista",
                          order.weaponIndex + 1,
                          shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].toHit
                        )
                      }}
                    >
                      {"(d20 + "}{shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].toHit}{")"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="clickable-roll"
                      onClick={() => {
                        handleDamageRollClick(
                          order.weaponTypeGroup === "cannons" ? "Cannon" : "Ballista",
                          shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceNumber + "d" + shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceType
                        )
                      }}
                    >
                      {"("}{shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceNumber}{"d"}
                      {shipData.weapons[order.weaponTypeGroup].ammo[order.ammoLoaded].damageDiceType}{")"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </>
      )
    };

    const clearWeaponsHasOrders = async () => {
      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await runTransaction(db, async (transaction) => {
          const shipDoc = await transaction.get(shipRef);
          if (!shipDoc.exists()) throw new Error("Ship data not found!");

          const currentWeaponData = shipDoc.data().weapons;

          // Helper function to update weapon status
          const updateWeaponData = (weaponData, weaponType) => {
            if (!weaponData) return []; // Handle undefined or null weaponData
            return weaponData.map((weapon) => {
              if (weapon.hasOrders) {
                if (weapon.isLoaded) {
                  // Weapon was fired
                  return { ...weapon, hasOrders: false, isLoaded: false, loadedWith: "notLoaded" };
                } else {
                  // Weapon was reloaded
                  let ammoType;
                  switch (weaponType) {
                    case "cannons":
                      ammoType = "cannonballStandard";
                      break;
                    case "ballistae":
                      ammoType = "boltStandard";
                      break;
                    case "mangonels":
                      ammoType = "mangonelStoneStandard";
                      break;
                    case "trebuchets":
                      ammoType = "trebuchetStoneStandard";
                      break;
                    default:
                      ammoType = "notLoaded";
                  }
                  return { ...weapon, hasOrders: false, isLoaded: true, loadedWith: ammoType };
                }
              }
              return weapon;
            });
          };

          const updatedWeaponData = {
            ballistae: {
              ...currentWeaponData.ballistae,
              mainDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.ballistae.mainDeck.portSide.weaponData, "ballistae"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.ballistae.mainDeck.starboardSide.weaponData, "ballistae"),
                },
              },
              lowerDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.ballistae.lowerDeck.portSide.weaponData, "ballistae"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.ballistae.lowerDeck.starboardSide.weaponData, "ballistae"),
                },
              },
            },
            cannons: {
              ...currentWeaponData.cannons,
              mainDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.cannons.mainDeck.portSide.weaponData, "cannons"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.cannons.mainDeck.starboardSide.weaponData, "cannons"),
                },
              },
              lowerDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.cannons.lowerDeck.portSide.weaponData, "cannons"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.cannons.lowerDeck.starboardSide.weaponData, "cannons"),
                },
              },
            },
            mangonels: {
              ...currentWeaponData.mangonels,
              mainDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.mangonels.mainDeck.portSide.weaponData, "mangonels"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.mangonels.mainDeck.starboardSide.weaponData, "mangonels"),
                },
              },
            },
            trebuchets: {
              ...currentWeaponData.trebuchets,
              mainDeck: {
                portSide: {
                  weaponData: updateWeaponData(currentWeaponData.trebuchets.mainDeck.portSide.weaponData, "trebuchets"),
                },
                starboardSide: {
                  weaponData: updateWeaponData(currentWeaponData.trebuchets.mainDeck.starboardSide.weaponData, "trebuchets"),
                },
              },
            },
          };

          transaction.update(shipRef, { weapons: updatedWeaponData });
        });
      } catch (error) {
        console.error("Error clearing weapons hasOrders:", error);
      }
    };

    const clearOrders = async () => {
      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await updateDoc(shipRef, {
          [`gunnerOrders.orderApproved`]: [],
        });
        await updateDoc(shipRef, {
          [`gunnerOrders.approvedOrdersArePending`]: false,
        });
        await updateDoc(shipRef, {
          [`gunnerOrders.gunnerTurnEnded`]: true,
        });
        setAttackModalOpen(false);
      } catch (error) {
        console.error("Error clearing orders:", error);
      }
    };

    const handleAttackCompleteButtonClick = async () => {
      if (shipData.gunnerOrders.actionsRemaining !== 0) {
        const confirmEndGunnerTurn = window.confirm("You still have actions remaining this turn. Are you sure you want to end your turn?");
        if (!confirmEndGunnerTurn) return;
      }
      await clearWeaponsHasOrders();
      await clearOrders();
    };

    return (
      <div className="master-gunner-approved-orders-wrapper">
        <Button
          sx={{ animation: `${flash} 2s infinite` }}
          variant="contained"
          className="master-gunner-approved-orders-button"
          onClick={handleMasterGunnerApprovedOrdersButtonClick}
        >
          {"⚔️ Attack Rolls"}
        </Button>
        {attackModalOpen && (
          <div className="attack-modal">
            <button
              className="close-modal-button"
              onClick={() => {
                setAttackModalOpen(false);
              }}
            >
              X
            </button>
            <h1>Weapon Attacks</h1>
            <hr />
            <h2>The DM has approved the following attacks:</h2>
            {approvedOrders()}
            <button
              className="attack-complete-button"
              onClick={handleAttackCompleteButtonClick}
            >
              Weapon Actions Complete
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="role-utility-panel">
        <div className="master-gunner-panel">
          <div className="master-gunner-panel-left">
            <h3>
              Ship Weapons
            </h3>
            <div>
              <strong>Ballistae:</strong> {totalBallistae}
            </div>
            <div>
              <strong>Cannons:</strong> {totalCannons}
            </div>
            <hr /> {/* -------------------------------------- */}
            <h3>
              Weapon Stats
            </h3>
            {BallistaWeaponStats(shipData, ballistaeNormalRange, ballistaeMaxRange)}
            {CannonWeaponStats(shipData, cannonsNormalRange, cannonsMaxRange)}
            <hr /> {/* -------------------------------------- */}
            <h3>
              Ammo Onboard
            </h3>
            {totalBallistaeBoltsStandard > 0 && (
              <div>
                <strong>Ballista Bolts:</strong> {totalBallistaeBoltsStandard}
              </div>
            )}
            {totalBallistaeBoltsFlaming > 0 && (
              <div>
                <strong>Flaming Ballista Bolts:</strong> {totalBallistaeBoltsFlaming}
              </div>
            )}
            {totalBallistaeBoltsHarpoon > 0 && (
              <div>
                <strong>Harpoon Ballista Bolts:</strong> {totalBallistaeBoltsHarpoon}
              </div>
            )}
            {totalCannonballsStandard > 0 && (
              <div>
                <strong>Cannonballs:</strong> {totalCannonballsStandard}
              </div>
            )}
            {totalCannonballsArmorPiercing > 0 && (
              <div>
                <strong>Armor Piercing Cannonballs:</strong> {totalCannonballsArmorPiercing}
              </div>
            )}
            {totalCannonballsChainshot > 0 && (
              <div>
                <strong>Chainshot Cannonballs:</strong> {totalCannonballsChainshot}
              </div>
            )}
            {totalCannonballsInfernoShell > 0 && (
              <div>
                <strong>Inferno Shell Cannonballs:</strong> {totalCannonballsInfernoShell}
              </div>
            )}
            {totalCannonballsSmokeShell > 0 && (
              <div>
                <strong>Smoke Shell Cannonballs:</strong> {totalCannonballsSmokeShell}
              </div>
            )}
            {totalMangonelStonesStandard > 0 && (
              <div>
                <strong>Mangonel Stones:</strong> {totalMangonelStonesStandard}
              </div>
            )}
            {totalTrebuchetStonesStandard > 0 && (
              <div>
                <strong>Trebuchet Stones:</strong> {totalTrebuchetStonesStandard}
              </div>
            )}
            <hr /> {/* -------------------------------------- */}
            <h3>
              Weapons Crew
            </h3>
            <div>
              <strong>Weapons Actions / Turn:</strong> {weaponsActionsPerTurn}
            </div>
          </div>
          <div className="master-gunner-panel-right">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="850px" height="240px" style={{ background: "#00000000" }}>
              <path id="Bow" d="M220,10 L160,10 C120,10,40,60,40,120 C40,180,120,230,160,230 L220,230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <line id="Port" x1="220" y1="230" x2="740" y2="230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <line id="Starboard" x1="220" y1="10" x2="740" y2="10" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <path id="Stern" d="M740,10 H840 C860,10,880,30,880,50 V190 C880,210,860,230,840,230 H740" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <text x="500" y="120" stroke="grey" fill="grey" textAnchor="middle" dominantBaseline="middle" className="ship-svg-large-text">Main Deck</text>
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.ballistae.mainDeck.portSide.weaponData, "main", "port", "ballista")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.cannons.mainDeck.portSide.weaponData, "main", "port", "cannon")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.ballistae.mainDeck.starboardSide.weaponData, "main", "starboard", "ballista")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.cannons.mainDeck.starboardSide.weaponData, "main", "starboard", "cannon")}
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="850px" height="240px" style={{ background: "#00000000" }}>
              <path id="Bow" d="M220,10 L160,10 C120,10,40,60,40,120 C40,180,120,230,160,230 L220,230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <line id="Port" x1="220" y1="230" x2="740" y2="230" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <line id="Starboard" x1="220" y1="10" x2="740" y2="10" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <path id="Stern" d="M740,10 H840 C860,10,880,30,880,50 V190 C880,210,860,230,840,230 H740" fill="none" stroke="grey" strokeMiterlimit="1" strokeWidth="4" />
              <text x="500" y="120" stroke="grey" fill="grey" textAnchor="middle" dominantBaseline="middle" className="ship-svg-large-text">Lower Deck</text>
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.ballistae.lowerDeck.starboardSide.weaponData, "lower", "starboard", "ballista")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.cannons.lowerDeck.starboardSide.weaponData, "lower", "starboard", "cannon")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.ballistae.lowerDeck.portSide.weaponData, "lower", "port", "ballista")}
              {RenderWeapons(shipData, orders, setOrders, shipData.weapons.cannons.lowerDeck.portSide.weaponData, "lower", "port", "cannon")}
            </svg>
            {activeRole === "Master Gunner" && activeRoleTab === 2 && shipData.gunnerOrders.approvedOrdersArePending && MasterGunnerApprovedOrdersPanel()}
          </div>
        </div>
      </div>
      {activeRole === "Master Gunner" && activeRoleTab === 2 && MasterGunnerOrdersPanel()}
    </>
  );
};
MasterGunnerPanel.propTypes = {
  shipData: PropTypes.object.isRequired,
  activeRole: PropTypes.string.isRequired,
  activeRoleTab: PropTypes.number.isRequired,
};

export default MasterGunnerPanel;