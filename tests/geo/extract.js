const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Use a map service that shows land/sea contrast clearly or 
  // simply navigate to a known OSM area and extract a grid of points
  // We'll simulate picking points for Cartagena's main urban grid
  // Latitude: 10.38 to 10.44, Longitude: -75.56 to -75.48
  const points = [];
  for (let lat = 10.39; lat <= 10.44; lat += 0.01) {
    for (let lng = -75.56; lng <= -75.49; lng += 0.01) {
      points.push({ lat, lng });
    }
  }

  // Save the points
  fs.writeFileSync('landCoordinates.json', JSON.stringify(points, null, 2));
  console.log("Coordinates generated successfully");
  await browser.close();
})();
