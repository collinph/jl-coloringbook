"use strict";
/*
    Copyright 2025 Joseph Love, primoweb.com, joe@primoweb.com
    This component is free to use provided that this notice is not altered or removed.
    Donations are accepted to continue the development of more open source projects. Paypal address: joe@primoweb.com

*/
customElements.define('jl-coloringbook', class extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.dragging = false;
        this.paths = [];
        this.color = null; // Initialize color

        // Default colors
        this.paletteColors = [
            'rgba(87, 87, 87,0.8)',
            'rgba(220, 35, 35,0.8)',
            'rgba(42, 75, 215,0.8)',
            'rgba(29, 105, 20,0.8)',
            'rgba(129, 74, 25,0.8)',
            'rgba(129, 38, 192,0.8)',
            'rgba(160, 160, 160,0.8)',
            'rgba(129, 197, 122,0.8)',
            'rgba(157, 175, 255,0.8)',
            'rgba(41, 208, 208,0.8)',
            'rgba(255, 146, 51,0.8)',
            'rgba(255, 238, 51,0.8)',
            'rgba(233, 222, 187,0.8)',
            'rgba(255, 205, 243,0.8)',
            'white' // last color is eraser
        ];
    }

    // --- Lifecycle Callbacks ---
    connectedCallback() {
        // Ensure the component is displayed as a block
        this.style.display = 'block';

        const auto = this.getAttribute('autoinit');
        if (auto !== '0') {
            this.init();
        }
    }

    // --- Initialization & Setup ---
    init() {
        // Create a container for the slot elements
        this.slotsContainer = document.createElement('div');
        this.slotsContainer.classList.add('slots');
        this.slotsContainer.style.display = 'none';
        const slot = document.createElement('slot');
        this.slotsContainer.appendChild(slot);
        this.shadowRoot.appendChild(this.slotsContainer);

        // Listen for changes in the assigned slot elements
        slot.addEventListener('slotchange', this.drawTemplate.bind(this));
    }

    
   drawTemplate() {
        console.log('jl-coloringbook drawTemplate() called.'); // DEBUG 5

        // Prevent default click behavior on the custom element itself if desired
        this.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Add base styles
        const style = document.createElement('style');
        style.textContent = `
            /*icons*/
            @font-face {
              font-family: 'Material Icons';
              font-style: normal;
              font-weight: 400;
              src: url(https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf) format('truetype');
            }

            .material-icons {
              font-family: 'Material Icons';
              font-weight: normal;
              font-style: normal;
              font-size: 18px;
              line-height: 1;
              letter-spacing: normal;
              text-transform: none;
              display: inline-block;
              white-space: nowrap;
              word-wrap: normal;
              direction: ltr;
            }
            .wrapper { width:100%; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}

            /*default theme*/
            .imageNav img {
                box-sizing:border-box;
                border:3px solid transparent;
                width:12%; min-width:75px; max-width:150px;
                margin:4px;
                cursor: pointer; /* Add pointer cursor for clickable images */
            }
            .imageNav img.selected {
                border: 3px solid green;

            }
            .toolbar {
                z-index:100000;
                position: sticky;  position: -webkit-sticky;
                top: 0;
                background-color: rgba(200,200,200,.1)
            }
            .tools {
                display:flex;
                justify-content:flex-end;
                flex-wrap:wrap;
                max-width:100%;
            }
            .sizerTool {
                cursor:inherit;
                align-self:flex-start;
                width:64px;
            }
            .spacer {
                flex-basis:0;
                flex-grow:1;
            }
            .tools > * {margin:2px}
            .palette {
                display:inline-block;
            }
            .paletteColor {
                text-align:center;
                height:28px;
                width:28px;
                margin:2px;
                border-radius:50%;
                box-sizing:border-box;
                border:3px solid rgba(232,232,232,1);
                display:inline-block;
                overflow:hidden;
                cursor: pointer; /* Add pointer cursor for color selection */
            }
            .paletteColor.selected {
                border-color:black;
                transform: scale(1.2);
            }

            .paletteColor.eraser { border-color: red; background-image: linear-gradient(135deg,white 43%, red 45%, red 55%, white 57%, white)}


            .canvasWrapper {
                display:inline-block;
                position:relative;
                width:100%
            }
            .canvas {
                z-index:1000;
                position:absolute;
                top:0;left:0;
                width:100%;
            }
            .activeCanvas {
                z-index:1001;
                position:absolute;
                top:0;left:0;
                width:100%;
            }
            .canvasBackgroundImage{width:100%}

            .undoButton > i::after{ content: "undo"}
            .clearButton > i::after{ content: "clear"}
            .printButton > i::after{ content: "print"}
            .saveButton > i::after{ content: "save"}
        `;
        this.shadowRoot.appendChild(style);

        // Load external CSS if specified
        const cssAttr = this.getAttribute('css');
        if (cssAttr) {
            const link = document.createElement('link');
            link.href = cssAttr;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            this.shadowRoot.appendChild(link);
        }

        // --- THE FIX IS HERE ---
        // Create a container for the main content within the shadowRoot
        // This is the element on which we will call insertAdjacentHTML
        this.mainContentContainer = document.createElement('div');
        this.shadowRoot.appendChild(this.mainContentContainer); // Add it to the shadowRoot

        // Build the main HTML structure
        const maxBrushSize = this.getAttribute('maxbrushsize') || 32;
        const wrapperHTML = `
            <div class="wrapper">
                <div class="imageNav"></div>
                <div class="toolbar">
                    <div class="tools">
                        <input class="sizerTool input" type="range" min="1" max="${maxBrushSize}">
                        <div class="spacer"></div>
                        <button class="undoButton button"><i class="material-icons"></i></button>
                        <button class="clearButton button"><i class="material-icons"></i></button>
                        <button class="printButton button"><i class="material-icons"></i></button>
                        <button class="saveButton  button"><i class="material-icons"></i></button>
                    </div>
                    <div class="palette"></div>
                </div>
                <div class="canvasWrapper"></div>
            </div>
        `;
        // Now call insertAdjacentHTML on the new container, not directly on shadowRoot
        this.mainContentContainer.insertAdjacentHTML('beforeend', wrapperHTML);

        // Get references to key elements (these queries should still work fine as they target within mainContentContainer)
        this.sizer = this.shadowRoot.querySelector('.sizerTool');
        this.wrapper = this.shadowRoot.querySelector('.wrapper');
        this.imageNav = this.shadowRoot.querySelector('.imageNav');
        this.palette = this.shadowRoot.querySelector('.palette');
        this.canvasWrapper = this.shadowRoot.querySelector('.canvasWrapper');

        // Attach event listeners
        this.sizer.addEventListener('input', this.updateSize.bind(this));
        this.shadowRoot.querySelector('.undoButton').addEventListener('click', () => {
            this.paths.pop();
            this.refresh();
        });
        this.shadowRoot.querySelector('.clearButton').addEventListener('click', () => {
            this.paths = [];
            localStorage.setItem(`v2:${this.getAttribute('src')}`, JSON.stringify(this.paths));
            this.refresh();
        });
        this.shadowRoot.querySelector('.printButton').addEventListener('click', this.print.bind(this));
        this.shadowRoot.querySelector('.saveButton').addEventListener('click', this.save.bind(this));

        this.generatePalette();
        this.drawImageNav();
    }

   generatePalette() {
        let customPaletteColors = [];
        const slotElements = this.slotsContainer.querySelector('slot').assignedElements();

        for (const el of slotElements) {
            if (el.tagName === 'I') {
                const color = el.getAttribute('color');
                if (color) {
                    customPaletteColors.push(color);
                }
            }
        }
        if (customPaletteColors.length) {
            this.paletteColors = customPaletteColors;
        }

        this.palette.innerHTML = ''; // Clear existing palette
        let i = 0;
        for (const value of this.paletteColors) {
            const classesToAdd = ['paletteColor', `color${i}`]; // Always add these

            // Conditionally add the 'eraser' class
            if (i === (this.paletteColors.length - 1)) {
                classesToAdd.push("eraser");
            }

            const paletteColorDiv = document.createElement('div');
            // Use the spread operator to add all classes from the array
            paletteColorDiv.classList.add(...classesToAdd);
            paletteColorDiv.style.backgroundColor = value;
            paletteColorDiv.setAttribute('data-color-index', i);

            paletteColorDiv.addEventListener('click', (e) => {
                this.color = parseInt(e.currentTarget.getAttribute('data-color-index'), 10); // Added radix 10
                this.setCursor();
                // Remove 'selected' from all siblings and add to current
                this.palette.querySelectorAll('.paletteColor').forEach(pc => pc.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
            });
            this.palette.appendChild(paletteColorDiv);
            i++;
        }
    }

    drawImageNav() {
        this.images = [];
        const slotElements = this.slotsContainer.querySelector('slot').assignedElements();

        for (const el of slotElements) {
            if (el.tagName === 'IMG') {
                this.images.push(el.getAttribute('data-lazy-src') || el.getAttribute('src'));
            }
        }

        this.imageNav.innerHTML = ''; // Clear previous navigation
        let sel = 0;
        let i = 0;
        if (this.hasAttribute('randomize')) {
            sel = Math.floor(Math.random() * this.images.length);
        }

        if (this.images.length > 1) {
            for (const src of this.images) {
                const imgElement = document.createElement('img');
                imgElement.src = src;
                imgElement.classList.add('image');
                imgElement.addEventListener('click', (e) => {
                    this.selectImage(e.currentTarget);
                });
                this.imageNav.appendChild(imgElement);
                if (sel === i) {
                    this.selectImage(imgElement);
                }
                i++;
            }
        } else if (this.images.length === 1) {
            const imgElement = document.createElement('img');
            imgElement.src = this.images[0];
            this.selectImage(imgElement);
        }
    }

    selectImage(sourceImgElement) {
        this.src = sourceImgElement.src;
        this.img = document.createElement('img');
        this.img.classList.add('canvasBackgroundImage');
        this.img.src = this.src;

        // Remove 'selected' class from all images in imageNav and add to selected one
        this.imageNav.querySelectorAll('.image').forEach(img => img.classList.remove('selected'));
        sourceImgElement.classList.add('selected');

        this.drawCanvas();
    }

    drawCanvas() {
        // Clear previous canvas elements and append the new background image
        this.canvasWrapper.innerHTML = '';
        this.canvasWrapper.appendChild(this.img);

        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('canvas');
        this.canvasWrapper.appendChild(this.canvas);

        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.classList.add('activeCanvas');
        this.canvasWrapper.appendChild(this.activeCanvas);

        this.ctx = this.canvas.getContext('2d');
        this.activeCtx = this.activeCanvas.getContext('2d');

        this.img.onload = () => {
            this.sizeCanvas();
            const storedPaths = localStorage.getItem(`v2:${this.img.src}`);
            if (storedPaths) {
                try {
                    this.paths = JSON.parse(storedPaths);
                } catch (e) {
                    console.error("Error parsing stored paths, clearing data:", e);
                    this.paths = [];
                }
            } else {
                this.paths = [];
            }
            this.refresh();

            // Select the first color if none is selected
            if (this.color === null) {
                const firstColor = this.shadowRoot.querySelector('.paletteColor.color1');
                if (firstColor) {
                    firstColor.click(); // Programmatically click to select
                }
            }
        };

        // Ensure image load event fires if image is already cached
        if (this.img.complete && this.img.naturalHeight !== 0) {
            this.img.onload();
        }

        // Add mouse and touch event listeners to the active canvas
        this.activeCanvas.addEventListener('mousedown', this.mouseDown.bind(this));
        this.activeCanvas.addEventListener('mouseup', this.mouseUp.bind(this));
        this.activeCanvas.addEventListener('mousemove', this.mouseMove.bind(this));
        this.activeCanvas.addEventListener('touchstart', this.touchStart.bind(this), {
            passive: false
        }); // Use passive:false for preventDefault
        this.activeCanvas.addEventListener('touchend', this.touchEnd.bind(this));
        this.activeCanvas.addEventListener('touchmove', this.touchMove.bind(this), {
            passive: false
        }); // Use passive:false for preventDefault
    }

    // --- Event Handlers ---
    touchStart(oe) {
        const e = oe; // Original event is directly passed now
        const touch = e.touches[0];
        e.clientX = touch.clientX;
        e.clientY = touch.clientY;
        this.mouseDown(e);
    }

    touchEnd(oe) {
        const e = oe; // Original event is directly passed now
        this.mouseUp(e);
    }

    touchMove(oe) {
        const e = oe; // Original event is directly passed now
        if (e.touches.length >= 2) return true; // allow 2 finger gestures through
        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];
        e.clientX = touch.clientX;
        e.clientY = touch.clientY;
        this.mouseMove(e);
    }

    mouseDown(e) {
        const pos = this.getCursorPosition(e);
        this.dragging = true;
        pos.c = this.color;
        pos.s = this.sizer.value; // Use .value for input range
        this.paths.push([pos]);
        this.setCursor();
    }

    mouseUp(e) {
        this.commitActivePath();
        if (this.dragging) {
            localStorage.setItem(`v2:${this.getAttribute('src')}`, JSON.stringify(this.paths));
        }
        this.dragging = false;
    }

    mouseMove(e) {
        if (!this.dragging) return;
        const pos = this.getCursorPosition(e);
        this.paths[this.paths.length - 1].push(pos); // Append point to current path.
        this.drawActivePath();
    }

    updateSize() {
        this.setCursor();
    }

    // --- Utility Functions ---
    async print() {
        const dataUrl = await this.getImageData();

        let windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Print Your Creation</title></head>';
        windowContent += '<body>';
        windowContent += '<img src="' + dataUrl + '" style="width:100%">';
        windowContent += '</body>';
        windowContent += '</html>';

        const printWin = window.open('', '', 'width=' + screen.availWidth + ',height=' + screen.availHeight);
        printWin.document.open();
        printWin.document.write(windowContent);

        // Wait for content to load before printing
        printWin.document.addEventListener('load', function() {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();
        }, {
            once: true
        }); // Use once: true to automatically remove listener
    }

    loadImage(url) {
        return new Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            });
            image.src = url;
        });
    }

    async getImageData() {
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.height = height;
        combinedCanvas.width = width;
        const c = combinedCanvas.getContext('2d');

        // Draw the background image
        c.drawImage(this.img, 0, 0, width, height);

        // Draw the colored lines from the main canvas
        const coloringData = await this.loadImage(this.canvas.toDataURL('image/png'));
        c.drawImage(coloringData, 0, 0, width, height);

        return combinedCanvas.toDataURL('image/png');
    }

    async save() {
    try {
        const dataUrl = await this.getImageData(); // Get the combined image data URL

        // Convert the data URL to a Blob
        // This is more robust for programmatic downloads
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = "ColoringBook.png"; // Suggested filename

        // This approach typically works without needing to append to the DOM
        // if the link's click is simulated correctly.
        document.body.appendChild(downloadLink); // Temporarily append to body to ensure it's in the DOM
        downloadLink.click(); // Programmatically click the link

        // Clean up: revoke the object URL and remove the link element
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        console.log("Image saved successfully!");

    } catch (error) {
        console.error("Error saving image:", error);
        alert("Failed to save image. Please check the console for details.");
    }
}

    sizeCanvas() {
        // Recalculate canvas position and size based on the background image's natural dimensions
        this.canvasPos = this.canvas.getBoundingClientRect();
        this.canvas.height = this.img.naturalHeight;
        this.canvas.width = this.img.naturalWidth;
        this.activeCanvas.height = this.img.naturalHeight;
        this.activeCanvas.width = this.img.naturalWidth;
    }

    getCursorPosition(e) {
        // Ensure canvasPos is up-to-date for accurate calculations
        this.canvasPos = this.activeCanvas.getBoundingClientRect();
        const adjX = this.activeCanvas.width / this.canvasPos.width; // Adjustment for width scaling
        const adjY = this.activeCanvas.height / this.canvasPos.height; // Adjustment for height scaling

        return {
            x: (e.clientX - this.canvasPos.left) * adjX,
            y: (e.clientY - this.canvasPos.top) * adjY,
        };
    }

    commitActivePath() {
        this.drawActivePath(true);
    }

    clearActivePath() {
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        this.activeCtx.clearRect(0, 0, width, height);
    }

    drawActivePath(saveToCanvas = false) {
        this.clearActivePath();
        let ctx;
        const path = this.paths[this.paths.length - 1];

        if (!path || path.length < 1) return; // Guard against empty paths

        if (saveToCanvas === true || path[0].c === (this.paletteColors.length - 1)) {
            ctx = this.ctx; // Draw on main canvas for saving or eraser
        } else {
            ctx = this.activeCtx; // Draw on active canvas for temporary preview
        }

        if (path[0].c === null || path[0].c === undefined) {
            path[0].c = 0; // Default to first color if not set
        }

        ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Adjust line width based on image's natural size vs displayed size
        ctx.lineWidth = path[0].s * (this.img.naturalWidth / this.img.width);

        if (path[0].c === (this.paletteColors.length - 1)) {
            /*eraser*/
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = `white`; // Eraser uses white stroke but composite operation makes it clear
        } else {
            ctx.globalCompositeOperation = "source-over";
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let j = 1; j < path.length; ++j) {
            ctx.lineTo(path[j].x, path[j].y);
        }
        ctx.stroke();
    }

    refresh() {
        this.clearActivePath();
        const height = this.img.naturalHeight;
        const width = this.img.naturalWidth;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, width, height); // Clear the entire main canvas

        for (let i = 0; i < this.paths.length; ++i) {
            const path = this.paths[i];
            if (path.length < 1) continue;

            if (path[0].c === null || path[0].c === undefined) {
                path[0].c = 0; // Default to first color
            }

            ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = path[0].s * (this.img.naturalWidth / this.img.width);

            if (path[0].c === (this.paletteColors.length - 1)) {
                /* eraser*/
                ctx.globalCompositeOperation = "destination-out";
                ctx.strokeStyle = `white`;
            } else {
                ctx.globalCompositeOperation = "source-over";
            }

            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let j = 1; j < path.length; ++j) {
                ctx.lineTo(path[j].x, path[j].y);
            }
            ctx.stroke();
        }
    }

    setCursor() {
        const size = parseInt(this.sizer.value, 10);
        const effectiveSize = Math.max(2, Math.min(size, 32)); // Clamp size
        const canvas = document.createElement('canvas');
        canvas.height = 32;
        canvas.width = 32;
        const context = canvas.getContext('2d');

        context.beginPath();
        context.arc(16, 16, effectiveSize / 2, 0, 2 * Math.PI, false);
        context.fillStyle = this.paletteColors[this.color];
        context.fill();
        context.strokeStyle = 'black';
        context.lineWidth = 2; // Use lineWidth for strokeWidth
        context.stroke();

        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.lineWidth = 1; // Thinner for crosshairs
        context.beginPath();
        context.moveTo(0, 16);
        context.lineTo(32, 16);
        context.moveTo(16, 0);
        context.lineTo(16, 32);
        context.stroke();

        const url = canvas.toDataURL();
        this.wrapper.style.cursor = `url(${url}) 16 16, pointer`;
    }
});
