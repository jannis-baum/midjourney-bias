new p5((sketch) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const radius = Math.min(w, h) / 4;
    const orbits = 10;
    const entityDist = radius/orbits;
    const entitySize = 15;
    
    const noiseScalar = 15;
    const noiseSpeed = 0.05

    const colorPos = '#a8d2e7';
    const colorNeg = '#ff8880';
    const colorBar = '#fcde71'
    
    const spacer = 15;

    const entityLocations = (callback) => {
        let i = 0;
        for (let r = 0; r <= radius; r += entityDist) {
            step = Math.PI * 2 / Math.floor(Math.PI * 2 * r / entityDist)
            for (let theta = 0; theta + step/2 < Math.PI * 2; theta += step) {
                i++;
                callback(r, theta, i);
            }
        }
    }
    let n = 0;
    entityLocations(() => n += 1);

    const drawEntities = (x, y, maxCount, posCount) => {
        sketch.noStroke();
        entityLocations((r, theta, i) => {
            if (i >= maxCount) return;
            sketch.fill(i >= posCount ? colorNeg : colorPos);
            sketch.circle(
                Math.sin(theta) * r + x + (sketch.noise(noiseOffset - theta + r) - 0.5) * noiseScalar,
                Math.cos(theta) * r + y + (sketch.noise(noiseOffset + theta + r) - 0.5) * noiseScalar,
                entitySize
            );
        });
    }

    const drawBar = (x, y, w, h, fill, label) => {
        sketch.noStroke();
        sketch.fill(colorBar);
        sketch.rect(x, y + h * (1 - fill), w, h * fill);
        sketch.stroke('black');
        sketch.noFill();
        sketch.rect(x, y, w, h);
        sketch.textAlign(sketch.CENTER);
        sketch.text(label, x, y + h + spacer, w);
    }

    let sliderTruth;
    let sliderPredP;
    let sliderPredN;

    sketch.setup = () => {
        sketch.createCanvas(w, h);

        sliderTruth = sketch.createSlider(1, 1000, 500);
        sliderTruth.position(spacer, spacer);
        sliderPredN = sketch.createSlider(1, 1000, 1000);
        sliderPredN.position(spacer, spacer * 3);
        sliderPredP = sketch.createSlider(1, 1000, 1000);
        sliderPredP.position(spacer, spacer * 5);

        sketch.frameRate(30);
    }

    const labelSlider = (slider, text) => {
        sketch.fill('black');
        sketch.noStroke();
        sketch.textAlign(sketch.LEFT);
        sketch.text(text, slider.width + spacer * 2, slider.y + spacer);
    }

    let noiseOffset = 0;
    sketch.draw = () => {
        sketch.background('white')

        labelSlider(sliderTruth, 'Labeled positive rate')
        labelSlider(sliderPredP, 'Rate of correct predictions for positive labels')
        labelSlider(sliderPredN, 'Rate of correct predictions for negative labels')

        const labelPos = n * (sliderTruth.value() / 1000);
        const truePos = labelPos * (sliderPredP.value() / 1000);
        const falseNeg = labelPos - truePos;

        const labelNeg = n * (1 - sliderTruth.value() / 1000);
        const falsePos = labelNeg * (1 -sliderPredN.value() / 1000);
        const trueNeg = labelNeg - falsePos;

        const predPos = falsePos + truePos;
        const predNeg = falseNeg + trueNeg;

        const FDR = falsePos / predPos;
        const FOR = falseNeg / predNeg;
        const FPR = falsePos / labelNeg;
        const FNR = falseNeg / labelPos;

        drawBar(spacer, 200, 100, 200, FDR, 'False Discovery Rate');
        drawBar(100 + 2 * spacer, 200, 100, 200, FOR, 'False Omission Rate');
        drawBar(200 + 3 * spacer, 200, 100, 200, FPR, 'False Positive Rate');
        drawBar(300 + 4 * spacer, 200, 100, 200, FNR, 'False Negative Rate');

        sketch.noStroke();
        sketch.fill(colorPos + '33');
        sketch.circle(w/2 - w/5, h/2, (radius + entityDist) * 2);
        drawEntities(w/2 - w/5, h/2, labelPos, truePos);
        sketch.fill(colorNeg + '33');
        sketch.circle(w/2 + w/5, h/2, (radius + entityDist) * 2);
        drawEntities(w/2 + w/5, h/2, labelNeg, falsePos);
        noiseOffset += noiseSpeed;
    }
}, 'canvas');
