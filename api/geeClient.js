import fs from 'fs';
import ee from '@google/earthengine';

export async function initGEE() {
  const keyFile = process.env.GEE_KEY_FILE;
  if (!keyFile || !fs.existsSync(keyFile)) {
    throw new Error('GEE_KEY_FILE missing or path not found');
  }
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const privateKey = key.private_key;

  await ee.data.authenticateViaPrivateKey({
    client_email: key.client_email,
    private_key: privateKey,
  });

  await new Promise((resolve, reject) => {
    ee.initialize(null, null, resolve, reject);
  });
}

export async function calculateCarbon(geometry) {
  const geom = ee.Geometry(geometry); // expects GeoJSON geometry object
  const img = ee.ImageCollection('NASA/ORNL/biomass_carbon_density/v1').first();

  const sums = await img
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: geom,
      scale: 300,
      bestEffort: true,
      maxPixels: 1e13,
    })
    .getInfo();

  // Dataset units: Mg C/ha; each 300m pixel ≈ 9 ha
  const scaleFactor = 9;
  const agb = (sums?.agb || 0) * scaleFactor;
  const bgb = (sums?.bgb || 0) * scaleFactor;

  return {
    aboveground_tonnes: agb,
    belowground_tonnes: bgb,
    total_tonnes: agb + bgb,
  };
}
