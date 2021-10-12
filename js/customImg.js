import { requestPixels, drawPixels, watchColourChange, rgbToHex } from "./common.js";

const clientCanvas = document.getElementById('select-img-canvas');
const ctx = clientCanvas.getContext('2d');

const pixeledCanvas = document.getElementById('pixeled-canvas');
const pixeledCanvasCtx = pixeledCanvas.getContext('2d');

const colourInput = document.getElementById('colour-input');
const colourInputLabel = document.getElementById('colour-input-label');

const pixelInput = document.getElementById('pixel-input');
const pixelInputLabel = document.getElementById('pixel-input-label');

const selectImgBtn = document.getElementById('select-img-btn');
const selectImgInput = document.getElementById('select-img-input');

const saveImgBtn = document.getElementById('save-btn');

const pixelateImgBtn = document.getElementById('pixelate-img-btn');

const pixeledContainer = document.getElementById('pixeled-img-section');
const paletteContainer = document.getElementById('client-colour-mod-container');

const clientCanvasCover = document.getElementById('select-img-canvas-cover');

let pixels, colourArr;
let imageSelected = false;


saveImgBtn.addEventListener('click', () => {
    const canvasUrl = pixeledCanvas.toDataURL('png');
    const a = document.createElement('a');
    a.href = canvasUrl;
    a.download = 'pixelated.png';
    a.click();
})


pixelInput.addEventListener('input', () => {
    changeInput(pixelInput, pixelInputLabel);
}, false)

colourInput.addEventListener('input', () => {
    changeInput(colourInput, colourInputLabel);
}, false)

function changeInput(input, label) {
    const [text, _] = label.innerText.split(':')
    label.innerText = `${text}: ${input.value}`;
}


selectImgBtn.addEventListener('click', () => { selectImgInput.click(); });

selectImgInput.addEventListener('change', (e) => {
    // check file extension, draw photo to match default canvas width

    const fileTypes = e.target.accept;
    const img = e.target.files[0];

    const regexFileType = new RegExp(img.type, 'g');
    if (fileTypes.match(regexFileType) === null) { return; }

    const image = new Image();
    image.src = URL.createObjectURL(img);

    image.onload = () => {
        const wantedSize = clientCanvas.width;

        if (image.width > wantedSize || image.height > wantedSize) {

            const aspectRatioW = (image.width > image.height) ? 1 : image.width / image.height;
            const aspectRatioH = (image.width > image.height) ? image.height / image.width : 1;

            image.width = wantedSize * aspectRatioW;
            image.height = wantedSize * aspectRatioH;
        }

        clientCanvas.style.width = pixeledCanvas.style.width = image.width + 'px';
        clientCanvas.style.height = pixeledCanvas.style.height = image.height + 'px';

        ctx.drawImage(image, 0, 0, clientCanvas.width, clientCanvas.height);
    };

    imageSelected = true;
    clientCanvas.style.border = 'none';
})



pixelateImgBtn.addEventListener('click', async () => {
    if (!imageSelected) { return }

    clientCanvasCover.classList.remove('d-none');
    pixeledContainer.classList.remove('d-none');

    const base64 = clientCanvas.toDataURL();
    const [_, base64Str] = base64.split(',');

    const data = {
        block_size: parseInt(pixelInput.value),
        colour_cluster: parseInt(colourInput.value),
        base64: base64Str
    };

    const response = await requestPixels(data);
    pixels = response.pixels;
    colourArr = response.colour_of_k;

    drawPixels(pixeledCanvas, pixeledCanvasCtx, pixels, colourArr);
    clientCanvasCover.classList.add('d-none')

    pixeledContainer.scrollIntoView({behavior: 'smooth'});

    createPalette();
    pixeledCanvas.style.border = 'none';
})

function createPalette() {
    [...paletteContainer.children].forEach(elem =>elem.remove()); // in case client clicks multiple times

    let paletteNodes = [];

    for (let i=0; i<parseInt(colourInput.value); i++) {
        const div = document.createElement('div');
        ['col2', 'col-2', 'p-2'].forEach(c => div.classList.add(c));

        const input = document.createElement('input');
        input.type = 'color';

        const [r,g,b,a] = colourArr[i];
        input.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
        input.value = rgbToHex(r,g,b);

        paletteNodes.push(input);

        input.addEventListener('input', (e) => {
            watchColourChange(e, i, paletteNodes, colourArr, pixeledCanvas, pixeledCanvasCtx, pixels);
        }, false)

        div.appendChild(input);
        paletteContainer.appendChild(div);
    }
}
