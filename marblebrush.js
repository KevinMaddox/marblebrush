'use strict';
if ((eval("var __temp = null"), (typeof __temp === "undefined")))
    console.log('Notice: Strict mode is enabled.');

class Marblebrush {
    TOOLS;        // The tools available for use.
    STATES;       // The possible states that a tool can be in.
    
    canvasElem;   // The HTML element of the canvas.
    canvas;       // The context of the canvas, for actual image operations.
    
    mouse;        // Contains info for mouse's positions & left-click state.
    
    currentEvent; // Used for getting mouse position at any time.
    
    tool;         // The active tool in use.
    state;        // The state of the active tool.
    
    constructor() {
        this.TOOLS = {
            PENCIL:   'pencil',
            BUCKET:   'bucket',
            POLYGON: 'polygon'
        };
        
        this.STATES = {
            READY:    0,
            BEGIN:    1,
            ACTIVE:   2,
            INACTIVE: 3,
            DONE:     4
        };
        
        // TODO: Redo "properly?"
        let container = document.getElementById('marblebrush');
        container.innerHTML +=
            '<div id="marblebrush-titlebar">Marblebrush v0.3</div>'
          + '<hr>'
          + '<canvas id="marblebrush-canvas" width="320" height="240"></canvas>'
          + '<hr>'
          + '<div id="marblebrush-toolbar">'
          +     '<div class="marblebrush-tool" style="background-image:url(\'res/tool-icon/pencil.png\')" data-name="pencil"></div>'
          +     '<div class="marblebrush-tool" style="background-image:url(\'res/tool-icon/disk.png\'  )" data-name="bucket"></div>'
          + '</div>'
        ;
        
        this.canvasElem = document.getElementById('marblebrush-canvas');
        if (!this.canvasElem || this.canvasElem.nodeName !== 'CANVAS')
            return;
        this.canvas  = this.canvasElem.getContext('2d');
        
        this.mouse = {
            clicked: false,
            isDown:  false,
            isUp:    false,
            lastX:       0,
            lastY:       0,
            x:           0,
            y:           0
        };
        
        this.switchTool(this.TOOLS.PENCIL);
        this.state = this.STATES.READY;
    }
    
    handleMouse(event) {
        this.currentEvent = event;
        
        switch (event.type) {
            case 'mousedown':
                if (event.button !== 0)
                    return;
                
                this.mouse.clicked = true;
                this.mouse.isDown = true;
                this.mouse.x  = this.getX();
                this.mouse.y  = this.getY();
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                
                if (this.state === this.STATES.READY)
                    this.state = this.STATES.BEGIN;
                
                this.processTool();
                
                this.mouse.clicked = false;
                break;
            case 'mousemove':
                this.mouse.x  = this.getX();
                this.mouse.y  = this.getY();
                if (this.mouse.isDown)
                    this.processTool();
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                break;
            case 'mouseup':
                if (event.button !== 0)
                    return;
                this.mouse.isDown = false;
                break;
        }
    }
    
    processTool() {
        switch (this.tool) {
            case this.TOOLS.PENCIL:
                this.drawLine();
                break;
        }
    }
    
    getX() {
        return this.currentEvent.x - this.canvasElem.getBoundingClientRect().left;
    }

    getY() {
        return this.currentEvent.y - this.canvasElem.getBoundingClientRect().top;
    }
    
    switchTool(tool) {
        // If tool is in the midst of operations, then we demand it finishes
        // what it's doing and cleans itself up.
        if (this.state !== this.STATES.READY) {
            this.state = this.STATES.DONE;
            this.processTool();
        }
        
        this.tool = tool;
        switch (tool) {
            case this.TOOLS.PENCIL:
                
                break;
            case this.TOOLS.BUCKET:
                
                break;
        }
        
        // Set cursor icon.
        this.canvasElem.style.cursor = 'url("res/cursor/' + tool + '.png"), auto';
    }
    
    drawLine() {
        this.canvas.strokeStyle = '#df4b26';
        this.canvas.lineJoin = 'round';
        this.canvas.lineWidth = 1;
        
        this.canvas.beginPath();
        
        this.canvas.moveTo(this.mouse.lastX, this.mouse.lastY);
        this.canvas.lineTo(this.mouse.x , this.mouse.y);
        
        this.canvas.closePath();
        this.canvas.stroke();
    }
    
    render() {
        
    }
}

let marblebrush = new Marblebrush();

// - Add event handlers for canvas interaction. --------------------------------
marblebrush.canvasElem.addEventListener('mousedown', function(event) {
    marblebrush.handleMouse(event);
});

document.addEventListener('mousemove', function(event) {
    marblebrush.handleMouse(event);
});

document.addEventListener('mouseup', function(event) {
    marblebrush.handleMouse(event);
});


// - Add event handlers to the tool buttons. -----------------------------------
let tools = document.getElementsByClassName('marblebrush-tool');
for (let i = 0; i < tools.length; i++) {
    tools[i].addEventListener('click', function(event) {
        marblebrush.switchTool(this.dataset.name);
    });
}
