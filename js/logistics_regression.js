// <!-- Application Logic -->
// Data for Visualization
// X = Hours Studied, Y = Pass (1) or Fail (0)
const dataPoints = [
    { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
    { x: 4.5, y: 1 }, { x: 5, y: 0 }, { x: 6, y: 1 }, { x: 7, y: 1 },
    { x: 8, y: 1 }, { x: 9, y: 1 }, { x: 10, y: 1 }
];

// Step Content Definition
const steps = [
    {
        title: "1. The Binary Problem",
        scenario: "Predicting if a student will Pass (1) or Fail (0) their final exam based on the number of hours they studied.",
        description: `
            <p>In Machine Learning, we often face <strong>Classification</strong> problems. Instead of predicting a continuous number (like house prices), we need to categorize things.</p>
            <p>The simplest form is <strong>Binary Classification</strong>, where there are only two possible outcomes: True/False, Yes/No, or 1/0.</p>
            <p>Look at the graph on the left. The X-axis represents <strong>Hours Studied</strong>, and the Y-axis represents the outcome: <strong>$0$ (Fail)</strong> or <strong>$1$ (Pass)</strong>. Notice how the points only exist on the top line or the bottom line.</p>
        `,
        render: (ctx, w, h) => {
            drawAxes(ctx, w, h);
            drawPoints(ctx, w, h);
        }
    },
    {
        title: "2. Why Linear Regression Fails",
        scenario: "Trying to fit a straight line to predict the probability of passing.",
        description: `
            <p>You might think, "Let's just use regular Linear Regression!" Let's draw the line of best fit through these points (the red dashed line).</p>
            <p>But there's a huge problem. Probabilities must be between $0$ and $1$ (or 0% to 100%).</p>
            <p>If a student studies 12 hours, the straight line might predict a passing value of $1.5$ ($150\\%$ chance). If they study 0 hours, it predicts a negative probability. <strong>A straight line simply doesn't make mathematical sense for bounded categories.</strong></p>
            <p>Also, Linear Regression is highly sensitive to outliers. If someone studied 50 hours and passed, it would heavily tilt the line, ruining predictions for average students.</p>
        `,
        render: (ctx, w, h) => {
            drawAxes(ctx, w, h);
            drawPoints(ctx, w, h);
            drawLinearLine(ctx, w, h);
        }
    },
    {
        title: "3. The Magic of the Sigmoid Function",
        scenario: "Using a special mathematical curve to \"squish\" predictions between 0 and 1.",
        description: `
            <p>To fix the straight line, Logistic Regression introduces the <strong>Sigmoid Function</strong> (the smooth blue S-curve). It acts as an activation function.</p>
            <p>No matter how large or small the input number is, the Sigmoid function will always output a decimal between $0$ and $1$.</p>
            <p>Formula for the Sigmoid function:
            $$ \\sigma(z) = \\frac{1}{1 + e^{-z}} $$
            </p>
            <p>Instead of predicting the raw output directly, we pass our linear equation $z = wx + b$ through this Sigmoid curve. Now, our model outputs a <strong>valid probability</strong> of passing.</p>
        `,
        render: (ctx, w, h) => {
            drawAxes(ctx, w, h);
            drawPoints(ctx, w, h);
            drawSigmoid(ctx, w, h);
        }
    },
    {
        title: "4. Making a Decision (The Boundary)",
        scenario: "Translating a probability (e.g., 75%) into a hard Pass/Fail prediction.",
        description: `
            <p>The model now gives us probabilities. E.g., "Studying 6 hours gives a $65\\%$ chance of passing." But the student needs a definitive answer: Pass or Fail?</p>
            <p>We establish a <strong>Decision Boundary</strong> (Threshold). Usually, this is set at $0.5$ ($50\\%$).</p>
            <ul class="list-disc pl-5">
                <li>If probability $\\ge 0.5$, predict <strong>$1$ (Pass)</strong>.</li>
                <li>If probability $< 0.5$, predict <strong>$0$ (Fail)</strong>.</li>
            </ul>
            <p>On the graph, the green dashed lines show where the $0.5$ probability hits the curve. For our data, studying roughly <strong>$5.2$ hours</strong> is the dividing line between predicting a Fail and predicting a Pass.</p>
        `,
        render: (ctx, w, h) => {
            drawAxes(ctx, w, h);
            drawPoints(ctx, w, h);
            drawSigmoid(ctx, w, h);
            drawDecisionBoundary(ctx, w, h);
        }
    },
    {
        title: "5. Mathematical Recap",
        scenario: "Bringing it all together: The formulas that power Logistic Regression under the hood.",
        description: `
            <p>Let's formally recap the math that makes this visualization possible.</p>

            <h4 class="font-bold text-slate-800 mt-4 border-b border-slate-200 pb-1">1. The Linear Model</h4>
            <p>First, we calculate a linear combination of inputs ($x$), weights ($w$), and bias ($b$):
            $$ z = w \\cdot x + b $$
            </p>

            <h4 class="font-bold text-slate-800 mt-4 border-b border-slate-200 pb-1">2. The Sigmoid Prediction</h4>
            <p>We convert $z$ into a probability $\\hat{y}$ (between 0 and 1):
            $$ \\hat{y} = \\frac{1}{1 + e^{-z}} $$
            </p>

            <h4 class="font-bold text-slate-800 mt-4 border-b border-slate-200 pb-1">3. The Cost Function (Log-Loss)</h4>
            <p>To train the model, we measure error using Binary Cross-Entropy (Log-Loss), penalizing confident wrong answers heavily:
            $$ J(w,b) = -\\frac{1}{m} \\sum_{i=1}^{m} \\left[ y^{(i)} \\log(\\hat{y}^{(i)}) + (1 - y^{(i)}) \\log(1 - \\hat{y}^{(i)}) \\right] $$
            </p>
            <p class="text-sm text-slate-500 italic mt-2">Here, $y$ is the actual label (0 or 1), $\\hat{y}$ is the predicted probability, and $m$ is the number of samples.</p>
        `,
        render: (ctx, w, h) => {
            // Draw a clean final state
            drawAxes(ctx, w, h);
            drawPoints(ctx, w, h, true); // fade points slightly
            drawSigmoid(ctx, w, h);
            drawDecisionBoundary(ctx, w, h);
        }
    }
];

let currentStep = 0;

// DOM Elements
const textContainer = document.getElementById('text-container');
const titleEl = document.getElementById('step-title');
const scenarioEl = document.getElementById('step-scenario');
const descEl = document.getElementById('step-description');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const stepCounter = document.getElementById('step-counter');
const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d', { alpha: false });

// --- Canvas Drawing Utilities ---

// Map data coordinates to canvas pixels
// X ranges from 0 to 12. Y ranges from -0.3 to 1.3 to leave padding
const minX = 0, maxX = 12;
const minY = -0.3, maxY = 1.3;

function mapX(x, width) {
    return ((x - minX) / (maxX - minX)) * width;
}

function mapY(y, height) {
    // Invert Y axis for canvas (0 is top)
    return height - (((y - minY) / (maxY - minY)) * height);
}

function resizeCanvas() {
    // Keep high resolution for sharp rendering on retina displays
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    renderCanvas();
}

function drawAxes(ctx, w, h) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#94a3b8'; // slate-400

    // X Axis (y=0)
    const y0 = mapY(0, h);
    ctx.beginPath();
    ctx.moveTo(mapX(minX, w), y0);
    ctx.lineTo(mapX(maxX, w), y0);
    ctx.stroke();

    // X Axis Labels
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 1; i <= 11; i += 2) {
        ctx.fillText(i + "h", mapX(i, w), y0 + 18);
        // Tick mark
        ctx.beginPath();
        ctx.moveTo(mapX(i, w), y0 - 3);
        ctx.lineTo(mapX(i, w), y0 + 3);
        ctx.stroke();
    }
    ctx.fillText("Hours", mapX(maxX - 0.5, w), y0 - 10);

    // Y Axis limits (y=1)
    const y1 = mapY(1, h);
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mapX(minX, w), y1);
    ctx.lineTo(mapX(maxX, w), y1);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y Axis Labels
    ctx.textAlign = 'right';
    ctx.fillText("1 (Pass)", mapX(11.5, w), y1 - 10);
    ctx.fillText("0 (Fail)", mapX(11.5, w), y0 + 35);
}

