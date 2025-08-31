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
    this.normals = [];
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
_shape.prototype.find_normals = function(){
    var n = this.vertices.length;
    for(var i = 0; i<n;i++){
        
        var A = this.vertices[i];
        var B = this.vertices[(i+1)%n];
        
        var dx = B.x - A.x;
        var dy = B.y - A.y;
        
        var theta = Math.atan2(dy, dx);
        var _cos = Math.cos(-theta);
        var _sin = Math.sin(-theta);
        
        this.normals[i] = [A, _cos, _sin];
    }
};
_shape.prototype.membership = function(_x, _y){
    var n = this.vertices.length;
    var epsilon = 4;
    var membership = true;
    var edge_case = true;
    for(var i=0; i<n; i++){
        var A = this.normals[i][0];
        var _cos = this.normals[i][1];
        var _sin = this.normals[i][2];
        
        var px = _x - A.x;
        var py = _y - A.y;
        
        var xPrime = _cos*px - _sin*py;
        var yPrime = _sin*px + _cos*py;
        
        membership = membership && (yPrime >= 10);
        //edge_case = edge_case && (yPrime>=-epsilon && yPrime<=epsilon);
        edge_case = edge_case && (yPrime >= -1 );
    }
    
    return [membership, edge_case];
};
_shape.prototype.bake_normals = function(){
   this.find_normals();
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
    grid_size: 0,
    drawGrid: function(grid_size, stroke_color, stroke_size){
        this.grid_size = grid_size;
        stroke_color.stroke(undefined, stroke_size);
        for(var i = 0; i<grid_size; i++){
        var mapped_val = map(i, 0, grid_size-1, -this.height, this.height);
        line(mapped_val, -this.height, mapped_val, this.height);
        line(-this.height, mapped_val, this.height, mapped_val);
        
        }
    
    },
    
    pixelShade: function(shape, steps){
        
        var pixel_size = (this.height*2)/this.grid_size;
        noStroke();
        fill(255, 0, 0, 100);
        
        
        for(var i=0; i<=this.grid_size; i++){
            for(var j=0; j<=this.grid_size; j++){
                //quick exclusion case
                //color decision case
                    var pixel_x = map(j, 0, this.grid_size, -this.height, this.height);
                    var pixel_y = map(i, 0, this.grid_size, -this.width, this.width);
                    var result = shape.membership(pixel_x + pixel_size/2, pixel_y+ pixel_size/2);
                    
                    var full_shade = result[0];
                    var partial_shade = result[1];
                    
                    if (!full_shade && !partial_shade){
                        continue;
                    }else{
                        if(full_shade){
                            fill(0,0,0,255);
                        }else if(partial_shade){
                            fill(0,0,0,150);
                        }
                        rect(pixel_x, pixel_y, pixel_size, pixel_size);
                    }
            }
        }
    
    }
    
};


// Actual Code Below


//Setup
var line_color = new _color(0);
var vertices = [];
var num_vertices = 5;
var vtx_radius = 10;
var vtx_color = new _color(200, 50, 50);

for (var i = 0; i<num_vertices; i++){
    var vx = 200*cos((360/num_vertices)*i);
    var vy = 200*sin((360/num_vertices)*i);
    vertices[i] = new _vertex(vx, vy, vtx_radius, vtx_color);
}
var basic_shape = new _shape(vertices, new _color(0,0,0), new _color(100,175,255,100));

var black = new _color(0,0,0, 100);

basic_shape.bake_normals();

//Draw Frames
canvas.init(300,300, new _color(255));
draw = function(){
    canvas.beginFrame();
    basic_shape.bake_normals();
    

    canvas.drag(basic_shape.vertices);
    //canvas.drawGrid(50, black, 1);
    canvas.grid_size = 30;
    canvas.pixelShade(basic_shape, 0);
    basic_shape.draw();
    canvas.endFrame(true, true);
};
