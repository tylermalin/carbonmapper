# Carbon Mapper API

Express API service for Malama Carbon Mapping that accepts GeoJSON geometry, queries the NASA/ORNL biomass carbon density dataset in Google Earth Engine, and returns carbon storage estimates along with carbon credit calculations and market value estimates.

## Setup
1) Create a Google Cloud service account with Earth Engine access and download its key JSON.
2) Create a `.env` file in this directory with:
   ```env
   GEE_KEY_FILE=../service-account-key.json
   PORT=4000
   FRONTEND_ORIGIN=*
   ```
   - `GEE_KEY_FILE`: Path to your service account key JSON
   - `FRONTEND_ORIGIN`: CORS origin (use `*` for local testing)
   - `PORT`: Server port (default: 4000)
3) Place your service account key JSON file in the root `carbon-mapper/` directory
4) Install dependencies:
```bash
npm install
```

## Run
```bash
npm run dev    # Development mode with auto-reload
npm start      # Production mode
```

## API
### `POST /api/calculate-carbon`
Calculates carbon storage and carbon credit estimates. Returns carbon amounts plus credit calculations, market estimates, and methodology recommendations.

**Request:** `{ "geometry": <GeoJSON geometry> }` (Polygon/MultiPolygon recommended)

**Response:** Includes `aboveground_tonnes`, `belowground_tonnes`, `total_tonnes`, `credits` object with CO₂ equivalents and market estimates, and `suggestions` array.

### `GET /health`
Health check endpoint. Returns `{ "status": "ok" }`

Notes:
- Uses `bestEffort` and high `maxPixels` to accommodate moderately large polygons. Consider adding server-side limits to prevent huge requests.
- Dataset units are Mg C/ha; each 300 m pixel is ~9 ha, so totals multiply band sums by 9.
