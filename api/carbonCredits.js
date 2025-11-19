/**
 * Carbon Credit Calculations and Estimates
 * 
 * Converts stored carbon to carbon credit estimates with market pricing
 * and methodology suggestions.
 */

// Carbon to CO2 conversion factor
// 1 tonne of carbon = 3.67 tonnes of CO2 equivalent
const CARBON_TO_CO2_FACTOR = 3.67;

// Market price ranges (USD per tonne CO2e) - updated estimates for 2024
const MARKET_PRICES = {
  voluntary: {
    min: 5,
    avg: 15,
    max: 50,
    description: 'Voluntary carbon market (VCM) - varies by project type and quality'
  },
  compliance: {
    min: 20,
    avg: 40,
    max: 100,
    description: 'Compliance markets (e.g., California Cap-and-Trade, EU ETS)'
  },
  high_quality: {
    min: 25,
    avg: 35,
    max: 80,
    description: 'High-quality credits (VCS, Gold Standard certified)'
  }
};

// Certification methodologies and their characteristics
const METHODOLOGIES = [
  {
    name: 'VCS (Verified Carbon Standard)',
    organization: 'Verra',
    suitability: 'high',
    description: 'Most widely used voluntary carbon standard. Good for forest carbon projects.',
    requirements: [
      'Project documentation and monitoring plan',
      'Third-party verification',
      'Additionality demonstration',
      'Permanence safeguards (buffer pool)'
    ],
    timeline: '12-24 months',
    cost_estimate: '$50,000 - $200,000+',
    website: 'https://verra.org'
  },
  {
    name: 'Gold Standard',
    organization: 'Gold Standard Foundation',
    suitability: 'high',
    description: 'Premium standard with strong social and environmental co-benefits.',
    requirements: [
      'VCS requirements plus',
      'Social impact assessment',
      'Stakeholder engagement',
      'Sustainable Development Goals alignment'
    ],
    timeline: '18-30 months',
    cost_estimate: '$75,000 - $250,000+',
    website: 'https://www.goldstandard.org'
  },
  {
    name: 'CAR (Climate Action Reserve)',
    organization: 'Climate Action Reserve',
    suitability: 'medium',
    description: 'US-focused standard, good for North American projects.',
    requirements: [
      'Project protocol compliance',
      'Third-party verification',
      'Registry account setup'
    ],
    timeline: '12-18 months',
    cost_estimate: '$40,000 - $150,000+',
    website: 'https://www.climateactionreserve.org'
  },
  {
    name: 'ACR (American Carbon Registry)',
    organization: 'Winrock International',
    suitability: 'medium',
    description: 'US-based registry with forest carbon protocols.',
    requirements: [
      'Protocol-specific requirements',
      'Verification by approved verifiers',
      'Registry documentation'
    ],
    timeline: '12-24 months',
    cost_estimate: '$45,000 - $180,000+',
    website: 'https://americancarbonregistry.org'
  }
];

/**
 * Calculate carbon credit estimates from stored carbon
 */
export function calculateCarbonCredits(totalCarbonTonnes) {
  if (!totalCarbonTonnes || totalCarbonTonnes <= 0) {
    return null;
  }

  // Convert carbon to CO2 equivalent
  const co2Equivalent = totalCarbonTonnes * CARBON_TO_CO2_FACTOR;

  // Calculate credit value estimates
  const creditEstimates = {
    voluntary: {
      min: co2Equivalent * MARKET_PRICES.voluntary.min,
      avg: co2Equivalent * MARKET_PRICES.voluntary.avg,
      max: co2Equivalent * MARKET_PRICES.voluntary.max,
      credits: co2Equivalent,
      price_per_credit: MARKET_PRICES.voluntary
    },
    high_quality: {
      min: co2Equivalent * MARKET_PRICES.high_quality.min,
      avg: co2Equivalent * MARKET_PRICES.high_quality.avg,
      max: co2Equivalent * MARKET_PRICES.high_quality.max,
      credits: co2Equivalent,
      price_per_credit: MARKET_PRICES.high_quality
    },
    compliance: {
      min: co2Equivalent * MARKET_PRICES.compliance.min,
      avg: co2Equivalent * MARKET_PRICES.compliance.avg,
      max: co2Equivalent * MARKET_PRICES.compliance.max,
      credits: co2Equivalent,
      price_per_credit: MARKET_PRICES.compliance
    }
  };

  // Determine project size category
  let projectSize = 'small';
  let projectComplexity = 'low';
  
  if (co2Equivalent >= 100000) {
    projectSize = 'large';
    projectComplexity = 'high';
  } else if (co2Equivalent >= 10000) {
    projectSize = 'medium';
    projectComplexity = 'medium';
  }

  // Get recommended methodologies
  const recommendedMethodologies = METHODOLOGIES.filter(m => 
    projectSize === 'large' || m.suitability !== 'low'
  ).slice(0, 2);

  return {
    carbon_tonnes: totalCarbonTonnes,
    co2_equivalent_tonnes: co2Equivalent,
    credit_estimates: creditEstimates,
    project_size: projectSize,
    project_complexity: projectComplexity,
    recommended_methodologies: recommendedMethodologies,
    all_methodologies: METHODOLOGIES,
    conversion_factor: CARBON_TO_CO2_FACTOR,
    market_info: {
      note: 'Prices are estimates and vary significantly based on project quality, location, co-benefits, and market conditions.',
      last_updated: '2024'
    }
  };
}

/**
 * Get project development suggestions based on carbon amount
 */
export function getProjectSuggestions(carbonCreditsData) {
  const { co2_equivalent_tonnes, project_size, project_complexity } = carbonCreditsData;

  const suggestions = [];

  // Size-based suggestions
  if (project_size === 'large') {
    suggestions.push({
      type: 'scale',
      priority: 'high',
      title: 'Large-scale project potential',
      description: `With ${co2_equivalent_tonnes.toLocaleString()} tonnes CO2e, this project has significant credit generation potential. Consider engaging a carbon project developer.`,
      action: 'Contact carbon project developers or consultants'
    });
  }

  // Methodology suggestions
  suggestions.push({
    type: 'methodology',
    priority: 'high',
    title: 'Choose a certification standard',
    description: 'Select a recognized carbon standard (VCS, Gold Standard, etc.) based on your project goals and budget.',
    action: 'Review recommended methodologies and select one'
  });

  // Next steps
  suggestions.push({
    type: 'next_steps',
    priority: 'medium',
    title: 'Project development roadmap',
    description: 'Typical steps: 1) Feasibility study, 2) Methodology selection, 3) Project documentation, 4) Verification, 5) Registration and issuance.',
    action: 'Develop a project timeline and budget'
  });

  // Financial considerations
  if (carbonCreditsData.credit_estimates.voluntary.avg > 100000) {
    suggestions.push({
      type: 'financial',
      priority: 'medium',
      title: 'Significant revenue potential',
      description: `Estimated value: $${carbonCreditsData.credit_estimates.voluntary.avg.toLocaleString()} - $${carbonCreditsData.credit_estimates.high_quality.avg.toLocaleString()} USD (voluntary to high-quality markets).`,
      action: 'Consider upfront investment in certification'
    });
  }

  // Risk management
  suggestions.push({
    type: 'risk',
    priority: 'medium',
    title: 'Permanence and risk management',
    description: 'Carbon credits require long-term commitment. Consider buffer pools, insurance, and monitoring systems.',
    action: 'Develop risk management strategy'
  });

  return suggestions;
}

