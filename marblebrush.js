/**
 *  _  _ ___ ___  ___  _   ___ ___  ___  _ _ ___  _   _
 * | \/ | _ | _ || _ || | | __| _ || _ || | | __|| |_| |
 * | .. |   |   \| _ \| |_| _|| _ \|   \| | |__ \|  _  |
 * |_||_|_|_|_|\_|___/|___|___|___/|_|\_|___|___/|_| |_|
 *
 *
 * MarbleBrush
 * JavaScript painting/drawing application
 *
 * Wally Chantek, 2020
 * https://github.com/wallychantek/marblebrush
 *
**/


'use strict';
if ((eval("var __temp = null"), (typeof __temp === "undefined")))
    console.log('Notice: Strict mode is enabled.');

class _mbLayeredCanvas {
    _elem;
    _layers;
    _activeLayer;
    _checkerboard;
    _width;
    _height;
    
    constructor(canvasDivId, width, height) {
        this._width = width;
        this._height = height;
        
        this._checkerboard = new Image();
        this._checkerboard.src = 'res/ui/transparent-bg.png';
        
        this._layers = [];
        // Create background layer and initial layer.
        this._elem = document.getElementById(canvasDivId);
        
        this.addLayer();
        this.addLayer();
        
        this._activeLayer = 1;
        
        this.setSize(this._width, this._height);
    }
    
    setSize(w, h) {
        this._width = w;
        this._height = h;
        
        this._elem.style.width = `${w}px`;
        this._elem.style.height = `${h}px`;
        
        for (const layer of this._layers) {
            layer.elem.width = w;
            layer.elem.height = h;
        }
        
        this._checkerboard.onload = function() {
            let pattern = this._layers[0].ctx.createPattern(this._checkerboard, 'repeat');
            this._layers[0].ctx.fillStyle = pattern;
            this._layers[0].ctx.fillRect(0, 0, w, h);
        }.bind(this);
        
    }
    
    addLayer() {
        let newLayer = document.createElement('canvas');
        newLayer.width = this._width;
        newLayer.height = this._height;
        this._layers.push({
            'elem': newLayer,
            'ctx': newLayer.getContext('2d'),
            'name': 'New Layer'
        });
        this._elem.appendChild(newLayer);
    }
    
    removeLayer(layerId) {
        
    }
    
    setActiveLayer(layerId) {
        this._activeLayer = layerId;
    }
    
    clearLayer(layerId, color = 'RGBA(0, 0, 0, 0)') {
        this._layers[layerId].ctx.fillStyle = color;
        this._layers[this._activeLayer].ctx.fillRect(0, 0, this._width, this._height);
    }
    
    drawLine(x1, y1, x2, y2) {
        /* Some dude's implementation */
        var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
        if (steep){
            var x = x1;
            x1 = y1;
            y1 = x;

            var y = y2;
            y2 = x2;
            x2 = y;
        }
        if (x1 > x2) {
            var x = x1;
            x1 = x2;
            x2 = x;

            var y = y1;
            y1 = y2;
            y2 = y;
        }

        var dx = x2 - x1,
            dy = Math.abs(y2 - y1),
            error = 0,
            de = dy / dx,
            yStep = -1,
            y = y1;
        
        if (y1 < y2) {
            yStep = 1;
        }
        
        this._layers[this._activeLayer].ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (var x = x1; x < x2; x++) {
            if (!steep) {
                this._layers[this._activeLayer].ctx.fillRect(x, y, 2, 2);
            } else {
                this._layers[this._activeLayer].ctx.fillRect(y, x, 2, 2);
            }
            
            error += de;
            if (error >= 0.5) {
                y += yStep;
                error -= 1.0;
            }
        }
        
        
        
        
        
        
        /* My original implementation */
        // this.canvas.fillStyle = '#000000';
        // let dx = this.mouse.x - this.mouse.lastX;
        // let dy = this.mouse.y - this.mouse.lastY;
        // let steps = 0;
        // if (Math.abs(dx) > Math.abs(dy))
            // steps = Math.abs(dx);
        // else
            // steps = Math.abs(dy);
        
        // let incrementX = dx / steps;
        // let incrementY = dy / steps;
        
        // let x = this.mouse.lastX;
        // let y = this.mouse.lastY;
        
        // for (let v = 0; v < steps; v++)
        // {
            // x = x + incrementX;
            // y = y + incrementY;
            // this.canvas.fillRect(Math.round(x), Math.round(y), 2, 2);
        // }
        
        /* Drawing start & end points */
        // this._layers[this._activeLayer].ctx.fillStyle = 'rgba(1, 0, 0, 1)';
        // if (!steep) {
            // this._layers[this._activeLayer].ctx.fillRect(x1, y1, 2, 2);
            // this._layers[this._activeLayer].ctx.fillRect(x2, y2, 2, 2);
        // }
        // else {
            // this._layers[this._activeLayer].ctx.fillRect(y1, x1, 2, 2);
            // this._layers[this._activeLayer].ctx.fillRect(y2, x2, 2, 2);
        // }
        
        
    }
    
