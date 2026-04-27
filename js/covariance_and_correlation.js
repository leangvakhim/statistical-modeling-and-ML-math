// <!-- JavaScript integrated directly into the HTML -->
// --- Data & State ---
const steps = [
    {
        title: "1. Introduction to Relationships",
        desc: "In statistical modeling and machine learning, we often need to understand how two different variables interact. Do they move together? Does one go up while the other goes down? Or are they completely independent? <br><br> Measuring this relationship helps models make predictions (e.g., if X goes up, predict Y will go up).",
        example: "Imagine tracking the <b>Daily Temperature ($X$)</b> and <b>Ice Cream Sales ($Y$)</b>. As the temperature rises, ice cream sales generally rise too. This is a relationship we want to capture mathematically.",
        vizTitle: "Variables X and Y",
        setupViz: (ctx, width, height, controls) => {
            const points = generatePoints(0.8, 0.2, 50);
            drawScatter(ctx, width, height, points, "Temperature (X)", "Ice Cream Sales (Y)", "#3b82f6");
        }
    },
    {
        title: "2. Covariance: Finding the Direction",
        desc: "<b>Covariance</b> measures the <i>directional</i> relationship between two variables.<br><br>• <b>Positive Covariance:</b> Variables move in the same direction.<br>• <b>Negative Covariance:</b> Variables move in opposite directions.<br>• <b>Zero Covariance:</b> No clear linear pattern.",
        example: "<b>Positive:</b> Hours studied vs. Test score.<br><b>Negative:</b> Age of a car vs. Its resale value.<br><b>Zero:</b> The amount of rainfall vs. Number of typos in a book.",
        vizTitle: "Covariance Directions",
        setupViz: (ctx, width, height, controls) => {
            controls.innerHTML = `
                <button class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition" onclick="window.updateVizState(1)">Positive</button>
                <button class="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition" onclick="window.updateVizState(-1)">Negative</button>
                <button class="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition" onclick="window.updateVizState(0)">Zero</button>
            `;

            window.updateVizState = (trend) => {
                ctx.clearRect(0, 0, width, height);
                const points = generatePoints(trend, trend === 0 ? 1 : 0.3, 60);
                const color = trend > 0 ? "#22c55e" : (trend < 0 ? "#ef4444" : "#64748b");
                drawScatter(ctx, width, height, points, "Variable X", "Variable Y", color);

                if (trend !== 0) {
                    ctx.beginPath();
                    ctx.moveTo(width * 0.1, trend > 0 ? height * 0.9 : height * 0.1);
                    ctx.lineTo(width * 0.9, trend > 0 ? height * 0.1 : height * 0.9);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            };
            window.updateVizState(1);
        }
    },
    {
        title: "3. The Problem with Covariance",
        desc: "While covariance tells us the direction, its numerical value is hard to interpret because it is <b>scale-dependent</b> (sensitive to units). <br><br> If you multiply your data points by 100, the covariance number will skyrocket, even though the underlying relationship hasn't gotten any stronger. You cannot look at a covariance of $5000$ and assume it's a 'stronger' relationship than a covariance of $50$.",
        example: "Suppose you measure house sizes vs. house prices. If you record the size in <b>Square Meters</b>, you get a small covariance. If you record the exact same houses in <b>Square Centimeters</b>, the covariance number becomes massive. The relationship didn't change, only the ruler did!",
        vizTitle: "Scale Sensitivity",
        setupViz: (ctx, width, height, controls) => {
            controls.innerHTML = `
                <button class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition" onclick="window.updateScale(1)">Meters</button>
                <button class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition" onclick="window.updateScale(100)">Centimeters</button>
            `;

            const basePoints = generatePoints(0.8, 0.2, 30);

            window.updateScale = (multiplier) => {
                ctx.clearRect(0, 0, width, height);
                drawScatter(ctx, width, height, basePoints, "Size", "Price", "#a855f7", false);

                ctx.fillStyle = "#64748b";
                ctx.font = "12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(`Max: ${10 * multiplier}`, width - 20, height - 15);
                ctx.fillText(`Max: $${500 * multiplier}`, 40, 20);

                ctx.fillStyle = "#1e293b";
                ctx.font = "bold 16px sans-serif";
                ctx.fillText(`Calculated Covariance: ${(42 * multiplier * multiplier).toLocaleString()}`, width / 2, 30);
            };
            window.updateScale(1);
        }
    },
    {
        title: "4. Correlation: Standardized",
        desc: "<b>Correlation</b> (specifically Pearson's Correlation Coefficient, $r$) solves the scale problem. It takes the covariance and divides it by the standard deviations of X and Y.<br><br>This <i>standardizes</i> the metric, forcing the value to always fall strictly between <b>$-1$ and $1$</b>. Now, the number tells us both direction AND strength, regardless of units.",
        example: "<ul><li><b>$r = 1.0$:</b> Perfect positive correlation.</li><li><b>$r = -0.8$:</b> Strong negative correlation.</li><li><b>$r = 0.0$:</b> No linear correlation.</li></ul>",
        vizTitle: "Correlation Coefficient (r)",
        setupViz: (ctx, width, height, controls) => {
            controls.innerHTML = `
                <div class="flex flex-col items-center w-full px-4">
                    <label class="text-slate-600 mb-2">Adjust Correlation (r): <span id="r-val" class="font-bold">0.90</span></label>
                    <input type="range" min="-1" max="1" step="0.1" value="0.9" class="w-full cursor-pointer accent-blue-500" oninput="window.updateCorrelation(this.value)">
                </div>
            `;

            window.updateCorrelation = (r) => {
                document.getElementById('r-val').innerText = parseFloat(r).toFixed(2);
                ctx.clearRect(0, 0, width, height);

                const numericR = parseFloat(r);
                const variance = Math.max(0.05, 1 - Math.abs(numericR));
                const points = generatePoints(numericR, variance, 80);

                let color = "#3b82f6";
                if (numericR < -0.5) color = "#ef4444";
                if (Math.abs(numericR) <= 0.5) color = "#64748b";
                if (numericR > 0.5) color = "#22c55e";

                drawScatter(ctx, width, height, points, "X", "Y", color);
            };
            window.updateCorrelation(0.9);
        }
    },
    {
        title: "5. Recap & Formulas",
        desc: "Let's bring it all together. Covariance measures direction, and Correlation standardizes it to measure both direction and strength.<br><br>Here are the fundamental formulas used in statistical modeling to calculate these properties across a dataset.",
        example: "In Machine Learning, these formulas are heavily used in feature selection and algorithms like Principal Component Analysis (PCA) which relies on the Covariance Matrix.",
        vizTitle: "The Equations",
        setupViz: (ctx, width, height, controls) => {
            ctx.clearRect(0, 0, width, height);
            controls.innerHTML = "";

            const mathOverlay = document.getElementById('math-overlay');
            mathOverlay.classList.remove('hidden');

            mathOverlay.innerHTML = `
                <div class="w-full text-sm">
                    <h3 class="text-blue-600 font-bold mb-2 border-b border-slate-200 pb-1">1. Covariance (Population)</h3>
                    <div class="mb-4 overflow-x-auto overflow-y-hidden py-2">
                        $$\\sigma_{xy} = \\frac{1}{N} \\sum_{i=1}^{N} (x_i - \\mu_x)(y_i - \\mu_y)$$
                    </div>

                    <h3 class="text-blue-600 font-bold mb-2 border-b border-slate-200 pb-1">2. Covariance (Sample)</h3>
                    <div class="mb-4 overflow-x-auto overflow-y-hidden py-2">
                        $$s_{xy} = \\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\bar{x})(y_i - \\bar{y})$$
                    </div>

                    <h3 class="text-blue-600 font-bold mb-2 border-b border-slate-200 pb-1">3. Pearson Correlation ($r$)</h3>
                    <p class="text-slate-500 text-xs mb-1">Covariance divided by product of standard deviations.</p>
                    <div class="overflow-x-auto overflow-y-hidden py-2">
                        $$r = \\frac{s_{xy}}{s_x s_y} = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}$$
                    </div>
                </div>
            `;

            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([mathOverlay]).catch((err) => console.log('MathJax error:', err));
            }
        }
    }
];

