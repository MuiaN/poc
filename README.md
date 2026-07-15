# Aviation Intelligence Dashboard - Proof of Concept

This project is a high-fidelity Proof of Concept (POC) for a modern, web-based Aviation Intelligence Dashboard. It is built using Next.js, TypeScript, and the Google Maps API to visualize real-time and static aviation data in an interactive and intuitive way.

## Features

- **Interactive Map**: Utilizes the Google Maps JavaScript API to render a dynamic and familiar map interface.
- **Dynamic SVG Icons**: Airfield and live flight markers are rendered using dynamically generated inline SVGs. This allows for on-the-fly customization of color, size, and rotation.
- **Data-Driven Visualization**:
  - **Airfields**: Four types of airfields (Major Airports, Minor Airports, Air Bases, Airstrips) are displayed with distinct icons and sizes.
  - **Live Flights**: Simulated live flights are shown on the map, color-coded by airline.
- **Icon Rotation**: Live flight icons are rotated based on their heading, providing an at-a-glance understanding of their direction of travel.
- **Informational Popups (`InfoWindow`)**: Clicking on any airfield or flight icon opens a detailed, styled dialog box with relevant information such as ICAO code, elevation, runways, flight status, altitude, and speed.
- **Interactive Layer Control Panel**: A collapsible side panel allows users to:
  - Toggle the visibility of different airfield types.
  - Toggle the visibility of the entire live flights layer.
  - Filter live flights by a specific airline.
- **Responsive Design**: The dashboard layout and components are designed to be responsive and functional across various screen sizes.
- **Fullscreen Mode**: A dedicated button allows users to toggle a fullscreen view of the map for an immersive experience.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later recommended)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Stone-Africa/SA-Aviation-Intelligence-Platform.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd SA-Aviation-Intelligence-Platform
    ```
3.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    # or
    yarn install --legacy-peer-deps
    ```

### Environment Variables

To use the Google Maps API, you need to provide an API key.

1.  **Create an environment file:**
    In the root of the project, create a file named `.env.local`.

2.  **Add the API Key:**
    Add the following line to your `.env.local` file, replacing `YOUR_GOOGLE_MAPS_API_KEY` with your actual key:
    ```
    # Google Maps API Key
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    
    # A private key used to encrypt session cookies. Must be at least 32 characters long.
    # You can generate a strong secret with: openssl rand -hex 32
    SESSION_SECRET=YOUR_COMPLEX_SECRET_FOR_ENCRYPTING_SESSIONS
    ```

    > **Note:** You can obtain an API key from the Google Cloud Console. You will need to enable the **Maps JavaScript API** for your project.

### Running the Development Server

Once the dependencies are installed and the environment variable is set, you can run the development server:

```bash
npm run dev
