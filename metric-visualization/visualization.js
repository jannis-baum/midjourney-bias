new p5((sketch) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const radius = Math.min(w, h) / 4;
    const orbits = 10;
    const entityDist = radius/orbits;
    const entitySize = 15;

    const noiseScalar = 15;
    const noiseSpeed = 0.05

    let sliderFDR;
    let sliderFNR;
    let sliderFOR;
    let sliderFPR;

    const probs = () => {
        FDR = sliderFDR.value() / 1000;
        FNR = sliderFNR.value() / 1000;
        FOR = sliderFOR.value() / 1000;
        FPR = sliderFPR.value() / 1000;
        py_hat = (FPR * FNR - FPR * FOR) / (FNR * FDR - FPR * FOR);
        py = (FOR * (FDR - FPR)) / (FNR * FDR - FOR * FPR)
        return [py_hat, py];
    }

    sketch.setup = () => {
        sketch.createCanvas(w, h);

        console.log('sliders')
        sliderFDR = sketch.createSlider(1, 1000, 500);
        sliderFDR.position(20, 20);
        sliderFOR = sketch.createSlider(1, 1000, 500);
        sliderFOR.position(20, 50);
        sliderFPR = sketch.createSlider(1, 1000, 500);
        sliderFPR.position(20, 80);
        sliderFNR = sketch.createSlider(1, 1000, 500);
        sliderFNR.position(20, 110);

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
        labelSlider(sliderFDR, 'False Discovery Rate: P(label = 0 given prediction = 1)')
        labelSlider(sliderFNR, 'False Negative Rate: P(prediction = 0 given label = 1)')
        labelSlider(sliderFOR, 'False Omission Rate: P(label = 1 given prediction = 0)')
        labelSlider(sliderFPR, 'False Positive Rate: P(prediction = 1 given label = 0)')
        console.log(probs())
        for (let r = 0; r <= radius; r += entityDist) {
            step = Math.PI * 2 / Math.floor(Math.PI * 2 * r / entityDist)
            for (let theta = 0; theta + step/2 < Math.PI * 2; theta += step) {
                sketch.circle(
                    Math.sin(theta) * r + w/2 + sketch.noise(noiseOffset - theta + r) * noiseScalar,
                    Math.cos(theta) * r + h/2 + sketch.noise(noiseOffset + theta + r) * noiseScalar,
                    entitySize
                );
            }
        }
        noiseOffset += noiseSpeed;
    }
}, 'canvas');
