import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import removeOrder from "./removeOrder";

const addOrder = async (shipData, orders, setOrders, action, weaponType, weaponTypeGroup, locationString, deck, side, weaponIndex) => {

  const newOrder = { action, weaponType, locationString, weaponIndex };
  const isDuplicateOrder = orders.some(
    (order) =>
      order.action === newOrder.action &&
      order.weaponType === newOrder.weaponType &&
      order.locationString === newOrder.locationString &&
      order.weaponIndex === newOrder.weaponIndex
  );

  const alreadyHasOrders = shipData.weapons[weaponTypeGroup][deck][side].weaponData[weaponIndex].hasOrders;
  const weaponsActionsRemaining = shipData.gunnerOrders?.actionsRemaining;

  if (!isDuplicateOrder && !alreadyHasOrders) {
    if (weaponsActionsRemaining > 0) {
      setOrders([...orders, newOrder]);
      try {
        const shipRef = doc(db, "ships", "scarlet-fury");
        await updateDoc(shipRef, {
          [`gunnerOrders.actionsRemaining`]: weaponsActionsRemaining - 1,
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
          hasOrders: true,
        };

        // Update Firestore with the full modified array
        await updateDoc(shipRef, {
          [`weapons.${weaponTypeGroup}.${deck}.${side}.weaponData`]: updatedWeaponData,
        });
      } catch (error) {
        console.error("Error updating weapon data:", error);
      }
    } else {
      alert("You have no actions remaining this turn!");
    }
  } else if (isDuplicateOrder) {
    const orderIndex = orders.findIndex(
      (order) =>
        order.action === newOrder.action &&
        order.weaponType === newOrder.weaponType &&
        order.locationString === newOrder.locationString &&
        order.weaponIndex === newOrder.weaponIndex
    );
    removeOrder(orderIndex);
  } else if (alreadyHasOrders) {
    alert("This weapon already has orders submitted this turn!");
  }

};

export default addOrder;