    clearCanvas() {
        // this._layers[this._activeLayer].ctx.fillStyle = 'white';
        // this._layers[this._activeLayer].ctx.fillRect(0, 0,
            // this._layers[this._activeLayer].elem.width, this._layers[this._activeLayer].elem.height);
    }
}

class MarbleBrush {
    APP;            // General-use data pertaining to the app.
    TOOLS;          // The tools available for use.
    STATES;         // The possible states that a tool can be in.
    TOOL_FUNCTIONS; // The processing function names for each specific tool.
    
    app;            // State information pertaining to the app.
    mouse;          // Contains info for mouse's positions & left-click state.
    
    canvas;         // The context of the canvas, for actual image operations.
    elems;
    
    constructor(options = {}) {
        // - Initialize constants. ---------------------------------------------
        this.APP = {
            VERSION: '0.3',
            PATH: {
                ICON:   'res/tool-icon/',
                CURSOR: 'res/cursor/'
            }
        };
        
        this.TOOLS = {
            PENCIL: 'Pencil',
            BUCKET: 'Bucket',
            SAVE:   'Save'
        };
        
        let TOOL_BUTTON_NAMES = [
            'Pencil',
            'Bucket',
            'Save'
        ];
        
        this.STATES = {
            READY:    0,
            ACTIVE:   1,
            DONE:     2
        };
        
        this.TOOL_FUNCTIONS = {};
        for (const [key, toolName] of Object.entries(this.TOOLS))
            this.TOOL_FUNCTIONS[toolName] = 'process' + toolName;
        
        // - Validate configuration options. -----------------------------------
        if (typeof options !== 'object') {
            this.report(
                'Warning',
                'Configuration options must be passed in as an object.'
            );
            options = {};
        }
        
        let validOptions = {
            'name': ['string' , `MarbleBrush v${this.APP.VERSION}`]
        };
        
        // Perform validation.
        for (const key in options) {
            // Ensure key is allowed.
            if (!validOptions.hasOwnProperty(key)) {
                this.report('Warning', `Invalid option "${key}".`);
                continue;
            }
            
            // Ensure value is of a valid type.
            if (typeof options[key] !== validOptions[key][0]) {
                this.report(
                    'Warning',
                    `Invalid value for option "${key}". `
                  + `Value must be of type "${validOptions[key][0]}" `
                  + `but was of type "${(typeof options[key])}". `
                  + `Defaulting value to "${validOptions[key][1]}".`
                );
                options[key] = validOptions[key][1];
            }
        }
        
        // Set default values for unspecified options.
        for (const key in validOptions) {
            if (!options.hasOwnProperty(key))
                options[key] = validOptions[key][1];
        }
        
        // - Initialize variables. ---------------------------------------------
        this.app = {
            isBeingGrabbed: false,
            grabOffsetX:    0,
            grabOffsetY:    0,
            tool: '',
            toolState: 0,
            layer: '',
            layers: {
                'layerID_1aj': 'bmpData',
                'layerID_dka': 'bmpData', // Example data set up
                'layerID_eeq': 'bmpData'
            },
            history: [
                {'layerID_1aj': 'bmpData', 'layerID_dka': 'bmpData'}
            ],
        };
        
        this.mouse = {
            wasPressed:   false,
            wasReleased:  false,
            isHeld:       false,
            isOverCanvas: false,
            lastX:        0,
            lastY:        0,
            x:            0,
            y:            0,
            lastActiveX:  0,
            lastActiveY:  0
        };
        
        this.elems = {};
        
        // - Inject app container into page and get canvas context. ------------
        let container = document.getElementById('marblebrush');
        if (!container) {
            this.report(
                'Error',
                'Could not locate <div> with ID "marblebrush". '
              + 'Did you add it to the page content?'
            );
            return;
        }
        
        let containerHTML = 
            `<div id="marblebrush-title-bar">${options.name}</div>`
          + '<div id="marblebrush-canvas-container">'
          + '<div id="marblebrush-canvas"></div>'
          + '</div>'
          + '<hr>'
          + '<div id="marblebrush-toolbar"></div>'
          + '<div id="marblebrush-statusbar">'
          +     '<div id="marblebrush-statusbar-msg"></div>'
          +     '<div>&nbsp;</div>'
          +     '<div id="marblebrush-statusbar-mouse-pos"></div>'
          + '</div>'
        ;
        
        container.innerHTML = containerHTML;
        
        this.canvas = new _mbLayeredCanvas('marblebrush-canvas', 640, 480);
        this.canvas.clearLayer(1, '#ffffff');
        this.canvas.addLayer();
        this.canvas.setActiveLayer(2);
        
        let toolbarHTML = '';
        for (const t of TOOL_BUTTON_NAMES ) {
            toolbarHTML +=
                '<div '
              + 'class="marblebrush-tool" '
              + 'style="'
              +     `background-image:url(\'${this.APP.PATH.ICON}${t}.png\')`
              + '" '
              + `data-name="${t}"`
              + '></div>'
            ;
        }
        
        document.getElementById('marblebrush-toolbar').innerHTML = toolbarHTML;

        this.elems.marbleBrush = document.getElementById(
            'marblebrush'
        );
        this.elems.titleBar = document.getElementById(
            'marblebrush-title-bar'
        );
        this.elems.canvasContainer = document.getElementById(
            'marblebrush-canvas-container'
        );
        this.elems.canvas = document.getElementById(
            'marblebrush-canvas'
        );
        this.elems.mousePosition = document.getElementById(
            'marblebrush-statusbar-mouse-pos'
        );
        this.elems.statusMsg = document.getElementById(
            'marblebrush-statusbar-msg'
        );
        
        // - Set up event listeners. -------------------------------------------
        this.elems.titleBar.addEventListener('mousedown', function() {
            if (event.button === 0) {
                let rect = this.elems.marbleBrush.getBoundingClientRect();
                this.grabOffsetX = event.x - rect.left;
                this.grabOffsetY = event.y - rect.top;
                this.isBeingGrabbed = true;
            }
        }.bind(this));
        
        this.elems.canvas.addEventListener('mousedown', function() {
            this.handleMouse(event);
        }.bind(this));
        
        document.addEventListener('mousemove', function() {
            if (this.isBeingGrabbed) {
                this.elems.marbleBrush.style.left =
                    Math.max(event.x - this.grabOffsetX, 0) + 'px';
                this.elems.marbleBrush.style.top =
                    Math.max(event.y - this.grabOffsetY, 0) + 'px';
            }
            else
                this.handleMouse(event);
        }.bind(this));
        
        document.addEventListener('mouseup', function() {
            if (this.isBeingGrabbed)
                this.isBeingGrabbed = false;
            else
                this.handleMouse(event);
        }.bind(this));
        
        this.elems.canvas.addEventListener('mouseover', function() {
            this.mouse.isOverCanvas = true;
        }.bind(this));
        
        this.elems.canvas.addEventListener('mouseout', function() {
            this.mouse.isOverCanvas = false;
        }.bind(this));
        
        let tools = document.getElementsByClassName('marblebrush-tool');
        for (let i = 0; i < tools.length; i++) {
            tools[i].addEventListener('click', function() {
                this.switchTool(tools[i].dataset.name);
            }.bind(this));
            
            tools[i].addEventListener('mouseover', function() {
                this.elems.statusMsg.innerHTML = tools[i].dataset.name;
            }.bind(this));
            
            tools[i].addEventListener('mouseout', function() {
                this.elems.statusMsg.innerHTML = '';
            }.bind(this));
        }
        
        // - Finish up initialization. -----------------------------------------
        this.canvas.clearCanvas();
        this.app.toolState = this.STATES.READY;
        this.switchTool(this.TOOLS.PENCIL);
    }
    
