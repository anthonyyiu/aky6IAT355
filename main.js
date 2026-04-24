// ---------- LEAFLET MAP ----------
const map = L.map('map', {
  worldCopyJump: false,
  maxBounds: [[-85, -180], [85, 180]],
  maxBoundsViscosity: 1.0
}).setView([52.5, -1.5], 6);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
  noWrap: true
}).addTo(map);

// Load racecourses from the generated JSON file
fetch('data/racecourses.json')
  .then(response => response.json())
  .then(raceCourses => {
    console.log(`Loaded ${raceCourses.length} racecourses`);
    
    raceCourses.forEach(course => {
      L.marker([course.lat, course.lng]).addTo(map)
        .bindPopup(course.name + " Racecourse");
    });
  })
  .catch(error => {
    console.error('Error loading racecourses:', error);
    // Fallback to hardcoded courses if JSON fails to load
    const fallbackCourses = [
      { name: "Ascot", lat: 51.4096, lng: -0.5856 },
      { name: "Cheltenham", lat: 51.9194, lng: -2.0581 },
      { name: "Newmarket", lat: 52.2446, lng: 0.4074 }
    ];
    fallbackCourses.forEach(course => {
      L.marker([course.lat, course.lng]).addTo(map)
        .bindPopup(course.name + " Racecourse");
    });
  });


// ---------- VEGA-LITE CHARTS ----------

// LINE CHART
const lineSpec = {
  data: { url: "data/combined_horses.csv" },
  mark: "line",
  encoding: {
    x: { field: "year", type: "temporal", title: "Year" },
    y: { aggregate: "count", title: "Number of Races" }
  }
};

vegaEmbed("#lineChart", lineSpec);


// SCATTER
const scatterSpec = {
  data: { url: "data.csv" },
  mark: "circle",
  encoding: {
    x: { field: "decimalPrice", type: "quantitative", title: "Odds" },
    y: { field: "position", type: "quantitative", title: "Finish Position" },
    color: { field: "isFav", type: "nominal", title: "Favorite?" }
  }
};

vegaEmbed("#scatterPlot", scatterSpec);


// AGE DISTRIBUTION
const ageSpec = {
  data: { url: "data.csv" },
  mark: "bar",
  encoding: {
    x: { field: "age", bin: true, title: "Age" },
    y: { aggregate: "count", title: "Count" }
  }
};

vegaEmbed("#ageChart", ageSpec);


// BAR CHART
const barSpec = {
  data: { url: "data.csv" },
  transform: [
    { aggregate: [{ op: "count", as: "wins" }], groupby: ["jockeyName"] },
    { window: [{ op: "rank", as: "rank" }], sort: [{ field: "wins", order: "descending" }] },
    { filter: "datum.rank <= 10" }
  ],
  mark: "bar",
  encoding: {
    x: { field: "jockeyName", type: "nominal", sort: "-y", title: "Jockey" },
    y: { field: "wins", type: "quantitative", title: "Wins" }
  }
};

vegaEmbed("#barChart", barSpec);

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;

  const progress = scrollTop / docHeight;

  const trackHeight = window.innerHeight - 100; // padding
  const horseY = progress * trackHeight;

  document.getElementById("horse").style.top = horseY + "px";
});

// Make horse draggable to scroll
const horse = document.getElementById("horse");
let isDragging = false;
let startY;
let startScrollY;

horse.addEventListener("mousedown", (e) => {
  isDragging = true;
  startY = e.clientY;
  startScrollY = window.scrollY;
  horse.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startY;
  const trackHeight = window.innerHeight - 100;
  const scrollAmount = (deltaY / trackHeight) * (document.body.scrollHeight - window.innerHeight);
  window.scrollTo(0, startScrollY + scrollAmount);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  horse.style.cursor = "grab";
});

horse.style.cursor = "grab";