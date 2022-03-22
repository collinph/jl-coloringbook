"use strict";
/*
    Copyright 2020 Joseph Love, primoweb.com, joe@primoweb.com
    This component is free to use provided that this notice is not altered or removed.
    Donations are accepted to continue the development of more open source projects. Paypal address: joe@primoweb.com

*/
customElements.define('jl-coloringbook', class extends HTMLElement 
{
    constructor() 
    {
        super();
        this.shadow = this.attachShadow({mode: 'open'}); 
        this.loadIcons();
    }

    init()
    {
        jQuery(this).css('display','block');
        //default colors
        this.paletteColors=[
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
                'white']; // last color is eraser
        this.dragging=false;
        this.paths = [];
        let me=this;
        this.slots=jQuery(`<div class="slots" style="display:none"><slot></slot></div>`).appendTo(this.shadowRoot)
    

        this.slots.off('slotchange').on('slotchange', function()
        {
            me.drawTemplate()
        });
    }

    connectedCallback()
    {
        let auto =jQuery(this).attr('autoinit');

        if (auto!=='0')
        {
            this.init();
        } 
    
    }

    loadIcons()
    {
        //load Material Icons.
        try
        {
            let material = new FontFace('Material Icons', 'url(https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNZ.ttf)');
            material.load().then(function(loaded_face) {
                document.fonts.add(loaded_face);
            }).catch(function(error) {
                // error occurred
            });
        } 
        catch(err)
        {

        }
    }

    
    drawTemplate()
    {
        jQuery(this).on('click', function(e) {e.preventDefault; e.stopPropagation()})
        jQuery(
        `
       
            <style>
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
            </style>`).appendTo(this.shadowRoot);
            if (jQuery(this).attr('css')) {
                jQuery(`<link href="${jQuery(this).attr('css')}" rel="stylesheet" type="text/css" />`).appendTo(this.shadowRoot);
            }       
            
            jQuery(`
            <div class="wrapper">
                <div class="imageNav"></div>
                <div class="toolbar">
                    <div class="tools">
                        <input class="sizerTool input" type="range" min="1" max="${jQuery(this).attr('maxbrushsize') || 32}">
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
        `).appendTo(this.shadowRoot);
        this.sizer=jQuery('.sizerTool',this.shadowRoot);
        this.wrapper=jQuery('.wrapper',this.shadowRoot);
        this.generatePalette();
        this.drawImageNav(); 
        let me = this;
        jQuery('.sizerTool',this.shadowRoot).on('input', function(){me.updateSize()});
        jQuery(`.undoButton`,this.shadowRoot).on('click', function(){me.paths.pop(); me.refresh();});
        jQuery(`.clearButton`,this.shadowRoot).on('click', function(){me.paths=[];localStorage.setItem('v2:'+jQuery(me).attr('src'),JSON.stringify(me.paths));me.refresh();});
        jQuery(`.printButton`,this.shadowRoot).on('click', function() {me.print()});
        jQuery(`.saveButton`,this.shadowRoot).on('click', function() {me.save()});
    
    }

    generatePalette()
    {
        let paletteColors=[];
        let list= jQuery('slot',this.slots)[0].assignedElements();
        
        for (const x of list)
        {
            if (x.tagName=='I')
            {
                paletteColors.push(jQuery(x).attr('color'));
            }
        }
        if (paletteColors.length) this.paletteColors=paletteColors;
      
        let palette=jQuery(`.palette`,this.shadowRoot);
        let i=0;
        let className='';
        for (let value of this.paletteColors)
        {
            className='';
            if (i==(this.paletteColors.length-1)) className="eraser";
            let me=this;

            jQuery(`<div class="paletteColor ${className}  color${i}" style="background-color:${value};"><i class="material-icons"></i></div>`).data('color',i)
                .on('click',function(){
                me.color=jQuery(this).data('color');
                me.setCursor();
                jQuery(this).parent().children().removeClass('selected');
                jQuery(this).addClass('selected');
            }).appendTo(palette);
             i++;
        }


    }

    drawImageNav()
    {

        this.images=[];
        let list= jQuery('slot',this.slots)[0].assignedElements();
        for (const x of list)
        {
            if (x.tagName=='IMG')
            {
                this.images.push(jQuery(x).attr('data-lazy-src')||jQuery(x).attr('src'));
            }
        }
        let me = this;
        let imageNav=jQuery('.imageNav',this.shadowRoot);
        jQuery(imageNav).empty();
        //imageNav=jQuery(`<div style="max-width:100%">`);
        let sel=0;
        let i=0;
        if (jQuery(this).attr('randomize')) sel = Math.floor(Math.random()*this.images.length);
        if (this.images.length > 1)
        {
            for(const src of this.images)
            {
                let x= jQuery(`<img src="${src}">`).addClass('image').appendTo(imageNav)
                .on('click', function(){
                    me.selectImage(this);
                });
                if (sel==i) this.selectImage(x);
            i++;
            }
        } else this.selectImage(jQuery(`<img src="${this.images[0]}" />`));
    }


    selectImage(sourceImg)
    {
        this.src=jQuery(sourceImg).attr('src');
        this.img=jQuery(`<img class="canvasBackgroundImage" src="${this.src}">`)
        jQuery(sourceImg).siblings().removeClass('selected')
        jQuery(sourceImg).addClass('selected');
        this.drawCanvas();
    }

    drawCanvas()
    {
        let me =this;
        //jQuery(this.wrapper).detach();
        //this.img=jQuery(jQuery(this.slots)[0]);
        jQuery(this).attr('src',this.img.attr('src'));
        let canvasWrapper=jQuery('.canvasWrapper',this.shadowRoot).empty().append(this.img);
        this.canvas=jQuery(`<canvas class="canvas"/>`).appendTo(canvasWrapper);
        this.activeCanvas=jQuery(`<canvas class="activeCanvas"/>`).appendTo(canvasWrapper);
        
        this.ctx=this.canvas[0].getContext('2d');
        this.activeCtx=this.activeCanvas[0].getContext('2d');
        //jQuery(img).replaceWith(this.wrapper);
        this.img.off('load').on('load', function() {
            me.sizeCanvas();
            let x = window.localStorage.getItem('v2:'+jQuery(this).attr('src'));
            if (x){
                me.paths=JSON.parse(x);
                me.refresh();
            } else
            {
                me.paths=[];
                me.refresh();
            }

            if (!me.color)
            {
                jQuery('.paletteColor.color1',me.shadowRoot).trigger('click');
            }
            //alert('yo');
        });
        
        this.activeCanvas.on('mousedown', function(e) {me.mouseDown(e);})
            .on('mouseup', function(e) {me.mouseUp(e);})
            .on('mousemove', function(e) {me.mouseMove(e);})
            .on('touchstart', function(e) {return me.touchStart(e);})
            .on('touchend', function(e) {return me.touchEnd(e);})
            .on('touchmove', function(e) {return me.touchMove(e);})

    }

    touchStart(oe)
    {   
        let e= oe.originalEvent;
        
        let touch = e.touches[0];
        e.clientX=touch.clientX;
        e.clientY=touch.clientY;
        this.mouseDown(e)

    }
    touchEnd(oe)
    {

        let e=oe.originalEvent;
        this.mouseUp(e);

    }
    touchMove(oe)
    {   
        let e= oe.originalEvent;
        if (e.touches.length >=2) return true; // allow 2 finger gestures through
        e.preventDefault();
        e.stopPropagation();
        
        let touch = e.touches[0];

        e.clientX=touch.clientX;
        e.clientY=touch.clientY;
        this.mouseMove(e)
    }


    async print()
    {
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

        printWin.document.addEventListener('load', function() {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();            
        }, true);

    }

    loadImage(url) {
        return new  Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            });
            image.src = url; 
        });
    }
    async getImageData()
    {
        let height=this.img[0].naturalHeight;
        let width=this.img[0].naturalWidth
        let cv=jQuery(`<canvas height="${height}" width="${width}" />`)[0];
        let c = cv.getContext('2d');
        c.drawImage(this.img[0],0,0,width,height);
        let i= await this.loadImage(this.canvas[0].toDataURL('image/png'));
        c.drawImage(i,0,0);
        return cv.toDataURL('image/png');
    }

    async save()
    {
        let link=await this.getImageData();

        let x =jQuery(`<a download="ColoringBook.png">Download</a>`).attr('href',link).appendTo(this.wrapper)
        x[0].click();
        x.remove();

    }

    sizeCanvas()
    {
        this.canvasPos = this.canvas[0].getBoundingClientRect();
        this.canvas.attr('height',this.img[0].naturalHeight);
        this.canvas.attr('width',this.img[0].naturalWidth);
        this.activeCanvas.attr('height',this.img[0].naturalHeight);
        this.activeCanvas.attr('width',this.img[0].naturalWidth);
    }

    getCursorPosition(e) 
    {
        this.canvasPos = this.canvas[0].getBoundingClientRect();
        let adj=this.canvas.attr('width')/this.canvas.width();
        return {
            x: (e.clientX - this.canvasPos.left)*adj,
            y: (e.clientY - this.canvasPos.top)*adj,
        };
    }   

    mouseDown(e)
    {
        let pos = this.getCursorPosition(e);               
        this.dragging = true;
        pos.c=this.color;
        pos.s=this.sizer.val();
        this.paths.push([pos]);
        this.setCursor();
    }

    mouseUp(e) 
    {
        this.commitActivePath();
        if (this.dragging) localStorage.setItem('v2:'+jQuery(this).attr('src'),JSON.stringify(this.paths));
        this.dragging = false;
    }

    mouseMove(e)
    {
        let pos;
         if (!this.dragging) return;

        pos = this.getCursorPosition(e);
        this.paths[this.paths.length-1].push(pos); // Append point tu current path.
        this.drawActivePath();
    }

    commitActivePath()
    {
        this.drawActivePath(true);
    }

    clearActivePath()
    {
        let height=this.img[0].naturalHeight;
        let width=this.img[0].naturalWidth;
        let ctx=this.activeCtx;
        ctx.clearRect(0, 0, width, height);
    }


    drawActivePath(saveToCanvas=false)
    {

        this.clearActivePath();
        let ctx;
        let path=this.paths[this.paths.length-1];
        if (saveToCanvas==true || path[0].c==(this.paletteColors.length-1)) {ctx=this.ctx;} 
            else {ctx=this.activeCtx;}

        if (!path[0].c) {  path[0].c=0;}
            ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = path[0].s * (this.img[0].naturalWidth/this.img.width());
            if (path[0].c==(this.paletteColors.length-1)) 
            {
                /*eraser*/
                ctx.globalCompositeOperation="destination-out";
                ctx.strokeStyle = `white`;
            } else  ctx.globalCompositeOperation="source-over";
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let j=1; j<path.length; ++j)
                ctx.lineTo(path[j].x, path[j].y);
            ctx.stroke();
    }

    refresh()
    {   
        this.clearActivePath()
        let height=this.img[0].naturalHeight;
        let width=this.img[0].naturalWidth;
        let ctx=this.ctx;
        ctx.clearRect(0, 0, width, height);
        for (let i=0; i<this.paths.length; ++i) {
            let path = this.paths[i];
            if (path.length<1) continue;
            if (!path[0].c) { path[0].c=0;}
            ctx.strokeStyle = `${this.paletteColors[path[0].c]}`;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = path[0].s * (this.img[0].naturalWidth/this.img.width());
            if (path[0].c==(this.paletteColors.length-1)) 
            {
                /* eraser*/
                ctx.globalCompositeOperation="destination-out";
                ctx.strokeStyle = `white`;
            }
            else ctx.globalCompositeOperation="source-over";
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let j=1; j<path.length; ++j)
                ctx.lineTo(path[j].x, path[j].y);
            ctx.stroke();
        }
    }
   
    updateSize()
    {
        this.setCursor();
    }

    setCursor()
    {
        let size = this.sizer.val();
        if (size < 2) size=2;
        if (size > 32) size=32;
        let canvas=jQuery(`<canvas height="32" width="32"/>`);
        let context = canvas[0].getContext('2d');

        context.beginPath();
        context.arc(16, 16, size/2, 0, 2 * Math.PI, false);
        context.fillStyle = this.paletteColors[this.color];
        context.fill();
        context.strokeStyle='black'
        context.strokeWidth=2;
        context.stroke();
        context.strokeStyle='rgba(0, 0, 0, 0.5)';
        context.strokeWidth=2;
        context.beginPath();
        context.moveTo(0,16)
        context.lineTo(32,16)
        context.moveTo(16,0)
        context.lineTo(16,32)
        context.stroke();
        let url=canvas[0].toDataURL();
        this.wrapper.css('cursor', `url(${url}) 16 16, pointer`);
    }
});
