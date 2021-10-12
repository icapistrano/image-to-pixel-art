async function requestPixels(data) {
    const url = 'https://pfft9x63fc.execute-api.eu-west-2.amazonaws.com/default/python_pixelator';

    const options = {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(data)
    }

    const response = await fetch(url, options);
    return response.json();
}

function drawPixels(canvas, ctx, pixels, colourArr) {
    const ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = ctxData.data;

    const step = 4;
    for (let i = 0; i < pixels.length; i++) {
        const k = pixels[i];
        const [r,g,b,a] = colourArr[k];

        const pixel = (i * step) - 1;

        data[pixel] = a;
        data[pixel + 1] = r;
        data[pixel + 2] = g;
        data[pixel + 3] = b;
    }

    ctx.putImageData(ctxData, 0, 0);
}

function watchColourChange(event, i, paletteNodes, colourArr, canvas, ctx, pixels) {
    const hex =  event.target.value
    paletteNodes[i].style.backgroundColor = hex;
    const {r,g,b} = hexToRgb(hex);
    colourArr[i] = [r,g,b,255];
    drawPixels(canvas, ctx, pixels, colourArr);
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}


export {
    requestPixels,
    drawPixels,
    watchColourChange,
    rgbToHex,
    hexToRgb
}