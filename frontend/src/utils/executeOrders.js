import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const executeOrders = async (shipData, orders, setOrders) => {
  const ordersToSubmit = [];
  orders.forEach((order) => {
    const { weaponIndex, locationString, weaponType, action } = order;
    const weaponTypeGroup = weaponType === "Cannon" ? "cannons" : "ballistae";
    const deck = locationString.split(" ")[0].toLowerCase() + "Deck";
    const side = locationString.split(" ")[2].toLowerCase() + "Side";
    const ammoLoaded = shipData.weapons[weaponTypeGroup][deck][side].weaponData[weaponIndex].loadedWith;
    ordersToSubmit.push({
      weaponTypeGroup,
      deck,
      side,
      weaponIndex,
      action,
      ammoLoaded,
    });

    /* console.log(`Executing ${action} order for ${weaponType} index ${weaponIndex} on the ${locationString}`); */
  });

  /* console.log(ordersToSubmit); */

  try {
    const shipRef = doc(db, "ships", "scarlet-fury");

    const shipSnapshot = await getDoc(shipRef);
    if (!shipSnapshot.exists()) throw new Error("Ship data not found!");
    const currentOrdersData = shipSnapshot.data().gunnerOrders;
    if (currentOrdersData.requestedOrdersArePending === true) {
      alert("There are already orders in the queue. Please wait for the current orders to be executed.");
      return;
    } else {
      await updateDoc(shipRef, {
        [`gunnerOrders.orderRequest`]: ordersToSubmit,
      });
      await updateDoc(shipRef, {
        [`gunnerOrders.requestedOrdersArePending`]: true,
      });
      setOrders([]);
    }
  } catch (error) {
    console.error("Error updating orders:", error);
  }
};

export default executeOrders;