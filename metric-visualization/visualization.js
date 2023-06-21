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

    let sliderTruth;
    let sliderPredP;
    let sliderPredN;

    sketch.setup = () => {
        sketch.createCanvas(w, h);

        sliderTruth = sketch.createSlider(0, 1000, 500);
        sliderTruth.position(20, 20);
        sliderPredN = sketch.createSlider(0, 1000, 500);
        sliderPredN.position(20, 50);
        sliderPredP = sketch.createSlider(0, 1000, 500);
        sliderPredP.position(20, 80);

        sketch.frameRate(30);
        sketch.noFill();
        sketch.stroke('black');
    }

    const labelSlider = (slider, text) => {
        sketch.fill('black');
        sketch.noStroke();
        sketch.text(text, slider.x * 2 + slider.width, slider.y + 15);
    }

    let noiseOffset = 0;
    sketch.draw = () => {
        sketch.background('white')

        labelSlider(sliderTruth, 'Labeled positive rate')
        labelSlider(sliderPredP, 'Rate of correct predictions for positive labels')
        labelSlider(sliderPredN, 'Rate of correct predictions for negative labels')

        const labelPos = n * (sliderTruth.value() / 1000)
        const truePos = labelPos * (sliderPredP.value() / 1000)

        const labelNeg = n * (1 - sliderTruth.value() / 1000)
        const falseNeg = labelNeg * (1 -sliderPredN.value() / 1000)
        console.log(truePos, falseNeg);

        sketch.fill(colorPos + '33');
        sketch.circle(w/2 - w/5, h/2, (radius + entityDist) * 2);
        drawEntities(w/2 - w/5, h/2, labelPos, truePos);
        sketch.fill(colorNeg + '33');
        sketch.circle(w/2 + w/5, h/2, (radius + entityDist) * 2);
        drawEntities(w/2 + w/5, h/2, labelNeg, falseNeg);
        noiseOffset += noiseSpeed;
    }
}, 'canvas');
