//Better Mouse
var mouse = {
    x: 0,
    y: 0,
    x_offset: 0,
    y_offset: 0,
    pressed: false,
    inside: true,
    

    init: function(x_offset, y_offset){
        this.x_offset = x_offset;
        this.y_offset = y_offset;
        cursor("none");
    },
    
    update: function(){
        this.x = mouseX - this.x_offset;
        this.y = mouseY - this.y_offset;
    },


};

//Built-in Listeners
var mouseOut = function(){
    mouse.inside = false;
    mouse.pressed = false;
};
var mouseOver = function(){
    mouse.inside = true;

};
var mouseReleased = function(){
    mouse.pressed = false;
};
var mousePressed = function(){
    mouse.pressed = true;
};

//Better Color
var _color = function(r, g, b, a){
    if (g === undefined && b === undefined){
        this.r = r;
        this.g = r;
        this.b = r;
    }else{
        this.r = r;
        this.g = g;
        this.b = b;
    }
    if (a === undefined){
        this.a = 255;
    }else{
        this.a = a;
    }
};
_color.prototype.fill = function(alpha){
    if (alpha === undefined){
        alpha = this.a;
    }
    fill(color(this.r, this.g, this.b, alpha));
};
_color.prototype.stroke = function(alpha, weight){
    if (alpha === undefined){
        alpha = this.a;
    }
    if (weight === undefined){
        weight = 1;
    }
    strokeWeight(weight);
    stroke(this.r, this.g, this.b, this.a);
};

var _vertex = function(x, y, r, c){
    this.x = x;
    this.y = y;
    this.r = r;
    this.c = c;
};

var _shape = function(vertices, line_color, shape_color){
    this.vertices = vertices;
    this.line_color = line_color;
    this.shape_color = shape_color;
};
_shape.prototype.draw = function() {
    
    this.shape_color.fill();
    this.line_color.stroke();
    beginShape();
        for(var i=0; i<this.vertices.length; i++){
            vertex(this.vertices[i].x, this.vertices[i].y);
        }
    endShape(CLOSE);
    
    noStroke();
    for(var i=0; i<this.vertices.length; i++){
        var vtx = this.vertices[i];
        vtx.c.fill();
        ellipse(vtx.x, vtx.y, vtx.r, vtx.r);
    }
};

//Better Canvas
var canvas = {
    width: 0,
    height: 0,
    background_color: color(255, 255, 255),
    
    init: function(width, height, bg_color){
        this.width = width;
        this.height = height;
        this.background_color = bg_color;
        mouse.init(this.width, this.height);
        
        frameRate(Infinity);
        colorMode(RGB);
        textFont(createFont("monospace"));
        noStroke();
        noFill();
    },
    
    beginFrame: function(){
        pushMatrix();
        translate(this.width, this.height);
        background(this.background_color);
        mouse.update();
    },
    
    endFrame: function(display_fps, draw_mouse){
        
        if(display_fps){ this.displayFps();}
        
        if(draw_mouse){ this.drawMouse();}
        
        popMatrix();
    },
    
    alignment: [LEFT, CENTER, RIGHT, BOTTOM, CENTER, TOP],
    print: function(txt, x, y, ha, va, col, thck){
        col.fill();
        strokeWeight(thck);
        textAlign(this.alignment[ha+1], this.alignment[va+4]);
        text(txt,x,y);
    },
    
    drawMouse: function(){
        noStroke();
        fill(0);
        ellipse(mouse.x, mouse.y, 3, 3);
    },
    
    fps: 0, last_frame: 0, update_interval: 30, interval_count: 0,
    displayFps: function(){        
        this.interval_count++;
        if (this.interval_count >= this.update_interval){
            var now = millis();
            var delta = now - this.last_frame;
            if (delta <= 0){delta = 1;}
            this.last_frame = now;
            this.fps = Math.floor(1000/delta * this.update_interval);         
            this.interval_count = 0;
        }
        this.background_color.fill(150);
        noStroke();
        var fps_width = textWidth(this.fps);
        rect(-this.width, -this.height, fps_width+3, 15);
        this.print(this.fps, -this.width, -this.height, -1, 1, new _color(0), 1);
        },
        
    dragged_object: undefined,
    drag: function(drag_points){
        if (!mouse.pressed){
            this.dragged_object = undefined;
        }else if(mouse.pressed && this.dragged_object !== undefined){
            this.dragged_object.x = mouse.x;
            this.dragged_object.y = mouse.y;
        }else if(mouse.pressed){
            for(var i = 0; i<drag_points.length;i++){
                var object = drag_points[i];
                if (dist(mouse.x, mouse.y, object.x, object.y)<= object.r){
                    this.dragged_object = object;
                    break;
                }
            }
        }
    },
    
    // Custom Canvas Functions Below
    
    drawGrid: function(grid_size, stroke_color, stroke_size){
        stroke_color.stroke(undefined, stroke_size);
        for(var i = 0; i<grid_size; i++){
        var mapped_val = map(i, 0, grid_size-1, -this.height, this.height);
        line(mapped_val, -this.height, mapped_val, this.height);
        line(-this.height, mapped_val, this.height, mapped_val);
        
        }
    
    }
};


// Actual Code Below


//Setup
var line_color = new _color(0);
var vertices = [];
var num_vertices = 3;
var vtx_radius = 10;
var vtx_color = new _color(200, 50, 50, 100);

for (var i = 0; i<num_vertices; i++){
    var vx = 200*cos((360/num_vertices)*i);
    var vy = 200*sin((360/num_vertices)*i);
    vertices[i] = new _vertex(vx, vy, vtx_radius, vtx_color);
}
var basic_shape = new _shape(vertices, new _color(0,0,0, 200), new _color(100,175,255, 100));

var black = new _color(0,0,0);


//Draw Frames
canvas.init(300,300, new _color(255));
draw = function(){
    canvas.beginFrame();
    
    basic_shape.draw();
    canvas.drag(basic_shape.vertices);
    canvas.drawGrid(50, black, 1);
    canvas.endFrame(true, true);
};
