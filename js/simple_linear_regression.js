// --- Data & Math Setup ---
const rawData = [
    { x: 12, y: 180 },
    { x: 14, y: 210 },
    { x: 16, y: 260 },
    { x: 18, y: 250 },
    { x: 22, y: 340 },
    { x: 24, y: 390 },
    { x: 26, y: 420 },
    { x: 28, y: 460 },
    { x: 32, y: 550 }
];

// Calculate Regression Parameters (OLS)
const n = rawData.length;
let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
rawData.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += (p.x * p.y);
    sumX2 += (p.x * p.x);
});

const meanX = sumX / n;
const meanY = sumY / n;

// OLS Beta 1 (Slope)
let numerator = 0;
let denominator = 0;
rawData.forEach(p => {
    numerator += (p.x - meanX) * (p.y - meanY);
    denominator += Math.pow(p.x - meanX, 2);
});
const beta1 = numerator / denominator;

// OLS Beta 0 (Intercept)
const beta0 = meanY - beta1 * meanX;

// Prediction functions
const predictY = (x) => beta0 + beta1 * x;

// Custom Prediction for Step 2 Interactions
let customBeta0 = 0;
let customBeta1 = 15;
const predictCustomY = (x) => customBeta0 + customBeta1 * x;

// --- Step Definitions ---
const steps = [
    {
        title: "1. The Data & The Problem",
        canvasTitle: "Scatter Plot: Temperature vs. Sales",
        content: `
            <h3 class="text-xl font-bold text-slate-800 mb-4">The Real-World Scenario</h3>
            <p class="mb-4 text-slate-600 leading-relaxed">Imagine you own an ice cream shop. You have a strong suspicion that weather affects your business. You decide to record the daily high temperature and your total sales for several days.</p>
            <ul class="space-y-2 mb-6">
                <li class="flex items-start"><span class="bg-blue-100 text-blue-700 p-1 rounded mr-2 text-xs font-bold">X</span> <strong>Independent Variable:</strong> Temperature (°C)</li>
                <li class="flex items-start"><span class="bg-green-100 text-green-700 p-1 rounded mr-2 text-xs font-bold">Y</span> <strong>Dependent Variable:</strong> Ice Cream Sales ($)</li>
            </ul>
            <p class="text-slate-600 leading-relaxed">By plotting this data on a scatter plot (left), we can visually see a positive relationship: as it gets hotter, people buy more ice cream. But how can we predict exactly <em>how much</em> more?</p>
        `
    },
    {
        title: "2. The Goal: Line of Best Fit",
        canvasTitle: "Interactive: Draw Your Own Line",
        content: `
            <h3 class="text-xl font-bold text-slate-800 mb-4">Finding the Trend</h3>
            <p class="mb-4 text-slate-600 leading-relaxed">To make predictions, we want to draw a straight line straight through the "middle" of our data points. The general equation of a straight line is:</p>
            <div class="bg-slate-100 p-3 rounded-lg mb-4 border border-slate-200">
                <div class="text-center text-lg overflow-x-auto overflow-y-hidden">
                    $$\\hat{y} = \\beta_0 + \\beta_1x$$
                </div>
            </div>
            <p class="text-slate-700 font-semibold mb-2">Try adjusting the line manually!</p>
            <p class="text-sm text-slate-600 mb-4">Use the sliders to tweak the Intercept ($\\beta_0$) and Slope ($\\beta_1$) to find what you think is the best fit before we calculate the optimal one.</p>

            <!-- Dynamic Equation Display -->
            <div class="text-center text-lg font-mono text-indigo-700 bg-indigo-50 p-2 rounded mb-6 border border-indigo-100 shadow-inner">
                ŷ = <span id="eq-b0" class="font-bold">0</span> + <span id="eq-b1" class="font-bold">15.0</span>x
            </div>

            <!-- Interactive Sliders -->
            <div class="space-y-5">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label for="slider-b0" class="text-sm font-semibold text-slate-700">Intercept ($\\beta_0$)</label>
                        <span id="val-b0" class="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">0</span>
                    </div>
                    <input type="range" id="slider-b0" min="-150" max="150" step="1" value="0" class="w-full accent-indigo-600 cursor-pointer h-2">
                    <p class="text-xs text-slate-500 mt-1">Starting point (sales when 0°C)</p>
                </div>
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label for="slider-b1" class="text-sm font-semibold text-slate-700">Slope ($\\beta_1$)</label>
                        <span id="val-b1" class="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">15.0</span>
                    </div>
                    <input type="range" id="slider-b1" min="0" max="30" step="0.5" value="15" class="w-full accent-indigo-600 cursor-pointer h-2">
                    <p class="text-xs text-slate-500 mt-1">Steepness (sales increase per 1°C)</p>
                </div>
            </div>
        `,
        onRender: () => {
            const sliderB0 = document.getElementById('slider-b0');
            const sliderB1 = document.getElementById('slider-b1');
            const valB0 = document.getElementById('val-b0');
            const valB1 = document.getElementById('val-b1');
            const eqB0 = document.getElementById('eq-b0');
            const eqB1 = document.getElementById('eq-b1');

            // Set initial values
            sliderB0.value = customBeta0;
            sliderB1.value = customBeta1;
            valB0.innerText = customBeta0;
            valB1.innerText = customBeta1.toFixed(1);
            eqB0.innerText = customBeta0;
            eqB1.innerText = customBeta1.toFixed(1);

            // Setup Event Listeners
            sliderB0.addEventListener('input', (e) => {
                customBeta0 = parseFloat(e.target.value);
                valB0.innerText = customBeta0;
                eqB0.innerText = customBeta0;
                renderCanvas(); // Redraw instantly
            });

            sliderB1.addEventListener('input', (e) => {
                customBeta1 = parseFloat(e.target.value);
                valB1.innerText = customBeta1.toFixed(1);
                eqB1.innerText = customBeta1.toFixed(1);
                renderCanvas(); // Redraw instantly
            });
        }
    },
    {
        title: "3. Measuring Error (Residuals)",
        canvasTitle: "Visualizing Residuals (Errors)",
        content: `
            <h3 class="text-xl font-bold text-slate-800 mb-4">Nobody is Perfect</h3>
            <p class="mb-4 text-slate-600 leading-relaxed">Notice that our straight line doesn't perfectly touch every single dot. The real world has variance!</p>
            <p class="mb-4 text-slate-600 leading-relaxed">The vertical distance between an actual data point ($y$) and our predicted optimal line ($\\hat{y}$) is called the <strong>Residual</strong> or <strong>Error</strong>.</p>
            <div class="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                <div class="text-center text-lg">
                    $$\\text{Error}_i = y_i - \\hat{y}_i$$
                </div>
            </div>
            <p class="text-slate-600 leading-relaxed">Look at the graph. The red dashed lines represent these errors based on the mathematically optimal line. To find this "best" line, we needed to minimize these errors as much as possible.</p>
        `
    },
    {
        title: "4. Ordinary Least Squares (OLS)",
        canvasTitle: "Squaring the Residuals",
        content: `
            <h3 class="text-xl font-bold text-slate-800 mb-4">Squaring the Errors</h3>
            <p class="mb-4 text-slate-600 leading-relaxed">If we simply add up the errors, the negative errors (points below the line) would cancel out the positive errors (points above). </p>
            <p class="mb-4 text-slate-600 leading-relaxed">To fix this, and to heavily penalize large errors, we <strong>square</strong> each residual. This creates physical "squares" attached to our line.</p>
            <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                <p class="text-sm font-semibold text-indigo-800 mb-2">The OLS Goal:</p>
                <p class="text-slate-700 text-sm">Find the line that minimizes the total sum of the areas of these red squares.</p>
            </div>
            <p class="text-slate-600 leading-relaxed">The line you see is the mathematical winner—it produces the smallest possible total square area. That's why it's called <strong>Ordinary Least Squares</strong>.</p>
        `
    },
    {
        title: "5. Recap & The Formulas",
        canvasTitle: "The Final Mathematical Model",
        content: `
            <h3 class="text-xl font-bold text-slate-800 mb-4">The Mathematical Engine</h3>
            <p class="mb-4 text-slate-600 leading-relaxed">Behind the scenes, the machine learning model calculated the absolute optimal line using these specific formulas:</p>

            <div class="space-y-4">
                <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <p class="text-sm font-bold text-slate-700 mb-1">1. The Estimated Slope ($\\beta_1$)</p>
                    <p class="text-xs text-slate-500 mb-2">Calculates the steepness based on variance & covariance.</p>
                    <div class="overflow-x-auto overflow-y-hidden">$$\\beta_1 = \\frac{\\sum_{i=1}^{n} (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum_{i=1}^{n} (x_i - \\bar{x})^2}$$</div>
                </div>

                <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <p class="text-sm font-bold text-slate-700 mb-1">2. The Estimated Intercept ($\\beta_0$)</p>
                    <p class="text-xs text-slate-500 mb-2">Ensures the line passes through the mean of X and Y.</p>
                    <div class="overflow-x-auto overflow-y-hidden">$$\\beta_0 = \\bar{y} - \\beta_1\\bar{x}$$</div>
                </div>

                <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <p class="text-sm font-bold text-emerald-900 mb-1">Final Optimal Model for our Ice Cream Shop:</p>
                    <div class="overflow-x-auto overflow-y-hidden text-emerald-900 font-medium">$$\\text{Sales} = ${beta0.toFixed(2)} + ${beta1.toFixed(2)}(\\text{Temp})$$</div>
                    <p class="text-xs text-emerald-700 mt-2">If tomorrow is 30°C, we predict $${(beta0 + beta1 * 30).toFixed(2)} in sales!</p>
                </div>
            </div>
        `
    }
];

