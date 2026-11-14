// chart3d.js - 3D bar chart of the Finder Heroes (Three.js r128, loaded as a normal script).
// One bar for every finder. Bar height = points / 10. The chart turns by itself,
// and the button "Pause rotation" stops and starts the turning.
//
// The five basic parts of every Three.js picture:
//   1. Scene    - the stage that holds everything
//   2. Camera   - the point of view
//   3. Renderer - draws the scene on a <canvas>
//   4. Mesh     - an object = a shape (geometry) + a surface (material). Our bars are boxes
//   5. Light    - without light the objects stay dark

const chartBox = document.getElementById("chart3d");
const chartMessage = document.getElementById("chart3dMessage");
const pauseButton = document.getElementById("pauseRotation");

// Colors: gold, silver, bronze for places 1 to 3, blue for all the others
const BAR_COLORS = [0xffc107, 0xc0c0c0, 0xcd7f32];
const BLUE = 0x3b82f6;

// Show a message instead of the chart (the rest of the page keeps working)
function showChartMessage(text) {
  chartBox.classList.add("d-none");
  pauseButton.classList.add("d-none");
  chartMessage.textContent = text;
  chartMessage.classList.remove("d-none");
}

// Can this browser draw with WebGL?
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (error) {
    return false;
  }
}

function drawChart(finders) {
  const width = chartBox.clientWidth;
  const height = chartBox.clientHeight;

  // 1) Scene
  const scene = new THREE.Scene();

  // 2) Camera (field of view 45 degrees)
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

  // 3) Renderer: draws the picture on a canvas that we put inside the page
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  chartBox.appendChild(renderer.domElement);

  // 5) Light: a soft light from everywhere + a "sun" from one side
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(5, 10, 7);
  scene.add(sun);

  // 4) Meshes: one group holds the floor and all the bars, so they turn together
  const chart = new THREE.Group();
  scene.add(chart);

  const gap = 1.8;   // distance between two bars
  let tallest = 1;
  for (let i = 0; i < finders.length; i++) {
    const barHeight = finders[i].points / 10;   // 10 points = 1 unit of height
    if (barHeight > tallest) {
      tallest = barHeight;
    }

    let color = BLUE;
    if (i < 3) {
      color = BAR_COLORS[i];
    }

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, barHeight, 1.2),
      new THREE.MeshStandardMaterial({ color: color, metalness: 0.2, roughness: 0.5 })
    );
    // Bars stand in a row, the row is centered. y = half of the height, so the bar stands on the floor
    bar.position.set((i - (finders.length - 1) / 2) * gap, barHeight / 2, 0);
    chart.add(bar);
  }

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(finders.length * gap + 1, 0.1, 3),
    new THREE.MeshStandardMaterial({ color: 0xe5e7eb })
  );
  floor.position.set(0, -0.05, 0);
  chart.add(floor);

  // Put the camera far enough to see all the bars, and look at the middle of the chart
  camera.position.set(0, tallest * 0.9 + 3, finders.length * 1.6 + 8);
  camera.lookAt(0, tallest / 2, 0);

  // The turning: every frame the chart turns a little, unless it is paused.
  // People who asked their system for less motion start with the chart paused.
  let paused = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  pauseButton.textContent = paused ? "Start rotation" : "Pause rotation";
  pauseButton.addEventListener("click", function () {
    paused = !paused;
    pauseButton.textContent = paused ? "Resume rotation" : "Pause rotation";
  });

  function animate() {
    if (!paused) {
      chart.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Keep the picture sharp when the window changes size
  window.addEventListener("resize", function () {
    renderer.setSize(chartBox.clientWidth, chartBox.clientHeight);
    camera.aspect = chartBox.clientWidth / chartBox.clientHeight;
    camera.updateProjectionMatrix();
  });
}

// ----- Start: three safety messages, so the Heroes page never breaks -----
const chartFinders = buildFinderBoard(getItems());

if (typeof THREE === "undefined") {
  showChartMessage("The 3D chart could not be loaded (the Three.js library did not load). The ranking below shows the same information.");
} else if (!webglAvailable()) {
  showChartMessage("The 3D chart cannot be shown because this browser or device does not support WebGL. The ranking below shows the same information.");
} else if (chartFinders.length === 0) {
  showChartMessage("There are no heroes yet, so there is nothing to draw. Return a found item to be the first!");
} else {
  try {
    drawChart(chartFinders);
  } catch (error) {
    showChartMessage("The 3D chart could not be drawn on this device. The ranking below shows the same information.");
  }
}
