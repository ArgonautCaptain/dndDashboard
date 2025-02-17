import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const removeOrder = async (shipData, index, orders, setOrders) => {
  const currentLocationString = orders[index].locationString;
  const weaponTypeGroup = orders[index].weaponType === "Cannon" ? "cannons" : "ballistae";
  const deck = currentLocationString.split(" ")[0].toLowerCase() + "Deck";
  const side = currentLocationString.split(" ")[2].toLowerCase() + "Side";
  const weaponIndex = orders[index].weaponIndex;
  const weaponsActionsRemaining = shipData.gunnerOrders.actionsRemaining;

  setOrders((prevOrders) => prevOrders.filter((_, i) => i !== index));
  try {
    const shipRef = doc(db, "ships", "scarlet-fury");
    await updateDoc(shipRef, {
      [`gunnerOrders.actionsRemaining`]: weaponsActionsRemaining + 1,
    });
  } catch (error) {
    console.error("Error updating actions remaining:", error);
  }
  try {
    const shipRef = doc(db, "ships", "scarlet-fury");

    // Get the current weaponData array from Firestore
    const shipSnapshot = await getDoc(shipRef);
    if (!shipSnapshot.exists()) throw new Error("Ship data not found!");

    const currentWeaponData = shipSnapshot.data().weapons[weaponTypeGroup][deck][side].weaponData;

    // Ensure index is valid
    if (!currentWeaponData || weaponIndex < 0 || weaponIndex >= currentWeaponData.length) {
      throw new Error("Invalid weapon index.");
    }

    // Clone the array and update the specific entry
    const updatedWeaponData = [...currentWeaponData];
    updatedWeaponData[weaponIndex] = {
      ...updatedWeaponData[weaponIndex],
      hasOrders: false,
    };

    // Update Firestore with the full modified array
    await updateDoc(shipRef, {
      [`weapons.${weaponTypeGroup}.${deck}.${side}.weaponData`]: updatedWeaponData,
    });
  } catch (error) {
    console.error("Error updating weapon data:", error);
  }
};

export default removeOrder;