let currentStep = 0;

// --- DOM Elements ---
const canvas = document.getElementById('regressionCanvas');
const ctx = canvas.getContext('2d');
const contentDiv = document.getElementById('step-content');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const counterSpan = document.getElementById('step-counter');
const canvasTitle = document.getElementById('canvas-title');
const stepIndicatorsContainer = document.getElementById('step-indicators');

// --- Canvas Setup ---
canvas.width = 800;
canvas.height = 600;

const padding = 80;
const xMin = 0;
const xMax = 40; // Max temp
const yMin = 0;
const yMax = 600; // Max sales

// Coordinate mapping functions
function mapX(x) {
    return padding + ((x - xMin) / (xMax - xMin)) * (canvas.width - padding * 2);
}

function mapY(y) {
    return canvas.height - padding - ((y - yMin) / (yMax - yMin)) * (canvas.height - padding * 2);
}

function drawAxes() {
    ctx.beginPath();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;

    // Y Axis
    ctx.moveTo(mapX(0), mapY(yMax));
    ctx.lineTo(mapX(0), mapY(0));

    // X Axis
    ctx.moveTo(mapX(0), mapY(0));
    ctx.lineTo(mapX(xMax), mapY(0));
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#475569";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Temperature (°C) →", canvas.width / 2, canvas.height - 20);

    ctx.save();
    ctx.translate(25, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("← Ice Cream Sales ($)", 0, 0);
    ctx.restore();

    // Ticks X
    ctx.font = "14px sans-serif";
    for (let i = 0; i <= xMax; i += 5) {
        const px = mapX(i);
        const py = mapY(0);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + 5);
        ctx.stroke();
        if (i > 0) ctx.fillText(i, px, py + 20);
    }

    // Ticks Y
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= yMax; i += 100) {
        const px = mapX(0);
        const py = mapY(i);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 5, py);
        ctx.stroke();
        if (i > 0) ctx.fillText(i, px - 10, py);
    }
}