    handleMouse(event) {
        this.mouse.x = event.x - this.elems.canvas.getBoundingClientRect().left;
        this.mouse.y = event.y - this.elems.canvas.getBoundingClientRect().top;
        
        switch (event.type) {
            case 'mousedown':
                if (event.button !== 0)
                    return;
                
                this.mouse.wasPressed = true;
                this.mouse.isHeld = true;
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                
                if (this.mouse.isOverCanvas) {
                    if (this.app.toolState === this.STATES.READY)
                        this.app.toolState = this.STATES.ACTIVE;
                    
                    this.processTool();
                }
                
                this.mouse.wasPressed = false;
                break;
            case 'mousemove':
                this.processTool();
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                
                if (this.mouse.isOverCanvas) {
                    this.elems.mousePosition.innerHTML =
                        `${this.mouse.x}, ${this.mouse.y}`;
                }
                
                break;
            case 'mouseup':
                if (event.button !== 0)
                    return;
                this.mouse.isHeld = false;
                this.processTool();
                break;
        }
    }
    
    processTool() {
        // Call processing function for currently-selected tool.
        this[this.TOOL_FUNCTIONS[this.app.tool]]();
        
        if (this.app.toolState === this.STATES.DONE)
            this.app.toolState = this.STATES.READY
    }
    
