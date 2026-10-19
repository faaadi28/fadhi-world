// Shared mathematical terrain elevation calculation for the spacious Open World
// Allows both the 3D ground geometry and the player controller to know exact ground height at any (x, z)

export function getTerrainHeight(x: number, z: number): number {
  // 1. Central Lake Basin: Centered around (-4, 2) with semi-major axes (18, 28)
  const dxLake = (x + 4) / 16.0;
  const dzLake = (z - 2) / 26.0;
  const lakeDist = Math.hypot(dxLake, dzLake);

  if (lakeDist < 1.0) {
    // Basin bowl drop down to water floor
    return -0.9 * (1.0 - Math.pow(lakeDist, 2.0));
  }

  // 2. Northern River Channel passing under the Grand Moon Bridge
  // River runs along x from -12 to 12 around z = -40
  const riverDistZ = Math.abs(z - (-40));
  if (riverDistZ < 7.0 && Math.abs(x) < 22) {
    const t = riverDistZ / 7.0;
    return -0.8 * (1.0 - t * t);
  }

  // 3. Distinct Themed Elevated Landforms & Biomes:
  // Hill A: Knowledge Summit (Northwest Observatory, Zone 06)
  const distSummit = Math.hypot(x - (-28), z - (-26)) / 14.0;
  const hillSummit = Math.exp(-distSummit * distSummit) * 2.8;

  // Hill B: Cybersecurity Bastion Plateau (West Shore, Zone 07)
  const distBastion = Math.hypot(x - (-38), z - 0) / 14.0;
  const hillBastion = Math.exp(-distBastion * distBastion) * 1.8;

  // Hill C: Innovation Meadow Bluffs (Northeast, Zone 04)
  const distMeadow = Math.hypot(x - 26, z - (-24)) / 14.0;
  const hillMeadow = Math.exp(-distMeadow * distMeadow) * 1.6;

  // Hill D: Communications Outpost Ridge (Southwest, Zone 08)
  const distPine = Math.hypot(x - (-31), z - 29) / 14.0;
  const hillPine = Math.exp(-distPine * distPine) * 1.2;

  // Hill E: Lakeside Pavilion Plateau (East Shore, Zone 02)
  const distPavilion = Math.hypot(x - 38, z - 20) / 14.0;
  const hillPavilion = Math.exp(-distPavilion * distPavilion) * 0.8;

  // 4. Outer Horizon Mountains framing the vast open world (starts beyond radius 55)
  const r = Math.hypot(x, z);
  let outerMountains = 0;
  if (r > 55) {
    const edge = Math.min((r - 55) / 25, 1.0);
    outerMountains = Math.pow(edge, 1.8) * 8.5;
  }

  // Gentle micro undulations for organic natural grass feel
  const microRoll = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.22;

  return 0.18 + hillSummit + hillBastion + hillMeadow + hillPine + hillPavilion + outerMountains + microRoll;
}

// Check if position is on the Grand Valley Bridge (located at [0, 0.8, -40], span along x: -8 to 8, width along z: -43 to -37)
export function getBridgeHeight(x: number, z: number): number | null {
  const dx = x;
  const dz = z - (-39);

  if (Math.abs(dx) <= 7.5 && Math.abs(dz) <= 2.2) {
    const t = dx / 7.5; // -1 to 1
    const archY = 1.6 * (1.0 - t * t) + 0.6;
    return archY;
  }
  return null;
}

// Check if position is on the Lakeside Pavilion deck (at [38, 0.5, 20], deck width 8m x 7m)
export function getPavilionHeight(x: number, z: number): number | null {
  const dx = x - 38;
  const dz = z - 20;

  if (Math.abs(dx) <= 4.2 && Math.abs(dz) <= 3.8) {
    return 0.72; // Elevated deck height
  }
  return null;
}
