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

class MarbleBrush {
    APP;          // General-use data pertaining to the app.
    TOOLS;        // The tools available for use.
    STATES;       // The possible states that a tool can be in.
    
    mouse;        // Contains info for mouse's positions & left-click state.
    
    canvas;       // The context of the canvas, for actual image operations.
    elems;
    
    tool;         // The active tool in use.
    state;        // The state of the active tool.
    
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
            PENCIL:  'pencil',
            BUCKET:  'bucket',
            POLYGON: 'polygon'
        };
        
        this.STATES = {
            READY:    0,
            BEGIN:    1,
            ACTIVE:   2,
            INACTIVE: 3,
            DONE:     4
        };
        
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
        this.mouse = {
            wasPressed:   false,
            wasReleased:  false,
            isHeld:       false,
            isOverCanvas: false,
            lastX:        0,
            lastY:        0,
            x:            0,
            y:            0
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
            `<div id="marblebrush-titlebar">${options.name}</div>`
          + '<hr>'
          + '<canvas id="marblebrush-canvas" width="320" height="240"></canvas>'
          + '<hr>'
          + '<div id="marblebrush-toolbar"></div>'
          + '<div id="marblebrush-statusbar">'
          +     '<div id="marblebrush-statusbar-msg"></div>'
          +     '<div>&nbsp;</div>'
          +     '<div id="marblebrush-statusbar-mouse-pos"></div>'
          + '</div>'
        ;
        
        container.innerHTML = containerHTML;
        
        let selectableToolNames = [
            'pencil',
            'bucket',
            'save'
        ];
        
        let toolbarHTML = '';
        for (const t of selectableToolNames ) {
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
        
        this.elems.canvas = document.getElementById(
            'marblebrush-canvas'
        );
        this.elems.mousePosition = document.getElementById(
            'marblebrush-statusbar-mouse-pos'
        );
        this.elems.statusMsg = document.getElementById(
            'marblebrush-statusbar-msg'
        );
        
        this.canvas  = this.elems.canvas.getContext('2d');
        
        // - Set up event listeners. -------------------------------------------
        this.elems.canvas.addEventListener('mousedown', function() {
            this.handleMouse(event);
        }.bind(this));
        
        document.addEventListener('mousemove', function() {
            this.handleMouse(event);
        }.bind(this));
        
        document.addEventListener('mouseup', function() {
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
                this.elems.statusMsg.innerHTML =
                    this.titleCase(tools[i].dataset.name);
            }.bind(this));
            
            tools[i].addEventListener('mouseout', function() {
                this.elems.statusMsg.innerHTML = '';
            }.bind(this));
        }
        
        // - Finish up initialization. -----------------------------------------
        this.switchTool(this.TOOLS.PENCIL);
        this.state = this.STATES.READY;
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
                
                if (this.state === this.STATES.READY)
                    this.state = this.STATES.BEGIN;
                
                this.processTool();
                
                this.mouse.wasPressed = false;
                break;
            case 'mousemove':
                if (this.mouse.isHeld)
                    this.processTool();
                this.mouse.lastX = this.mouse.x;
                this.mouse.lastY = this.mouse.y;
                
                this.elems.mousePosition.innerHTML = (this.mouse.isOverCanvas) ?
                    `${this.mouse.x}, ${this.mouse.y}` :
                    '';
                
                break;
            case 'mouseup':
                if (event.button !== 0)
                    return;
                this.mouse.isHeld = false;
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
    
    switchTool(tool) {
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
        
        this.elems.canvas.style.cursor =
            `url("${this.APP.PATH.CURSOR}${tool}.png"), auto`;
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
}
