const CannonWeaponStats = (shipData, cannonsNormalRange, cannonsMaxRange) => {
  return (
    <>
      <h4>
        Cannon
      </h4>
      <p>
        <strong>Armor Class:</strong> {shipData.weapons.cannons.statBlock.armorClass}
      </p>
      <p>
        <strong>Range:</strong> {cannonsNormalRange} / {cannonsMaxRange} ft.
      </p>
      <p className="ammo-description">
        <strong>Cannonball:</strong> +{shipData.weapons.cannons.ammo.cannonballStandard.toHit} to hit, {shipData.weapons.cannons.ammo.cannonballStandard.damageDiceNumber}d{shipData.weapons.cannons.ammo.cannonballStandard.damageDiceType} damage
      </p>
    </>
  )
};

export default CannonWeaponStats;