function drawPoints(ctx, w, h, faded = false) {
    const radius = 6;
    dataPoints.forEach(pt => {
        const cx = mapX(pt.x, w);
        const cy = mapY(pt.y, h);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);

        if (pt.y === 1) {
            ctx.fillStyle = faded ? 'rgba(34, 197, 94, 0.3)' : '#22c55e'; // green-500
            ctx.strokeStyle = faded ? 'rgba(21, 128, 61, 0.3)' : '#15803d'; // green-700
        } else {
            ctx.fillStyle = faded ? 'rgba(239, 68, 68, 0.3)' : '#ef4444'; // red-500
            ctx.strokeStyle = faded ? 'rgba(185, 28, 28, 0.3)' : '#b91c1c'; // red-700
        }

        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawLinearLine(ctx, w, h) {
    // Approximate bad linear fit: y = 0.15x - 0.2
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    // Point 1 (x=0)
    const x1 = 0;
    const y1 = 0.15 * x1 - 0.2;
    ctx.moveTo(mapX(x1, w), mapY(y1, h));

    // Point 2 (x=12)
    const x2 = 12;
    const y2 = 0.15 * x2 - 0.2;
    ctx.lineTo(mapX(x2, w), mapY(y2, h));

    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Highlight error zones
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    // Above 1 area
    const crossY1X = (1 + 0.2) / 0.15; // x=8
    if (crossY1X < maxX) {
        ctx.fillRect(mapX(crossY1X, w), mapY(maxY, h), mapX(maxX, w) - mapX(crossY1X, w), mapY(1, h) - mapY(maxY, h));
    }
    // Below 0 area
    const crossY0X = (0 + 0.2) / 0.15; // x=1.33
    if (crossY0X > minX) {
        ctx.fillRect(mapX(minX, w), mapY(0, h), mapX(crossY0X, w) - mapX(minX, w), mapY(minY, h) - mapY(0, h));
    }
}

function drawSigmoid(ctx, w, h) {
    // Sigmoid: 1 / (1 + exp(-w(x - b)))
    // Adjusted parameters to fit our data beautifully: w=1.5, b=5.2 (decision boundary approx 5.2h)
    const weight = 1.5;
    const bias = 5.2;

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 4;

    for (let x = minX; x <= maxX; x += 0.1) {
        const z = weight * (x - bias);
        const y = 1 / (1 + Math.exp(-z));

        const px = mapX(x, w);
        const py = mapY(y, h);

        if (x === minX) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
}

function drawDecisionBoundary(ctx, w, h) {
    const boundaryX = 5.2;
    const boundaryY = 0.5;

    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    // Horizontal line to curve
    ctx.beginPath();
    ctx.moveTo(mapX(minX, w), mapY(boundaryY, h));
    ctx.lineTo(mapX(boundaryX, w), mapY(boundaryY, h));
    ctx.stroke();

    // Vertical line to axis
    ctx.beginPath();
    ctx.moveTo(mapX(boundaryX, w), mapY(boundaryY, h));
    ctx.lineTo(mapX(boundaryX, w), mapY(0, h));
    ctx.stroke();

    ctx.setLineDash([]); // reset

    // Annotations
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("Threshold (0.5)", mapX(minX + 0.2, w), mapY(boundaryY, h) - 8);

    ctx.textAlign = 'center';
    ctx.fillText("Boundary: ~5.2h", mapX(boundaryX + 1.5, w), mapY(0.2, h));

    // Mark intersection
    ctx.beginPath();
    ctx.arc(mapX(boundaryX, w), mapY(boundaryY, h), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
}

function renderCanvas() {
    const w = canvas.parentElement.getBoundingClientRect().width;
    const h = canvas.parentElement.getBoundingClientRect().height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    steps[currentStep].render(ctx, w, h);
}

// --- Application State Management ---

function updateUI() {
    const step = steps[currentStep];

    // Fade out effect
    textContainer.style.opacity = '0';

    setTimeout(() => {
        // Update Text
        titleEl.textContent = step.title;
        scenarioEl.textContent = step.scenario;
        descEl.innerHTML = step.description;

        // Trigger MathJax typesetting for injected HTML
        if (window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([descEl]).catch((err) => console.error(err.message));
        }

        // Fade back in
        textContainer.style.opacity = '1';
    }, 150); // Matches CSS transition duration roughly

    // Update Progress Dots
    for (let i = 0; i < steps.length; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (i <= currentStep) {
            dot.classList.remove('bg-indigo-300');
            dot.classList.add('bg-white');
        } else {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-indigo-300');
        }
    }

    // Update Navigation
    stepCounter.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    btnPrev.disabled = currentStep === 0;
    btnNext.disabled = currentStep === steps.length - 1;

    if (currentStep === steps.length - 1) {
        btnNext.classList.replace('bg-indigo-600', 'bg-emerald-600');
        btnNext.classList.replace('hover:bg-indigo-700', 'hover:bg-emerald-700');
        btnNext.textContent = "Finish ✓";
    } else {
        btnNext.classList.replace('bg-emerald-600', 'bg-indigo-600');
        btnNext.classList.replace('hover:bg-emerald-700', 'hover:bg-indigo-700');
        btnNext.innerHTML = "Next &rarr;";
    }

    // Update Canvas
    renderCanvas();
}

// Event Listeners
btnNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateUI();
    }
});

btnPrev.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
});

window.addEventListener('resize', resizeCanvas);

// Initialization
window.addEventListener('load', () => {
    // First MathJax render setup
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().then(() => {
            resizeCanvas();
            updateUI();
        });
    } else {
        resizeCanvas();
        updateUI();
    }
});