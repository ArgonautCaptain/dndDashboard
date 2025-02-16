const BallistaWeaponStats = (shipData, ballistaeNormalRange, ballistaeMaxRange) => {
  return (
    <>
      <h4>
        Ballista
      </h4>
      <p>
        <strong>Armor Class:</strong> {shipData.weapons.ballistae.statBlock.armorClass}
      </p>
      <p>
        <strong>Range:</strong> {ballistaeNormalRange} / {ballistaeMaxRange} ft.
      </p>
      <p className="ammo-description">
        <strong>Ballista Bolt:</strong> +{shipData.weapons.ballistae.ammo.boltStandard.toHit} to hit, {shipData.weapons.ballistae.ammo.boltStandard.damageDiceNumber}d{shipData.weapons.ballistae.ammo.boltStandard.damageDiceType} damage
      </p>
    </>
  )
};

export default BallistaWeaponStats;