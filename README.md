# Malama Carbon Mapping

**Beta Testing** - A web application for estimating stored carbon and carbon credit potential from anywhere on Earth using Google Earth Engine and NASA/ORNL biomass data.

## 🌍 Features

- **Interactive Map**: Draw polygons anywhere on Earth to analyze carbon storage
- **Carbon Calculations**: Estimates aboveground and belowground carbon using NASA/ORNL biomass carbon density dataset
- **Carbon Credit Estimates**: Converts stored carbon to CO₂ equivalent and calculates potential carbon credits
- **Market Value Analysis**: Provides estimates across voluntary, high-quality, and compliance carbon markets
- **Certification Guidance**: Recommendations for VCS, Gold Standard, CAR, and ACR methodologies
- **Project Suggestions**: Actionable next steps for carbon credit project development

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Earth Engine service account with API access
- Service account key JSON file

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd carbon-mapper
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file:
   ```env
   GEE_KEY_FILE=../service-account-key.json
   PORT=4000
   FRONTEND_ORIGIN=*
   ```
   
   Place your Google Earth Engine service account key JSON file in the root directory as `service-account-key.json`
   
   Start the backend:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   # Serve with any static server, e.g.:
   npx serve . -p 3000
   ```
   
   Or open `index.html` directly in a browser (for local testing only)

4. **Use the Application**
   - Open `http://localhost:3000` in your browser
   - Draw a polygon on the map
   - View carbon storage estimates and carbon credit potential

## 📦 Deployment

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   In Vercel dashboard, add:
   - `GEE_KEY_FILE`: Path to your service account key (or use Vercel Secrets)
   - `FRONTEND_ORIGIN`: Your Vercel domain (or `*` for testing)
   - `PORT`: Leave default or set to 4000

4. **For Production**
   - Upload service account key as a Vercel Secret
   - Update `GEE_KEY_FILE` to reference the secret
   - Set `FRONTEND_ORIGIN` to your production domain

### GitHub Setup

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**
   - Create a new repository on GitHub
   - Add remote and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. **Important**: Never commit:
   - `service-account-key.json` (already in .gitignore)
   - `.env` files (already in .gitignore)
   - Any sensitive credentials

## 🏗️ Project Structure

```
carbon-mapper/
├── backend/
│   ├── server.js          # Express API server
│   ├── geeClient.js       # Google Earth Engine client
│   ├── carbonCredits.js   # Carbon credit calculations
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── app.js            # Frontend JavaScript
│   ├── style.css         # Styles
│   └── package.json
├── vercel.json           # Vercel configuration
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` file):
- `GEE_KEY_FILE`: Path to Google Earth Engine service account key JSON
- `PORT`: Server port (default: 4000)
- `FRONTEND_ORIGIN`: Allowed CORS origin (default: `*`)

**Frontend**:
- Backend URL is automatically detected based on hostname
- Override with `window.BACKEND_URL` before loading `app.js`

## 📊 Data Sources

- **Carbon Data**: NASA/ORNL biomass carbon density dataset (v1)
- **Market Prices**: Estimates based on 2024 voluntary and compliance carbon markets
- **Methodologies**: Information from VCS, Gold Standard, CAR, and ACR standards

## ⚠️ Beta Testing

This is a beta version of Malama Carbon Mapping. We're actively improving the tool and welcome feedback.

**Interested in seeing more?** Get in touch: [info@malamalabs.com](mailto:info@malamalabs.com)

## 📝 Notes

- Carbon credit estimates are approximations and vary significantly based on project quality, location, and market conditions
- Certification costs and timelines are estimates; actual values depend on project specifics
- Keep service account keys secure and never commit them to version control
- The dataset uses Mg C/ha; calculations multiply band sums by 9 (300m pixel ≈ 9 ha)

## 📄 License

[Add your license here]

## 👥 Contact

**Malama Labs**
- Email: info@malamalabs.com
- Website: [Add website if available]

---

Built with ❤️ by Malama Labs
