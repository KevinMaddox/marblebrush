class Marblebrush {
    canvasElem;
    canvas;
    
    mouseDown;
    xThen;
    yThen;
    xNow;
    yNow;
    
    currentEvent;
    
    selectedTool;
    
    constructor() {
        var container = document.getElementById('marblebrush');
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
        this.canvas  = this.canvasElem.getContext('2d');
        
        this.mouseDown = false;

        this.xThen = 0;
        this.yThen = 0;
        this.xNow = 0;
        this.yNow = 0;

        this.lastEvent = null;
        
    }
    
    handleMouse(event) {
        this.currentEvent = event;
        
        switch (event.type) {
            case 'mousedown':
                if (event.button !== 0)
                    return;
                this.mouseDown = true;
                this.xThen = this.getX();
                this.yThen = this.getY();
                break;
            case 'mousemove':
                this.xNow = this.getX();
                this.yNow = this.getY();
                if (this.mouseDown)
                    this.drawLine();
                this.xThen = this.xNow;
                this.yThen = this.yNow;
                break;
            case 'mouseup':
                if (event.button !== 0)
                    return;
                this.mouseDown = false;
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
        this.selectedTool = tool;
        
        switch (tool) {
            case 'pencil':
                
                break;
            case 'bucket':
                
                break;
        }
        
        this.canvasElem.style.cursor = 'url("res/cursor/' + tool + '.png"), auto';
    }
    
    drawLine() {
        this.canvas.strokeStyle = '#df4b26';
        this.canvas.lineJoin = 'round';
        this.canvas.lineWidth = 1;
        
        this.canvas.beginPath();
        
        this.canvas.moveTo(this.xThen, this.yThen);
        this.canvas.lineTo(this.xNow , this.yNow);
        
        this.canvas.closePath();
        this.canvas.stroke();
    }
    
    render() {
        
    }

}

var marblebrush = new Marblebrush();

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
var tools = document.getElementsByClassName('marblebrush-tool');
for (var i = 0; i < tools.length; i++) {
    tools[i].addEventListener('click', function(event) {
        marblebrush.switchTool(this.dataset.name);
    });
}

