import { requestPixels, drawPixels, watchColourChange, rgbToHex } from "./common.js";

const canvas = document.getElementById('landing-canvas');
const ctx = canvas.getContext('2d');

const dogPhoto = document.getElementById('dog-photo')

const canvasCover = document.getElementById('landing-canvas-cover');

const paletteNodes = document.getElementsByClassName('colour-node-header');

let pixels, colourArr;

init();

async function init() {
    // draw dog, pixelate with block size 4 and 8 k colours

    ctx.drawImage(dogPhoto, 0, 0, dogPhoto.width, dogPhoto.height);
    const base64 = canvas.toDataURL();
    const [_, base64Str] = base64.split(',');

    const data = {
        block_size: 4,
        colour_cluster: 8,
        base64: base64Str
    };

    const response = await requestPixels(data);
    pixels = response.pixels;
    colourArr = response.colour_of_k;

    drawPixels(canvas, ctx, pixels, colourArr);
    canvasCover.classList.add('d-none');

    for (let i=0; i<Object.keys(colourArr).length; i++) {
        const [r,g,b,a] = colourArr[i];
        paletteNodes[i].style.backgroundColor = `rgba(${r},${g},${b},${a})`;
        paletteNodes[i].value = rgbToHex(r,g,b);

        paletteNodes[i].addEventListener("input", (e) => {
            watchColourChange(e, i, paletteNodes, colourArr, canvas, ctx, pixels);
        }, false);
    }

}