    switchTool(tool) {
        if (this.app.toolState !== this.STATES.READY) {
            this.app.toolState = this.STATES.DONE;
            this.processTool();
        }
        
        this.app.tool = tool;
        switch (tool) {
            case this.TOOLS.PENCIL:
                break;
            case this.TOOLS.BUCKET:
                break;
        }
        
        this.elems.canvas.style.cursor =
            `url("${this.APP.PATH.CURSOR}${tool}.png"), auto`;
    }
    
    render() {
        
    }
    
    /**
     *
     * Logs a message to the console.
     *
     * @param {string} level - The severity level (completely arbitrary).
     * @param {string} msg   - The message to log to the console.
     *
    **/
    report(level, msg) {
        console.log('MarbleBrush ' + level + ': ' + msg);
    }
    
    
    capitalizeFirstLetter(string) {
        return string[0].toUpperCase() + string.slice(1).toLowerCase();
    }
    
    titleCase(string) {
        if (typeof string !== 'string' || string.length === 0) {
            report('Warning', 'Title case error.');
            return;
        }
        
        return string.split(" ").map(
            x => this.capitalizeFirstLetter(x)
        ).join(" ");
    }
    
    
    /* = Tool processing functions ========================================== */
    processPencil() {
        switch (this.app.toolState) {
            case this.STATES.ACTIVE:
                if (this.mouse.isHeld)
                    this.canvas.drawLine(this.mouse.x, this.mouse.y, this.mouse.lastX, this.mouse.lastY);
                else
                    this.app.toolState = this.STATES.DONE;
                
                break;
            case this.STATES.DONE:
                this.mouse.lastActiveX = this.mouse.x;
                this.mouse.lastActiveY = this.mouse.y;
                
                break;
        }
    }
    
    processBucket() {
        
    }
    
    processSave() {
        
    }
}