function drawPoints() {
    rawData.forEach(p => {
        ctx.beginPath();
        ctx.arc(mapX(p.x), mapY(p.y), 6, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
        ctx.strokeStyle = "#1d4ed8";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawLine() {
    ctx.beginPath();

    // Differentiate Custom Interactive Line vs OLS Optimal Line
    if (currentStep === 1) {
        ctx.strokeStyle = "#4f46e5"; // indigo-600 for custom line
    } else {
        ctx.strokeStyle = "#10b981"; // emerald-500 for optimal line
    }

    ctx.lineWidth = 4;

    const startX = Math.max(0, xMin);
    const endX = xMax;

    // Use corresponding math depending on step
    const yStart = currentStep === 1 ? predictCustomY(startX) : predictY(startX);
    const yEnd = currentStep === 1 ? predictCustomY(endX) : predictY(endX);

    ctx.moveTo(mapX(startX), mapY(yStart));
    ctx.lineTo(mapX(endX), mapY(yEnd));
    ctx.stroke();
}

function drawResiduals() {
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    rawData.forEach(p => {
        const predY = predictY(p.x);
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.moveTo(mapX(p.x), mapY(p.y));
        ctx.lineTo(mapX(p.x), mapY(predY));
        ctx.stroke();
    });
    ctx.setLineDash([]);
}

function drawSquares() {
    rawData.forEach(p => {
        const predY = predictY(p.x);
        const pixelX = mapX(p.x);
        const pixelY = mapY(p.y);
        const pixelPredY = mapY(predY);

        const sidePixels = Math.abs(pixelY - pixelPredY);

        ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
        ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        if (p.y > predY) {
            ctx.rect(pixelX, pixelY, sidePixels, sidePixels);
        } else {
            ctx.rect(pixelX, pixelY - sidePixels, sidePixels, sidePixels);
        }

        ctx.fill();
        ctx.stroke();
    });
}

function drawCentroid() {
    ctx.beginPath();
    ctx.arc(mapX(meanX), mapY(meanY), 8, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#b45309";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`(X̄, Ȳ)`, mapX(meanX) + 12, mapY(meanY) - 10);
}

function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes();

    // Set clip region so lines don't draw over the axes and paddings when wildly adjusted
    ctx.save();
    ctx.beginPath();
    ctx.rect(mapX(xMin), mapY(yMax), mapX(xMax) - mapX(xMin), mapY(yMin) - mapY(yMax));
    ctx.clip();

    if (currentStep >= 0) {
        drawPoints();
    }
    if (currentStep >= 1) {
        drawLine();
    }
    if (currentStep === 2) {
        drawResiduals();
    }
    if (currentStep === 3) {
        drawSquares();
        drawResiduals();
        drawPoints();
        drawLine();
    }
    if (currentStep === 4) {
        drawCentroid();
        drawPoints();
        drawLine();
    }

    ctx.restore(); // Restore context (removes clip)
}

// --- UI Logic ---
function generateIndicators() {
    stepIndicatorsContainer.innerHTML = '';
    steps.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `w-3 h-3 rounded-full transition-colors duration-300 ${index === currentStep ? 'bg-white' : 'bg-indigo-400'}`;
        stepIndicatorsContainer.appendChild(dot);
    });
}

function updateUI() {
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;

    if (currentStep === steps.length - 1) {
        nextBtn.innerHTML = "Finish &#10003;";
        nextBtn.classList.replace('bg-indigo-600', 'bg-emerald-600');
        nextBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-emerald-700');
    } else {
        nextBtn.innerHTML = "Next &rarr;";
        if (nextBtn.classList.contains('bg-emerald-600')) {
            nextBtn.classList.replace('bg-emerald-600', 'bg-indigo-600');
            nextBtn.classList.replace('hover:bg-emerald-700', 'hover:bg-indigo-700');
        }
    }

    counterSpan.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    canvasTitle.textContent = steps[currentStep].canvasTitle;

    contentDiv.style.opacity = 0;
    setTimeout(() => {
        contentDiv.innerHTML = steps[currentStep].content;
        contentDiv.style.opacity = 1;

        // Run step specific logic (like injecting slider event listeners)
        if (steps[currentStep].onRender) {
            steps[currentStep].onRender();
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([contentDiv]).catch((err) => console.log(err.message));
        }
    }, 150);

    generateIndicators();
    renderCanvas();
}

// Event Listeners
prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

// Initialize Application
window.addEventListener('load', () => {
    contentDiv.classList.add('step-transition');
    updateUI();

    setTimeout(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([contentDiv]);
        }
    }, 500);
});