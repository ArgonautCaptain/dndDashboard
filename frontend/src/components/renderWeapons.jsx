import Tooltip from '@mui/material/Tooltip';
import addOrder from "../utils/addOrder";

const RenderWeapons = (shipData, orders, setOrders, weaponData, deck, side, type) => {
  const isPort = side === "port";
  const isMainDeck = deck === "main";
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
  const ballistaeNormalRange = shipData.weapons.ballistae.statBlock.normalRange;
  const ballistaeMaxRange = shipData.weapons.ballistae.statBlock.maxRange;
  const cannonsNormalRange = shipData.weapons.cannons.statBlock.normalRange;
  const cannonsMaxRange = shipData.weapons.cannons.statBlock.maxRange;
  const mainDeckWeaponsPort = mainDeckBallistaePort + mainDeckCannonsPort + mainDeckMangonelsPort + mainDeckTrebuchetsPort;
  const mainDeckWeaponsStarboard = mainDeckBallistaeStarboard + mainDeckCannonsStarboard + mainDeckMangonelsStarboard + mainDeckTrebuchetsStarboard;
  const lowerDeckWeaponsPort = lowerDeckBallistaePort + lowerDeckCannonsPort;
  const lowerDeckWeaponsStarboard = lowerDeckBallistaeStarboard + lowerDeckCannonsStarboard;
  const initialOffset = (30 * (6 - (isMainDeck ? (isPort ? mainDeckWeaponsPort : mainDeckWeaponsStarboard) : (isPort ? lowerDeckWeaponsPort : lowerDeckWeaponsStarboard))));
  const xOffsetTracker = {
    main: { port: 0, starboard: 0 },
    lower: { port: 0, starboard: 0 },
  };
  const startX = 250 + initialOffset + xOffsetTracker[deck][side];
  const startY = isMainDeck ? (isPort ? 162 : -7) : (isPort ? 162 : -7);
  const iconSpacing = 80;
  const width = 65;
  const height = 80;
  const viewBox = type === "cannon" ? "0 0 31 84" : "0 0 78 65";

  const icons = weaponData.map((weapon, i) => {
    const fillColor = weapon.isLoaded ? "lime" : "red";
    const textColor = "white";
    const xOffset = startX + i * iconSpacing;
    const yOffset = startY;

    const tooltipContent = type === "ballista" ? (
      <>
        <h3 style={{ margin: 0 }}>Ballista</h3>
        <p>
          <strong>Armor Class:</strong> {shipData.weapons.ballistae.statBlock.armorClass}
        </p>
        <p>
          <strong>Range:</strong> {ballistaeNormalRange}/{ballistaeMaxRange} ft.
        </p>
        <p>
          <strong>Damage:</strong> +{shipData.weapons.ballistae.ammo.boltStandard.toHit} to hit,{" "}
          {shipData.weapons.ballistae.ammo.boltStandard.damageDiceNumber}d
          {shipData.weapons.ballistae.ammo.boltStandard.damageDiceType}
        </p>
        <p>
          <strong>Loaded:</strong>{" "}
          <span
            style={{
              color: weapon.isLoaded ? "lime" : "red",
              fontWeight: "bold",
            }}
          >
            {weapon.isLoaded ? "Yes" : "No"}
          </span>
        </p>
      </>
    ) : (
      <>
        <h3 style={{ margin: 0 }}>Cannon</h3>
        <p>
          <strong>Armor Class:</strong> {shipData.weapons.cannons.statBlock.armorClass}
        </p>
        <p>
          <strong>Range:</strong> {cannonsNormalRange}/{cannonsMaxRange} ft.
        </p>
        <p>
          <strong>Damage:</strong> +{shipData.weapons.cannons.ammo.cannonballStandard.toHit} to hit,{" "}
          {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceNumber}d
          {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceType}
        </p>
        <p>
          <strong>Loaded:</strong>{" "}
          <span
            style={{
              color: weapon.isLoaded ? "lime" : "red",
              fontWeight: "bold",
            }}
          >
            {weapon.isLoaded ? "Yes" : "No"}
          </span>
        </p>
      </>
    );


    return (
      <Tooltip key={`${deck}-${side}-${i}`} title={<pre className="weapon-tooltip">{tooltipContent}</pre>} arrow placement="top">
        <g
          className={`weapon-group ${weapon.hasOrders ? 'active-weapon' : ''}`}
          style={{ cursor: "pointer", height: height, width: width }}
          onClick={() => {
            addOrder(
              shipData,
              orders,
              setOrders,
              weapon.isLoaded ? "Fire" : "Reload",
              type === "cannon" ? "Cannon" : "Ballista",
              type === "cannon" ? "cannons" : "ballistae",
              `${deck.charAt(0).toUpperCase() + deck.slice(1)} Deck ${side.charAt(0).toUpperCase() + side.slice(1)}`,
              `${deck + "Deck"}`,
              `${side + "Side"}`,
              i
            );

          }}
        >

          <rect
            x={xOffset - 5}
            y={yOffset - 5}
            width={width + 20}
            height={height + 20}
            fill="transparent"
            pointerEvents="visible"
            className="weapon-icon"
          />
          <svg
            x={xOffset}
            y={yOffset}
            width={width}
            height={height}
            viewBox={viewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="weapon-svg"
          >

            {type === "ballista" && (
              <path
                id={`Ballista-${side}`}
                d={isPort ? "m.94,48.01c4.47.4,8.45,3.6,13.78,7.02,4.41,2.83,9.74,5.7,16.97,6.85l-1.21-8.47s0,0,0,0c-6.2-.68-10.84-2.07-14.86-3.48-4.41-1.55-8.11-3.13-12.21-3.74l30.85-26.59-1.74,31.07,2.06,14.32h7.91s2.06-14.31,2.06-14.31l-1.72-30.61,30.82,26.12c-4.1.6-7.8,2.19-12.2,3.74-4.02,1.41-8.66,2.81-14.86,3.48l-1.21,8.47c7.23-1.16,12.55-4.03,16.97-6.86,5.33-3.41,9.31-6.61,13.78-7.01.31-.01.62-.04.94-.04v-2.05h0s-34.4-29.16-34.4-29.16l-.94-16.76h-6.34s-.91,16.26-.91,16.26L.04,45.92s-.02,0-.04,0v.03s0,0,0,0h0s0,2.02,0,2.02c.32,0,.62.03.94.04Zm36.38-31.05l.9-.78,1.5,1.27v38.47s-1.2,4.81-1.2,4.81h0s0,0,0,0h0s-1.21-4.81-1.21-4.81V16.96Z" : "m76.1,16.99c-4.47-.4-8.45-3.6-13.78-7.02-4.41-2.83-9.74-5.7-16.97-6.85l1.21,8.47s0,0,0,0c6.2.68,10.84,2.07,14.86,3.48,4.41,1.55,8.11,3.13,12.21,3.74l-30.85,26.59,1.74-31.07-2.06-14.32h-7.91l-2.06,14.31,1.72,30.61L3.4,18.8c4.1-.6,7.8-2.19,12.2-3.74,4.02-1.41,8.66-2.81,14.86-3.48l1.21-8.47c-7.23,1.16-12.55,4.03-16.97,6.86-5.33,3.41-9.31,6.61-13.78,7.01-.31.01-.62.04-.94.04v2.05h0l34.4,29.16.94,16.76h6.34l.91-16.26,34.4-29.66s.02,0,.04,0v-.03s0,0,0,0h0s0-2.02,0-2.02c-.32,0-.62-.03-.94-.04Zm-36.38,31.05l-.9.78-1.5-1.27V9.07s1.2-4.81,1.2-4.81h0s0,0,0,0h0s1.21,4.81,1.21,4.81v38.96Z"}
                fill={fillColor}
                stroke="grey"
                strokeWidth="2"
              />
            )}
            {type === "cannon" && (
              <>
                <polyline
                  id={`Base-${side}`}
                  points={isPort ? "21.1 56.5 28.5 56.5 28.5 2.5 2.5 2.5 2.5 56.5 10.01 56.5" : "9.9 27.73 2.5 27.73 2.5 81.73 28.5 81.73 28.5 27.73 20.99 27.73"}
                  fill="#000000"
                  stroke="grey"
                  strokeWidth="2"
                />
                <path
                  id={`Cannon-${side}`}
                  d={isPort ? "m8.78,19.02l.17.35.08,2.67c.04,1.47.1,3.54.13,4.61.26,8.66.29,10.17.24,10.26-.03.06-.04.13-.01.17.08.12.11.53.14,2.01.03,1.16.4,14.3.59,20.88.03,1.08.11,3.7.17,5.83.28,9.67.28,9.71.37,9.96.15.43.2,1.29.14,2.24-.03.48-.08.95-.12,1.06-.22.75.11,1.46.9,1.92,1.5.88,4.7,1.01,6.89.29.99-.33,1.66-.8,1.97-1.37.12-.22.13-.31.13-.92,0-.37-.05-.95-.1-1.28-.11-.75-.11-1.41,0-1.89.16-.71.19-1.23.25-3.81.03-1.43.13-5.45.22-8.94.09-3.48.22-8.32.28-10.76.06-2.43.16-6.2.22-8.38.06-2.17.12-4.62.13-5.44.02-.82.06-2.38.09-3.47.03-1.09.08-3.02.11-4.29.03-1.26.08-3.19.11-4.29.03-1.09.08-3.15.12-4.57.06-2.55.06-2.58.2-2.81.35-.61.52-1.57.41-2.28-.14-.89-.57-1.69-1.31-2.43-.55-.55-1.17-.97-1.86-1.26-.49-.2-1.38-.43-1.87-.48-.2-.02-.47-.04-.61-.06l-.24-.03.16-.14c.19-.16.4-.66.4-.96,0-.26-.13-.69-.28-.94-.07-.11-.24-.25-.4-.33-.91-.45-2.01.24-2.01,1.26,0,.4.11.68.35.94l.18.18h-.36c-1.1,0-2.35.28-3.22.72-1.69.85-2.9,2.57-3.03,4.3-.04.56.04,1.01.26,1.47Z" : "m22.22,65.21l-.17-.35-.08-2.67c-.04-1.47-.1-3.54-.13-4.61-.26-8.66-.29-10.17-.24-10.26.03-.06.04-.13.01-.17-.08-.12-.11-.53-.14-2.01-.03-1.16-.4-14.3-.59-20.88-.03-1.08-.11-3.7-.17-5.83-.28-9.67-.28-9.71-.37-9.96-.15-.43-.2-1.29-.14-2.24.03-.48.08-.95.12-1.06.22-.75-.11-1.46-.9-1.92-1.5-.88-4.7-1.01-6.89-.29-.99.33-1.66.8-1.97,1.37-.12.22-.13.31-.13.92,0,.37.05.95.1,1.28.11.75.11,1.41,0,1.89-.16.71-.19,1.23-.25,3.81-.03,1.43-.13,5.45-.22,8.94-.09,3.48-.22,8.32-.28,10.76-.06,2.43-.16,6.2-.22,8.38-.06,2.17-.12,4.62-.13,5.44-.02.82-.06,2.38-.09,3.47-.03,1.09-.08,3.02-.11,4.29-.03,1.26-.08,3.19-.11,4.29-.03,1.09-.08,3.15-.12,4.57-.06,2.55-.06,2.58-.2,2.81-.35.61-.52,1.57-.41,2.28.14.89.57,1.69,1.31,2.43.55.55,1.17.97,1.86,1.26.49.2,1.38.43,1.87.48.2.02.47.04.61.06l.24.03-.16.14c-.19.16-.4.66-.4.96,0,.26.13.69.28.94.07.11.24.25.4.33.91.45,2.01-.24,2.01-1.26,0-.4-.11-.68-.35-.94l-.18-.18h.36c1.1,0,2.35-.28,3.22-.72,1.69-.85,2.9-2.57,3.03-4.3.04-.56-.04-1.01-.26-1.47Z"}
                  fill={fillColor}
                  stroke="grey"
                  strokeWidth="2"
                />
              </>
            )}

          </svg>
          <text
            x={xOffset + width / 2}
            y={isPort ? (yOffset + height - 85) : (yOffset + height + 10)}
            fill={textColor}
            textAnchor="middle"
            fontSize="10px"
          >
            {weapon.hp} / {type === "cannon" ? shipData.weapons.cannons.statBlock.maxHP : shipData.weapons.ballistae.statBlock.maxHP} HP
          </text>
        </g>
      </Tooltip >
    );
  });

  xOffsetTracker[deck][side] += weaponData.length * iconSpacing;

  return icons;
};

export default RenderWeapons;