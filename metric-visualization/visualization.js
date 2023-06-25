// -----------------------------------------------------------------------------
// initial parameters from query -----------------------------------------------

const urlParams = new URLSearchParams(window.location.search);
document.getElementById('sliderTruth').value = urlParams.get('t') ?? 500;
document.getElementById('sliderPredP').value = urlParams.get('p') ?? 1000;
document.getElementById('sliderPredN').value = urlParams.get('n') ?? 1000;

// -----------------------------------------------------------------------------
// metrics & population based on sliders ---------------------------------------

let labelPos, labelNeg;
let truePos, falsePos;
let FDR, FOR, FPR, FNR;
let n = 0;

function updateValues() {
    const truth = document.getElementById('sliderTruth').value / 1000;
    const predP = document.getElementById('sliderPredP').value / 1000;
    const predN = document.getElementById('sliderPredN').value / 1000;

    labelPos = n * truth;
    labelNeg = n - labelPos;
    truePos = labelPos * predP;
    falsePos = labelNeg * (1 - predN);

    const falseNeg = labelPos - truePos;
    const trueNeg = labelNeg - falsePos;
    const predPos = falsePos + truePos;
    const predNeg = falseNeg + trueNeg;

    FDR = falsePos / predPos;
    FOR = falseNeg / predNeg;
    FPR = falsePos / labelNeg;
    FNR = falseNeg / labelPos;
}

const colorPos = '#a8d2e7';
const colorNeg = '#ff8880';

// -----------------------------------------------------------------------------
// population sketch -----------------------------------------------------------

new p5((sketch) => {
    let w, h;

    let radius, orbits, entityDist, entitySize;
    let xPos, yPos, xNeg, yNeg;

    const spacer = 15;
    const noiseScalar = 15;
    const noiseSpeed = 0.05

    const entityOffsets = (callback) => {
        let i = 0;
        for (let r = 0; r <= radius - entityDist; r += entityDist) {
            step = Math.PI * 2 / Math.floor(Math.PI * 2 * r / entityDist)
            for (let theta = 0; theta + step/2 < Math.PI * 2; theta += step) {
                i++;
                callback(r, theta, i);
            }
        }
    }

    const drawEntities = (x, y, maxCount, posCount) => {
        sketch.noStroke();
        entityOffsets((r, theta, i) => {
            if (i >= maxCount) return;
            sketch.fill(i >= posCount ? colorNeg : colorPos);
            sketch.circle(
                Math.sin(theta) * r + x + (sketch.noise(noiseOffset - theta + r) - 0.5) * noiseScalar,
                Math.cos(theta) * r + y + (sketch.noise(noiseOffset + theta + r) - 0.5) * noiseScalar,
                entitySize
            );
        });
    }

    sketch.setup = () => {
        div = document.getElementById('canvas-population');

        w = div.offsetWidth;
        h = div.offsetHeight;
        radius = (w - spacer) / 4
        orbits = 10;
        entityDist = radius/orbits;
        entitySize = entityDist * 0.75;
        xPos = radius;
        yPos = h/2;
        xNeg = spacer + 3*radius;
        yNeg = yPos;
        entityOffsets(() => n += 1);

        updateValues();

        sketch.createCanvas(w, h);
        sketch.frameRate(30);
        sketch.noStroke();
    }

    let noiseOffset = 0;
    sketch.draw = () => {
        sketch.background('white');

        sketch.fill(colorPos + '33');
        sketch.circle(xPos, yPos, radius * 2);
        drawEntities(xPos, yPos, labelPos, truePos);

        sketch.fill(colorNeg + '33');
        sketch.circle(xNeg, yNeg, radius * 2);
        drawEntities(xNeg, yNeg, labelNeg, falsePos);

        noiseOffset += noiseSpeed;
    }
}, 'canvas-population');

// -----------------------------------------------------------------------------
// bars for metrics ------------------------------------------------------------

const barSketch = (sketch, color, value, parent) => {
    let w, h;

    sketch.setup = () => {
        p = document.getElementById(parent);
        w = p.offsetWidth;
        h = p.offsetHeight;
        console.log(w, h)

        sketch.createCanvas(w, h);
        sketch.frameRate(30);
        sketch.stroke('white');
    }

    sketch.draw = () => {
        sketch.background('#444');
        sketch.noFill();
        sketch.rect(0, 0, w, h)
        sketch.fill(color);
        sketch.rect(0, 0, w * value(), h)
    }
}

new p5((sketch) => barSketch(sketch, colorPos, () => FDR, 'canvas-bar-fdr'), 'canvas-bar-fdr');
new p5((sketch) => barSketch(sketch, colorNeg, () => FOR, 'canvas-bar-for'), 'canvas-bar-for');
new p5((sketch) => barSketch(sketch, colorPos, () => FPR, 'canvas-bar-fpr'), 'canvas-bar-fpr');
new p5((sketch) => barSketch(sketch, colorNeg, () => FNR, 'canvas-bar-fnr'), 'canvas-bar-fnr');
