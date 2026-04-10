/* =========================================
    1. THREE.JS SETUP & SCENE INITIALIZATION
========================================= */
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Soft dark blue fog for depth
scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 150;
controls.minDistance = 10;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 50, 20);
scene.add(dirLight);

// Axes Helpers (Custom to match standard Red/Green/Blue logic)
// Red: X (Size), Green: Y (Price), Blue: Z (Age)
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

/* =========================================
    2. DATA GENERATION & MESHES
========================================= */
const NUM_POINTS = 60;
const pointsData = [];

// True equation: Price(Y) = 2.5 * Size(X) - 1.8 * Age(Z) + 10 + noise
const beta0 = 10;
const beta1 = 2.5;
const beta2 = -1.8;

const geometryPoints = new THREE.BufferGeometry();
const positions = new Float32Array(NUM_POINTS * 3);

for (let i = 0; i < NUM_POINTS; i++) {
    // Randomize Size (X) between -15 and 15
    const x = (Math.random() - 0.5) * 30;
    // Randomize Age (Z) between -15 and 15
    const z = (Math.random() - 0.5) * 30;

    // Calculate Y with some random noise to simulate real-world variance
    const noise = (Math.random() - 0.5) * 15;
    let y = beta0 + (beta1 * x) + (beta2 * z) + noise;

    // Push to arrays
    pointsData.push({ x, y, z, actualY: y });
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

geometryPoints.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const materialPoints = new THREE.PointsMaterial({
    color: 0x06b6d4, // Cyan
    size: 1.5,
    transparent: true,
    opacity: 0.9
});
const pointCloud = new THREE.Points(geometryPoints, materialPoints);
scene.add(pointCloud);

// --- Regression Plane ---
// We will create a plane that we can move mathematically
const planeSize = 40;
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
// Rotate to sit horizontally initially
planeGeo.rotateX(-Math.PI / 2);

const planeMat = new THREE.MeshPhongMaterial({
    color: 0x10b981, // Emerald
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    wireframe: false
});
const planeWireMat = new THREE.MeshBasicMaterial({
    color: 0x059669,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const planeGroup = new THREE.Group();
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
const planeWire = new THREE.Mesh(planeGeo, planeWireMat);
planeGroup.add(planeMesh);
planeGroup.add(planeWire);
planeGroup.visible = false;
scene.add(planeGroup);

// --- Residual Lines ---
const residualsGeo = new THREE.BufferGeometry();
// 2 vertices per line, 3 coordinates per vertex
const resPositions = new Float32Array(NUM_POINTS * 2 * 3);
residualsGeo.setAttribute('position', new THREE.BufferAttribute(resPositions, 3));
const residualsMat = new THREE.LineBasicMaterial({
    color: 0xef4444, // Red
    transparent: true,
    opacity: 0.7
});
const residualsLines = new THREE.LineSegments(residualsGeo, residualsMat);
residualsLines.visible = false;
scene.add(residualsLines);

// Helper to mathematically predict Y on the plane given X and Z
function getPlaneY(x, z, b0, b1, b2) {
    return b0 + (b1 * x) + (b2 * z);
}

// Function to update the geometry of the plane based on coefficients
let currentB0 = 0, currentB1 = 0, currentB2 = 0;
function updatePlaneGeometry(b0, b1, b2) {
    const positions = planeGeo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = getPlaneY(x, z, b0, b1, b2); // Update Y coordinate
    }
    planeGeo.attributes.position.needsUpdate = true;
    planeGeo.computeVertexNormals();
}

// Function to draw lines from points to the plane
function updateResiduals() {
    const positions = residualsGeo.attributes.position.array;
    for (let i = 0; i < NUM_POINTS; i++) {
        const pt = pointsData[i];
        const planeY = getPlaneY(pt.x, pt.z, currentB0, currentB1, currentB2);

        // Start of line (Data point)
        positions[i * 6] = pt.x;
        positions[i * 6 + 1] = pt.y;
        positions[i * 6 + 2] = pt.z;

        // End of line (On the plane)
        positions[i * 6 + 3] = pt.x;
        positions[i * 6 + 4] = planeY;
        positions[i * 6 + 5] = pt.z;
    }
    residualsGeo.attributes.position.needsUpdate = true;
}

/* =========================================
    3. ANIMATION STATE MANAGEMENT
========================================= */
let targetCameraPos = new THREE.Vector3();
let isAnimatingPlane = false;
let autoRotateScene = false;

// Variables for Step 5 optimization animation
let optProgress = 0;
let startB0, startB1, startB2;

/* =========================================
    4. STEP DEFINITIONS & CONTENT
========================================= */
const steps = [
    {
        title: "1. Simple vs. Multiple",
        content: `
            <p>Welcome! To understand <strong>Multiple Linear Regression (MLR)</strong>, let's start with a real-world goal: <strong>Predicting House Prices</strong>.</p>
            <p>In <em>Simple</em> Linear Regression, we use only <strong>one feature</strong> to predict the target. For example, predicting Price (Y, Green Axis) using only Size (X, Red Axis).</p>
            <div class="bg-slate-100 p-4 rounded-lg my-4 text-sm border-l-4 border-emerald-500">
                <strong>Look at the 3D Graph:</strong> Right now, we are looking straight down the Z-axis. It looks like a standard 2D scatter plot. Size goes up, Price goes up.
            </div>
            <p>But real life is complex. A large house might be cheap if it's very old. One feature isn't enough!</p>
        `,
        action: () => {
            // Look straight down Z to fake a 2D plot
            targetCameraPos.set(0, 0, 70);
            planeGroup.visible = false;
            residualsLines.visible = false;
            isAnimatingPlane = false;
            autoRotateScene = false;
        }
    },
    {
        title: "2. Adding Dimensions",
        content: `
            <p>To make a better model, we add a second feature: <strong>Age of the house</strong>.</p>
            <p>Notice how the camera just shifted? We have expanded our data from a flat 2D wall into a <strong>3D space</strong>. The Blue Axis (Z) now represents Age.</p>
            <ul class="list-disc pl-5 my-4 space-y-2">
                <li><strong>X (Red):</strong> Size of the house ($X_1$)</li>
                <li><strong>Z (Blue):</strong> Age of the house ($X_2$)</li>
                <li><strong>Y (Green):</strong> Actual Price ($Y$)</li>
            </ul>
            <p>By moving from 1 feature to 2 (or more) features, we officially enter the realm of <strong>Multiple Linear Regression</strong>.</p>
        `,
        action: () => {
            // Move to isometric view to reveal 3D nature
            targetCameraPos.set(40, 30, 45);
            planeGroup.visible = false;
            residualsLines.visible = false;
            isAnimatingPlane = false;
            autoRotateScene = false;
        }
    },
    {
        title: "3. The Plane of Best Fit",
        content: `
            <p>In 2D Simple Regression, we draw a <em>line</em> through the data. But in 3D Multiple Regression, our model becomes a flat <strong>Plane</strong> (the green surface you see now).</p>
            <p>If we had 4 or 5 features, it would be called a <em>Hyperplane</em>, but 3D is the limit of human visualization!</p>
            <div class="bg-slate-100 p-4 rounded-lg my-4 text-sm border-l-4 border-emerald-500">
                <strong>What does the plane mean?</strong><br/>
                For any given combination of Size (X) and Age (Z) on the floor, if you travel straight up to the green plane, that height is the <strong>Price our model predicts</strong>.
            </div>
        `,
        action: () => {
            targetCameraPos.set(45, 25, 45);
            planeGroup.visible = true;
            residualsLines.visible = false;
            isAnimatingPlane = false;
            autoRotateScene = false;

            // Set to optimal directly
            currentB0 = beta0; currentB1 = beta1; currentB2 = beta2;
            updatePlaneGeometry(currentB0, currentB1, currentB2);
        }
    },
    {
        title: "4. The Residuals (Errors)",
        content: `
            <p>Models are never 100% perfect. Look closely at the data points (cyan dots) relative to the plane.</p>
            <p>The vertical <strong>Red Lines</strong> have appeared. These are called <strong>Residuals</strong> ($\\epsilon$).</p>
            <p>A residual is simply the distance between the <em>Actual Price</em> (the cyan dot) and the <em>Predicted Price</em> (the plane).</p>
            <ul class="list-disc pl-5 my-4 space-y-2">
                <li>Point above the plane? Model under-predicted.</li>
                <li>Point below the plane? Model over-predicted.</li>
            </ul>
        `,
        action: () => {
            targetCameraPos.set(40, 15, 50);
            planeGroup.visible = true;
            residualsLines.visible = true;
            isAnimatingPlane = false;
            autoRotateScene = false;

            currentB0 = beta0; currentB1 = beta1; currentB2 = beta2;
            updatePlaneGeometry(currentB0, currentB1, currentB2);
            updateResiduals();
        }
    },
    {
        title: "5. Optimization (OLS)",
        content: `
            <p>How does the computer choose exactly where to put this plane? It uses a mathematical algorithm called <strong>Ordinary Least Squares (OLS)</strong>.</p>
            <p>The goal of OLS is to tilt, angle, and shift the plane until the <em>sum of the squared lengths</em> of all those red residual lines is as small as possible.</p>
            <div class="bg-emerald-100 p-4 rounded-lg my-4 text-emerald-900 text-sm border border-emerald-300">
                <strong>Animation Active:</strong> Watch the plane move from a bad, flat guess to the optimal mathematically perfect fit. Notice how the red error lines shrink overall!
            </div>
        `,
        action: () => {
            targetCameraPos.set(50, 20, 40);
            planeGroup.visible = true;
            residualsLines.visible = true;

            // Start from a flat, bad plane
            startB0 = -10; startB1 = 0; startB2 = 0;
            currentB0 = startB0; currentB1 = startB1; currentB2 = startB2;
            updatePlaneGeometry(currentB0, currentB1, currentB2);
            updateResiduals();

            // Trigger animation loop logic
            optProgress = 0;
            isAnimatingPlane = true;
            autoRotateScene = false;
        }
    },
    {
        title: "6. The Mathematical Recap",
        content: `
            <p>Here is the underlying mathematics that defines what you just saw.</p>

            <strong>1. The Equation of the Model:</strong>
            <div class="math-scroll">
                $$Y = \\beta_0 + \\beta_1 X_1 + \\beta_2 X_2 + \\epsilon$$
            </div>
            <ul class="text-sm space-y-1 mb-4">
                <li>$Y$: Dependent Variable (Price)</li>
                <li>$\\beta_0$: Y-intercept (Base value when features are 0)</li>
                <li>$\\beta_1, \\beta_2$: Coefficients (Weights determining the slope of the plane)</li>
                <li>$X_1, X_2$: Independent Variables (Size, Age)</li>
                <li>$\\epsilon$: The Error term (Residuals)</li>
            </ul>

            <strong>2. The Matrix Form (For $n$ features):</strong>
            <div class="math-scroll">
                $$Y = X\\beta + \\epsilon$$
            </div>

            <strong>3. The OLS Solution:</strong>
            <p class="text-sm">To find the best plane (minimizing errors), linear algebra gives us this exact formula for the coefficients ($\\hat{\\beta}$):</p>
            <div class="math-scroll">
                $$\\hat{\\beta} = (X^T X)^{-1} X^T Y$$
            </div>
            <p class="text-sm mt-4 italic text-slate-500">Feel free to rotate and explore the final optimized model on the left!</p>
        `,
        action: () => {
            // Keep the final plane
            currentB0 = beta0; currentB1 = beta1; currentB2 = beta2;
            updatePlaneGeometry(currentB0, currentB1, currentB2);
            updateResiduals();

            planeGroup.visible = true;
            residualsLines.visible = true;
            isAnimatingPlane = false;

            // Start auto-rotating around the beautiful final graph
            autoRotateScene = true;
        }
    }
];

/* =========================================
    5. UI & LOGIC HANDLING
========================================= */
let currentStepIndex = 0;

const uiTitle = document.getElementById('step-title');
const uiContent = document.getElementById('step-content');
const uiIndicator = document.getElementById('step-indicator');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const progressBar = document.getElementById('progress-bar');

function renderStep(index) {
    // Fade out
    uiTitle.classList.add('opacity-0');
    uiContent.classList.add('opacity-0');

    setTimeout(() => {
        const step = steps[index];

        // Update DOM
        uiIndicator.innerText = `Step ${index + 1} of ${steps.length}`;
        uiTitle.innerHTML = step.title;
        uiContent.innerHTML = step.content;

        // Update Progress Bar
        progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;

        // Update Buttons
        btnPrev.disabled = index === 0;
        btnNext.disabled = index === steps.length - 1;

        // Trigger MathJax re-render for new formulas
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([uiContent]).then(() => {
                // Fade in after math renders
                uiTitle.classList.remove('opacity-0');
                uiContent.classList.remove('opacity-0');
            });
        } else {
            uiTitle.classList.remove('opacity-0');
            uiContent.classList.remove('opacity-0');
        }

        // Trigger 3D Action
        step.action();

    }, 300); // match transition duration
}

btnPrev.addEventListener('click', () => {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(currentStepIndex);
    }
});

