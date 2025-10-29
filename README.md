# 🌌 Galanor – Solar System & Asteroid Impact Visualization

Welcome to the **Galanor** repository! This project delivers an immersive, scientifically-accurate 3D visualization of our solar system combined with a powerful asteroid impact simulator. Built with cutting-edge web technologies and grounded in real astronomical data, Galanor enables students, researchers, and space enthusiasts to explore planetary motion, track near-Earth asteroids, and simulate catastrophic impact scenarios.

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Scientific Accuracy](#scientific-accuracy)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributors](#contributors)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

---

## 🌍 Introduction

Galanor transforms complex astronomical concepts into interactive, visual experiences. By combining real-time 3D rendering with precise orbital mechanics calculations, it provides an unparalleled platform for understanding celestial motion, asteroid trajectories, and potential impact scenarios.

### ⚡ Why Use Galanor?

Traditional astronomy education tools are often static, disconnected, or inaccessible. Galanor addresses these limitations by:

- **Making Space Accessible**: Interactive 3D visualization brings the solar system to your browser
- **Providing Scientific Accuracy**: Real NASA data with validated orbital mechanics calculations
- **Enabling Exploration**: Travel through time, follow celestial objects, and modify asteroid trajectories
- **Simulating Impact**: Understand the devastating effects of asteroid collisions using peer-reviewed models
- **Supporting Education**: Perfect for classrooms, research, and public outreach

Our application is designed to:
- Visualize complex orbital mechanics in real-time
- Track and analyze near-Earth asteroids
- Calculate realistic impact scenarios
- Provide intuitive controls for exploration
- Scale to thousands of celestial objects efficiently

---

## ✨ Features

### 🪐 Solar System Visualization
- **Realistic 3D Rendering**: All planets with scientifically accurate orbital mechanics and physical properties
- **Dynamic Textures**: High-resolution textures with bump maps, normal maps, specular maps, and cloud layers
- **Planetary Rings**: Authentic ring systems for Saturn, Uranus, Jupiter, and Neptune
- **Accurate Scaling**: Physically realistic scale (100,000 km = 1 render unit)
- **Real-time Orbits**: Keplerian orbital element calculations with continuous position updates

### ☄️ Asteroid Tracking & Physics
- **1500+ Near-Earth Asteroids**: Real orbital data from NASA's JPL database
- **Configurable Asteroid Count**: Dynamic loading from 1 to 5000 asteroids
- **Force Application**: Apply gravitational forces to modify asteroid trajectories
- **Orbit Visualization**: Toggle orbital paths with distance-based fading
- **Hazard Assessment**: Visual indicators for potentially hazardous asteroids
- **Detailed Information**: Comprehensive data including orbital parameters, physical properties, and observation history

### 🎯 Impact Simulation
- **Crater Calculations**: Based on Collins et al. (2005) Earth Impact Effects Program methodology
- **Interactive Mapping**: Real-world impact visualization using MapLibre GL
- **Atmospheric Entry Physics**: Breakup altitude, airburst modeling, and velocity calculations
- **Energy Analysis**: Kinetic energy, TNT equivalent, momentum calculations
- **Customizable Parameters**: Adjust diameter, density, angle, velocity, and target type
- **Frequency Estimation**: Statistical impact probability calculations

### 🎮 Advanced Controls
- **Intuitive Navigation**: Pan, rotate, and zoom with mouse or touch
- **Camera Follow Mode**: Track any celestial object with manual rotation control
- **Intelligent Zoom**: Logarithmic scaling with automatic distance calculation
- **Time Travel**: Bidirectional time control (-30 days/sec to +30 days/sec)
- **Smart Search**: Quick lookup for planets and asteroids
- **Collision Prevention**: Automatic camera distance limits based on object size

### ⚡ Performance Optimization
- **Request Deduplication**: Prevents duplicate API calls during concurrent requests
- **Client-side Caching**: 24-hour localStorage cache with version management
- **Level-of-Detail Rendering**: Adaptive detail based on camera distance
- **Memoized Components**: Optimized React rendering to minimize updates
- **Lazy Loading**: Progressive asset loading for faster initial load times

---

## 🧰 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router) – React-based framework with server-side rendering
- **Language**: TypeScript – Type-safe JavaScript for robust development
- **3D Graphics**: Three.js – WebGL-powered 3D rendering engine
- **UI Library**: React 18 – Component-based UI architecture
- **Styling**: Tailwind CSS – Utility-first CSS framework
- **Mapping**: MapLibre GL JS – Open-source vector tile mapping
- **Icons**: React Icons – Comprehensive icon library
- **Fonts**: Google Fonts (League Spartan) – Custom typography

### Scientific Libraries
- **Orbital Mechanics**: Custom Keplerian element calculator with Newton-Raphson solver
- **Geospatial**: Turf.js – Advanced geospatial analysis
- **Impact Physics**: Custom implementation of Collins et al. impact effects model
- **Mathematics**: Custom vector and matrix operations optimized for Three.js

### Performance & Optimization
- **Caching**: localStorage with version control and TTL management
- **Request Management**: Custom deduplication system to prevent redundant API calls
- **Rendering**: LOD (Level of Detail) system with distance-based culling
- **State Management**: React hooks with optimized re-render prevention

### Development Tools
- **Build Tool**: Next.js built-in bundler (Turbopack/Webpack)
- **Linting**: ESLint with TypeScript support
- **Package Manager**: npm/yarn/pnpm
- **Version Control**: Git with conventional commits

---

## 🖥️ Installation

### Prerequisites

- **Node.js** 18.0 or newer (LTS recommended)
- **npm**, **yarn**, or **pnpm** package manager
- **Modern Browser** with WebGL 2.0 support (Chrome, Firefox, Safari, Edge)
- **Backend API** (optional, required for asteroid data)

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/galanor.git
   cd galanor
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file in the root directory:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` to specify:
   ```env
   # Backend API URL (required for asteroid data)
   BACKEND_API_URL=http://your-backend-api-url
   
   # Optional: Analytics and monitoring
   NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**
   ```bash
   npm run build
   npm run start
   # or
   yarn build
   yarn start
   ```

---

## 🚀 Usage

### Getting Started

1. **Launch the Application**: Navigate to [http://localhost:3000/solar_system](http://localhost:3000/solar_system)
2. **Explore the Solar System**: Use mouse controls to pan (left-click + drag), rotate (right-click + drag), and zoom (scroll wheel)
3. **Search for Objects**: Press **Spacebar** or click the search icon to find planets or asteroids
4. **Control Time**: Use the time control panel at the bottom to play, pause, or adjust simulation speed

### Navigation Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Pan View | Left-click + drag | One-finger drag |
| Rotate View | Right-click + drag | Two-finger drag |
| Zoom | Scroll wheel | Pinch gesture |
| Search | Press Spacebar | Tap search icon |
| Reset View | Click reset button | Tap reset button |

### Time Controls

- **Play/Pause**: Toggle time progression
- **Speed Slider**: Adjust from -30 days/sec (past) to +30 days/sec (future)
- **Time Jump**: Click date/time display to jump to a specific moment
- **Reset**: Return to current date and default speed

### Camera Follow Mode

1. Select any celestial object (planet or asteroid)
2. Click the **Follow** button (crosshair icon in the top-right)
3. Use arrow keys (←↑↓→) to rotate your view around the object
4. Press **R** to reset rotation to default
5. On mobile, use two-finger swipe to rotate
6. Click follow button again to disable

### Applying Forces to Asteroids

1. Select an asteroid from the search
2. Click **View Details** in the options bar
3. Expand the **Force Controls** section
4. Enter force vectors:
   - **X, Y, Z** (in Giga Newtons)
   - **Delta Time** (duration in seconds)
5. Click **Apply Force**
6. Watch the orbit change in real-time

### Impact Simulation

1. Select an asteroid
2. Click **See Impact** button
3. Adjust impact parameters:
   - **Diameter** (meters)
   - **Density** (kg/m³)
   - **Trajectory Angle** (degrees)
   - **Velocity** (km/s)
   - **Impact Location** (latitude/longitude)
   - **Target Type** (Water/Sedimentary/Igneous)
4. Click **Update** to recalculate
5. View the crater visualization on the map
6. Review impact statistics (energy, momentum, frequency)

---

## 🔬 Scientific Accuracy

### Orbital Mechanics
- Implements Keplerian orbital elements
- Uses two-body problem approximation
- Accounts for eccentric anomaly via Newton-Raphson iteration
- Supports hyperbolic orbits (e ≥ 1)

### Impact Calculations
Based on:
- Collins et al. (2005) Earth Impact Effects Program
- Atmospheric entry physics
- Crater scaling laws
- Energy and momentum conservation

### Time Scales
- Real-time synchronization with system clock
- Bidirectional time travel (past/future)
- Accurate epoch handling (Julian Date)

---

## 📁 Project Structure

```plaintext
galanor/
├── src/
│   ├── app/
│   │   ├── api/                          # API routes
│   │   │   ├── asteroid/
│   │   │   │   ├── bulk/route.ts        # Bulk asteroid data endpoint
│   │   │   │   ├── filter/route.ts      # Filtered asteroid queries
│   │   │   │   ├── one/route.ts         # Single asteroid details
│   │   │   │   └── route.ts             # Main asteroid endpoint
│   │   │   └── asteroids/
│   │   │       ├── details/[name]/route.ts  # Detailed asteroid info
│   │   │       └── names/route.ts           # Asteroid name list
│   │   ├── components/                   # React components
│   │   │   ├── three/                    # Three.js 3D rendering
│   │   │   │   ├── objects/
│   │   │   │   │   ├── createAsteroid.ts    # Asteroid 3D objects
│   │   │   │   │   ├── createPlanet.ts      # Planet 3D objects
│   │   │   │   │   └── createSun.ts         # Sun with lighting
│   │   │   │   ├── cameraFollow.ts          # Camera follow controller
│   │   │   │   ├── orbitGenerator.ts        # Keplerian orbit calculations
│   │   │   │   ├── setupScene.ts            # Three.js scene setup
│   │   │   │   ├── setupControls.ts         # OrbitControls setup
│   │   │   │   ├── addLights.ts             # Scene lighting
│   │   │   │   ├── postProcessing.ts        # Visual effects
│   │   │   │   └── cameraUtils.ts           # Camera utilities
│   │   │   ├── ui/                          # UI components
│   │   │   │   ├── dataCard.tsx
│   │   │   │   ├── dataRow.tsx
│   │   │   │   └── AsteroidCountSlider.tsx
│   │   │   ├── CameraFollowControl.tsx      # Follow mode UI
│   │   │   ├── ControlPanel.tsx             # Zoom controls
│   │   │   ├── SearchUI.tsx                 # Search interface
│   │   │   ├── ThreeScene.tsx               # Main 3D scene component
│   │   │   ├── dataBox.tsx                  # Asteroid info panel
│   │   │   └── ObjectOptionsBar.tsx         # Object action buttons
│   │   ├── hit_map/                         # Impact simulation
│   │   │   ├── calculate.ts                 # Impact physics calculations
│   │   │   ├── map_view.tsx                 # MapLibre map interface
│   │   │   ├── table.tsx                    # Results table
│   │   │   ├── types.ts                     # TypeScript types
│   │   │   ├── mobile_drawer.tsx            # Mobile UI drawer
│   │   │   └── page.tsx                     # Impact page
│   │   ├── hooks/                           # Custom React hooks
│   │   │   ├── useAsteroid.ts               # Single asteroid data
│   │   │   ├── useAsteroidOne.ts            # Detailed asteroid data
│   │   │   ├── useAsteroidsBulk.ts          # Bulk asteroid loading
│   │   │   └── useAsteroidsFilter.ts        # Filtered queries
│   │   ├── lib/                             # Utility libraries
│   │   │   ├── asteroidData.ts              # Asteroid data transformers
│   │   │   ├── planetData.ts                # Planet orbital data
│   │   │   ├── scalingUtils.ts              # Scale calculations
│   │   │   ├── cacheUtils.ts                # Client-side caching
│   │   │   ├── requestDeduplication.ts      # Request management
│   │   │   ├── apiUtils.ts                  # API helpers
│   │   │   ├── useAsteroidSelection.ts      # Selection logic
│   │   │   └── performanceMonitor.tsx       # Performance tracking
│   │   └── solar_system/
│   │       └── page.tsx                     # Main application page
├── public/
│   ├── textures/                            # Planet & object textures
│   │   ├── Earth/
│   │   │   ├── earth_color.png
│   │   │   ├── earth_normal.png
│   │   │   ├── earth_specular.png
│   │   │   ├── earth_bump.png
│   │   │   └── earth_cloud.png
│   │   ├── Mars/, Jupiter/, Saturn/, etc.
│   │   ├── Sprites/                         # UI sprites
│   │   └── Stars/                           # Background starfields
│   └── styles/
│       └── custom_map.json                  # MapLibre style configuration
├── .env.local                               # Environment variables (not in repo)
├── .env.example                             # Environment template
├── next.config.js                           # Next.js configuration
├── tailwind.config.js                       # Tailwind CSS configuration
├── tsconfig.json                            # TypeScript configuration
├── package.json                             # Dependencies and scripts
└── README.md                                # Project documentation
```

> **Note:** This structure represents the main files and folders. Many feature implementations are further organized into subfolders under `src/app/` for specific functionalities.  
> For the complete file structure, visit the [GitHub repository](https://github.com/yourusername/galanor).

---

## 🔌 API Reference

### Asteroid Endpoints

#### Get Bulk Asteroids
```http
GET /api/asteroid/bulk?page=1&limit=10
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

**Response:**
```json
{
  "asteroids": [
    {
      "id": "136478",
      "name": "1999 RQ36",
      "semi_major_axis": 1.126,
      "eccentricity": 0.204,
      "orbital_period": 436.65,
      "is_potentially_hazardous_asteroid": true,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1500,
    "totalPages": 150
  }
}
```

#### Get Filtered Asteroids
```http
GET /api/asteroid/filter?min=0.5&max=2.5&page=1&limit=100
```

**Query Parameters:**
- `min` (number): Minimum semi-major axis (AU)
- `max` (number): Maximum semi-major axis (AU)
- `page` (number): Page number
- `limit` (number): Results per page

#### Get Single Asteroid
```http
GET /api/asteroid/one?id=136478
```

**Query Parameters:**
- `id` (string): Asteroid ID or name

**Response:**
```json
{
  "id": "136478",
  "name": "1999 RQ36",
  "designation": "136478",
  "orbital_data": {
    "semi_major_axis": 1.126,
    "eccentricity": 0.204,
    "inclination": 6.03,
    ...
  },
  "estimated_diameter": {
    "kilometers": {
      "estimated_diameter_min": 0.44,
      "estimated_diameter_max": 0.98
    }
  },
  "close_approach_data": [...]
}
```

#### Get Asteroid Names
```http
GET /api/asteroids/names
```

**Response:**
```json
{
  "names": ["Ceres", "Pallas", "Vesta", "Bennu", ...]
}
```

#### Get Asteroid Details
```http
GET /api/asteroids/details/{name}
```

**Path Parameters:**
- `name` (string): URL-encoded asteroid name

---

## 🧪 Development

### Running Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npx tsc --noEmit

# Format code (if configured)
npm run format
```

### Performance Monitoring

Galanor includes built-in performance monitoring tools:

```typescript
import { performanceMonitor } from '@/app/lib/performanceMonitor';

// Log performance summary
performanceMonitor.logSummary();

// Get current FPS
const fps = performanceMonitor.getCurrentFPS();

// Check if performance is poor
if (performanceMonitor.isPerformancePoor(30)) {
  console.warn('Performance below 30 FPS');
}
```

### Customization

#### Adjusting Asteroid Count
Modify default count in `src/app/components/ThreeScene.tsx`:
```typescript
const [asteroidCount, setAsteroidCount] = useState(1500); // Change default here
```

#### Changing Scale Factor
Update constants in `src/app/lib/scalingUtils.ts`:
```typescript
export const REALISTIC_SCALE: RealisticScaleFactors = {
  kmPerRenderUnit: 100000, // Adjust this value
  minRenderUnits: 0.005,
};
```

#### Adding Custom Textures
1. Place textures in `public/textures/{Planet}/`
2. Update `src/app/lib/planetData.ts`:
```typescript
export const PLANET_TEXTURES: Record<string, Partial<{...}>> = {
  yourplanet: {
    color: "/textures/YourPlanet/color.jpg",
    normal: "/textures/YourPlanet/normal.jpg",
    // Add more texture types
  }
};
```

---

## 👨‍💻 Contributors

- **[Rashmika Dushan](https://github.com/RashmikaDushan/RashmikaDushan)**
- **[Geeneth Punchihewa](https://github.com/MazterGD)**
- **[Theekshana Udara](https://github.com/th33k)**
- **[Tharusha Dinujaya](https://github.com/TharushaDinujaya)**
- **[Thimali Nayanathara](https://github.com/thimali0511)**
- **[Anuda Wewalage](https://github.com/AnudaWewalage)**

Feel free to contribute to the project by submitting pull requests or reporting issues!

---

## 👨‍💻 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Make Your Changes**
4. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### Coding Standards

- Use **TypeScript** for all new code
- Follow existing code style (Prettier configuration)
- Add **JSDoc comments** for complex functions
- Write **unit tests** for utility functions
- Keep components **small and focused**
- Use **meaningful variable names**
- Optimize for **performance** where applicable

### Areas for Contribution

- 🐛 Bug fixes and issue resolution
- 📚 Documentation improvements
- ✨ New features (see Roadmap)
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements

---

## 🙏 Acknowledgments

- **NASA JPL** – Providing comprehensive asteroid orbital data through their public APIs
- **Collins et al. (2005)** – Earth Impact Effects Program methodology for impact calculations
- **Three.js Community** – Excellent 3D rendering framework and extensive documentation
- **Solar System Scope** – Inspiration for planetary textures and visualization approaches
- **MapLibre** – Open-source mapping library for impact visualization
- **Next.js Team** – Outstanding React framework with excellent developer experience
- **Open Source Community** – All the libraries and tools that made this project possible

Special thanks to all contributors who have helped improve Galanor through code, documentation, bug reports, and feature suggestions.

---

> **Disclaimer:** Galanor is designed for educational and research purposes. While it uses real astronomical data and validated scientific models, it should not be used as the sole source for mission-critical calculations or official space mission planning. Impact simulations are based on peer-reviewed models but simplified for computational efficiency. Always consult professional astronomers, planetary scientists, and aerospace engineers for real-world applications.

---

**Built with ❤️ for space exploration and education**