let currentStep = 0;

// --- DOM Elements ---
const domTitle = document.getElementById('step-title');
const domDesc = document.getElementById('step-desc');
const domExample = document.getElementById('step-example');
const domStepNum = document.getElementById('current-step-num');
const domProgressDots = document.getElementById('progress-dots');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const contentArea = document.getElementById('content-area');

const canvas = document.getElementById('vizCanvas');
const ctx = canvas.getContext('2d');
const domVizTitle = document.getElementById('visual-title');
const domVizControls = document.getElementById('viz-controls');
const domMathOverlay = document.getElementById('math-overlay');

// --- Canvas Helpers ---
function resizeCanvas() {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    renderStep(currentStep, true);
}
window.addEventListener('resize', resizeCanvas);

function generatePoints(trend, variance, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        let x = 0.1 + Math.random() * 0.8;
        let y;

        if (trend === 0) {
            y = 0.1 + Math.random() * 0.8;
        } else {
            let baseLine = trend > 0 ? x : (1 - x);
            let noise = (Math.random() - 0.5) * variance * 2;
            y = baseLine + noise;
            y = Math.max(0.1, Math.min(0.9, y));
        }
        points.push({ x, y });
    }
    return points;
}

function drawScatter(ctx, width, height, points, xLabel, yLabel, color, drawAxes = true) {
    const padding = 40;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    if (drawAxes) {
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2 * window.devicePixelRatio;
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = `${12 * window.devicePixelRatio}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(xLabel, width / 2, height - padding / 3);

        ctx.save();
        ctx.translate(padding / 3, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
    }

    ctx.fillStyle = color;
    points.forEach(p => {
        const px = padding + p.x * plotW;
        const py = (height - padding) - p.y * plotH;
        ctx.beginPath();
        ctx.arc(px, py, 4 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
    });
}

// --- Core Logic ---
function init() {
    for (let i = 0; i < steps.length; i++) {
        const dot = document.createElement('div');
        dot.className = `w-2.5 h-2.5 rounded-full transition-colors ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`;
        dot.id = `dot-${i}`;
        domProgressDots.appendChild(dot);
    }

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;

    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
        window.MathJax.startup.promise.then(() => {
            renderStep(0);
        }).catch(() => {
            renderStep(0);
        });
    } else {
        setTimeout(() => renderStep(0), 100);
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            triggerTransition();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            triggerTransition();
        }
    });
}

function triggerTransition() {
    contentArea.classList.remove('fade-enter-active');
    setTimeout(() => {
        renderStep(currentStep);
        contentArea.classList.add('fade-enter');
        requestAnimationFrame(() => {
            contentArea.classList.add('fade-enter-active');
        });
    }, 50);
}

function renderStep(index, isResize = false) {
    const step = steps[index];

    if (!isResize) {
        domTitle.innerHTML = step.title;
        domDesc.innerHTML = step.desc;
        domExample.innerHTML = step.example;
        domStepNum.innerText = index + 1;
        domVizTitle.innerText = step.vizTitle;

        for (let i = 0; i < steps.length; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (i === index) {
                dot.className = 'w-2.5 h-2.5 rounded-full transition-colors bg-blue-500';
            } else if (i < index) {
                dot.className = 'w-2.5 h-2.5 rounded-full transition-colors bg-blue-300';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full transition-colors bg-slate-200';
            }
        }

        btnPrev.disabled = index === 0;
        if (index === steps.length - 1) {
            btnNext.disabled = true;
            btnNext.innerHTML = "Finish &#10003;";
        } else {
            btnNext.disabled = false;
            btnNext.innerHTML = "Next Step &rarr;";
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([domDesc, domExample]).catch((err) => console.log(err));
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (index !== steps.length - 1) {
        domMathOverlay.classList.add('hidden');
    }

    step.setupViz(ctx, canvas.width, canvas.height, domVizControls);
}

window.addEventListener('DOMContentLoaded', init);