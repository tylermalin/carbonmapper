// Backend URL: use environment variable, window override, or default to localhost
const BACKEND_URL = window.BACKEND_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/api');

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    marker: false,
    polyline: false,
    circle: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

const statusEl = document.getElementById('status');
const agbEl = document.getElementById('agb');
const bgbEl = document.getElementById('bgb');
const totalEl = document.getElementById('total');

// Carbon credits elements
const creditsSection = document.getElementById('credits');
const co2EquivEl = document.getElementById('co2-equiv');
const creditsCountEl = document.getElementById('credits-count');

// Market value elements
const marketSection = document.getElementById('market-value');
const valueLowEl = document.getElementById('value-low');
const valueAvgEl = document.getElementById('value-avg');
const valueHighEl = document.getElementById('value-high');
const marketNoteEl = document.getElementById('market-note');
let currentMarketType = 'voluntary';

// Suggestions and methodologies
const suggestionsSection = document.getElementById('suggestions');
const suggestionsListEl = document.getElementById('suggestions-list');
const methodologiesSection = document.getElementById('methodologies');
const methodologiesListEl = document.getElementById('methodologies-list');

function setStatus(text) {
  statusEl.textContent = text;
}

function setResults({ agb = '—', bgb = '—', total = '—' }) {
  agbEl.textContent = agb;
  bgbEl.textContent = bgb;
  totalEl.textContent = total;
}

function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '—';
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatCurrency(num) {
  if (typeof num !== 'number' || isNaN(num)) return '—';
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function displayCarbonCredits(creditsData) {
  if (!creditsData) {
    creditsSection.style.display = 'none';
    return;
  }

  creditsSection.style.display = 'block';
  co2EquivEl.textContent = `${formatNumber(creditsData.co2_equivalent_tonnes)} t CO₂e`;
  creditsCountEl.textContent = `${formatNumber(creditsData.co2_equivalent_tonnes)} credits`;
}

function displayMarketValue(creditsData) {
  if (!creditsData || !creditsData.credit_estimates) {
    marketSection.style.display = 'none';
    return;
  }

  marketSection.style.display = 'block';
  updateMarketTab(currentMarketType, creditsData);
}

function updateMarketTab(marketType, creditsData) {
  const estimates = creditsData.credit_estimates[marketType];
  if (!estimates) return;

  valueLowEl.textContent = formatCurrency(estimates.min);
  valueAvgEl.textContent = formatCurrency(estimates.avg);
  valueHighEl.textContent = formatCurrency(estimates.max);
  
  marketNoteEl.textContent = estimates.price_per_credit.description;
}

function displaySuggestions(suggestions) {
  if (!suggestions || suggestions.length === 0) {
    suggestionsSection.style.display = 'none';
    return;
  }

  suggestionsSection.style.display = 'block';
  suggestionsListEl.innerHTML = '';

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = `suggestion-item ${suggestion.priority}-priority`;
    
    item.innerHTML = `
      <div class="suggestion-title">${suggestion.title}</div>
      <div class="suggestion-description">${suggestion.description}</div>
      <div class="suggestion-action">→ ${suggestion.action}</div>
    `;
    
    suggestionsListEl.appendChild(item);
  });
}

function displayMethodologies(methodologies, recommended = []) {
  if (!methodologies || methodologies.length === 0) {
    methodologiesSection.style.display = 'none';
    return;
  }

  methodologiesSection.style.display = 'block';
  methodologiesListEl.innerHTML = '';

  // Show recommended first, then others
  const recommendedIds = new Set(recommended.map(m => m.name));
  const sorted = [
    ...methodologies.filter(m => recommendedIds.has(m.name)),
    ...methodologies.filter(m => !recommendedIds.has(m.name))
  ];

  sorted.forEach(methodology => {
    const item = document.createElement('div');
    item.className = 'methodology-item';
    
    const isRecommended = recommendedIds.has(methodology.name);
    
    item.innerHTML = `
      <div class="methodology-header">
        <div>
          <div class="methodology-name">
            ${methodology.name}${isRecommended ? ' ⭐' : ''}
          </div>
          <div class="methodology-org">${methodology.organization}</div>
        </div>
        <span class="suitability-badge ${methodology.suitability}">${methodology.suitability}</span>
      </div>
      <div class="methodology-description">${methodology.description}</div>
      <div class="methodology-details">
        <div class="detail-item">
          <div class="detail-label">Timeline</div>
          <div class="detail-value">${methodology.timeline}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Cost Estimate</div>
          <div class="detail-value">${methodology.cost_estimate}</div>
        </div>
      </div>
      <div class="methodology-requirements">
        <div class="requirements-title">Key Requirements:</div>
        <ul class="requirements-list">
          ${methodology.requirements.map(req => `<li>${req}</li>`).join('')}
        </ul>
      </div>
      ${methodology.website ? `<div style="margin-top: 0.75rem;"><a href="${methodology.website}" target="_blank" style="color: #0d9488; font-size: 0.85rem; text-decoration: none;">Learn more →</a></div>` : ''}
    `;
    
    methodologiesListEl.appendChild(item);
  });
}

// Market tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMarketType = btn.dataset.market;
    
    // Update display if we have credit data
    const lastData = window.lastCreditData;
    if (lastData) {
      updateMarketTab(currentMarketType, lastData);
    }
  });
});

async function sendPolygon(geometry) {
  // Construct API URL correctly for both localhost and production
  // On localhost: BACKEND_URL = 'http://localhost:4000', need '/api/calculate-carbon'
  // On Vercel: BACKEND_URL = '/api', need '/calculate-carbon' (already has /api prefix)
  let apiUrl;
  if (BACKEND_URL.includes('localhost') || BACKEND_URL.startsWith('http')) {
    // Local development - full URL
    apiUrl = `${BACKEND_URL}/api/calculate-carbon`;
  } else {
    // Production (Vercel) - relative path, BACKEND_URL already includes /api
    apiUrl = `${BACKEND_URL}/calculate-carbon`;
  }
  
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geometry }),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

map.on(L.Draw.Event.CREATED, async (event) => {
  drawnItems.clearLayers();
  drawnItems.addLayer(event.layer);
  const geometry = event.layer.toGeoJSON().geometry;

  setStatus('Calculating…');
  setResults({});

  try {
    const data = await sendPolygon(geometry);
    setStatus('Done');
    
    // Display carbon storage
    setResults({
      agb: `${formatNumber(data.aboveground_tonnes)} t`,
      bgb: `${formatNumber(data.belowground_tonnes)} t`,
      total: `${formatNumber(data.total_tonnes)} t`,
    });

    // Display carbon credits information
    if (data.credits) {
      window.lastCreditData = data.credits;
      displayCarbonCredits(data.credits);
      displayMarketValue(data.credits);
      
      if (data.credits.recommended_methodologies) {
        displayMethodologies(
          data.credits.all_methodologies || [],
          data.credits.recommended_methodologies
        );
      }
    }

    // Display suggestions
    if (data.suggestions) {
      displaySuggestions(data.suggestions);
    }

  } catch (err) {
    console.error(err);
    setStatus('Error calculating carbon. Check console/logs.');
    
    // Hide all sections on error
    creditsSection.style.display = 'none';
    marketSection.style.display = 'none';
    suggestionsSection.style.display = 'none';
    methodologiesSection.style.display = 'none';
  }
});