btnNext.addEventListener('click', () => {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);
    }
});

/* =========================================
    6. RENDER LOOP & ANIMATIONS
========================================= */
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    controls.update();

    // Smoothly move camera to target position
    if (!autoRotateScene) {
        camera.position.lerp(targetCameraPos, 0.05);
    } else {
        // Auto rotate around center slowly in Step 6
        const time = Date.now() * 0.0005;
        const radius = 60;
        camera.position.x = Math.sin(time) * radius;
        camera.position.z = Math.cos(time) * radius;
        camera.position.y = 30;
        camera.lookAt(scene.position);
    }

    // Animate Plane Optimization (Step 5)
    if (isAnimatingPlane && optProgress < 1) {
        optProgress += delta * 0.3; // Speed of optimization animation
        if (optProgress > 1) optProgress = 1;

        // Easing function (easeOutCubic) for smooth settling
        const ease = 1 - Math.pow(1 - optProgress, 3);

        // Lerp coefficients
        currentB0 = THREE.MathUtils.lerp(startB0, beta0, ease);
        currentB1 = THREE.MathUtils.lerp(startB1, beta1, ease);
        currentB2 = THREE.MathUtils.lerp(startB2, beta2, ease);

        updatePlaneGeometry(currentB0, currentB1, currentB2);
        updateResiduals();
    }

    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Initialize App
window.onload = function () {
    // Set initial camera position quickly
    camera.position.set(0, 0, 70);

    // Remove Loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        // Start first step
        renderStep(0);
        // Start render loop
        animate();
    }, 500);
};