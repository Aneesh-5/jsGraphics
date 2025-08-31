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
        if (r === -1){
            this.r = random(0,255);
            this.g = random(0,255);
            this.b = random(0,255);
        }else{
            this.r = r;
            this.g = r;
            this.b = r;
        }
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
_color.prototype.contrast = function(){
    return new _color(255 - this.r, 255 - this.g, 255 - this.b);
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
_shape.prototype.draw = function(face, lines, vertices) {
    if(face){
        this.shape_color.fill();
    }else{ noFill();}
    if(lines){
        this.line_color.stroke();
    }else{ noStroke();}
    
    if(face || lines){
        beginShape();
            for(var i=0; i<this.vertices.length; i++){
                vertex(this.vertices[i].x, this.vertices[i].y);
            }
        endShape(CLOSE);
    }
    if(vertices){
        noStroke();
        for(var i=0; i<this.vertices.length; i++){
            var vtx = this.vertices[i];
            vtx.c.fill();
            ellipse(vtx.x, vtx.y, vtx.r, vtx.r);
        }
    }
};
//todo: Bake dx^2 + dy^2 and B
_shape.prototype.bake_edges = function(){
    this.edges = [];
    var n = this.vertices.length;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    
    for(var i = 0, j = n-1; i<n; j = i++){
        var A = this.vertices[j];
        var B = this.vertices[i];
        this.edges.push({
            A: A,
            dx: B.x - A.x,
            dy: B.y - A.y,
            minY: min(A.y, B.y),
            maxY: max(A.y, B.y)
        });
        
        minX = min(minX, A.x);
        maxX = max(maxX, A.x);
        minY = min(minY, A.y);
        maxY = max(maxY, A.y);
    }
    
    this.bounding_box = {minX:minX, maxX:maxX, minY:minY, maxY:maxY};
};
_shape.prototype.inside = function(x, y){
    var inside = false;
    var n = this.vertices.length;
    
    for(var i=0, j = n-1; i<n; j = i++){
        var edge = this.edges[i];
        if (edge.dy === 0 || y<edge.minY || y>=edge.maxY){continue;}
        
        var intersection_X = edge.A.x+edge.dx*(y-edge.A.y)/edge.dy;
        if (x<intersection_X){ inside = !inside;}
    }
    return inside;
};
_shape.prototype.edge_distance = function(px, py, A, B){
    var dx = B.x - A.x;
    var dy = B.y - A.y;
    var vx = px - A.x;
    var vy = py - A.y;
    
    var projection = (vx*dx + vy*dy)/(dx*dx + dy*dy);
    projection = Math.max(0, Math.min(1, projection));
    
    var cx = A.x + projection*dx;
    var cy = A.y + projection*dy;
    
    var _dist = sqrt(pow((px-cx),2) + pow((py-cy),2));
    return _dist;

};
_shape.prototype.min_edge_distance = function(x, y){
    var min_dist = Infinity;
    var n = this.edges.length;
    
    for(var i = 0; i<n; i++){
        var edge = this.edges[i];
        var B = { x: edge.A.x + edge.dx, y: edge.A.y + edge.dy};
        var _dist = this.edge_distance(x, y, edge.A, B);
        if (_dist<min_dist){ min_dist = _dist;}
    }
    if (this.inside(x, y)){ min_dist = -min_dist;}
    return min_dist;
    
};
_shape.prototype.coverage = function(px, py, pixel_size){
    var _dist = this.min_edge_distance(px, py);
    var halfPixel = pixel_size/2;
    
    var coverage = 0.5 - _dist / pixel_size;
    coverage = min(max(coverage,0),1);
    return coverage;
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
    
    endFrame: function(display_fps, draw_mouse, show_grid, show_resolution){
        
        if(display_fps){ this.displayFps();}
        
        if(draw_mouse){ this.drawMouse();}
        
        if(show_grid){ this.drawGrid();}
        
        if(show_resolution){ this.displayRes();}
        
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
        var dragged = false;
        
        if (!mouse.pressed){
            this.dragged_object = undefined;
        }else if(mouse.pressed && this.dragged_object !== undefined){
            this.dragged_object.x = mouse.x;
            this.dragged_object.y = mouse.y;
            dragged = true;
        }else if(mouse.pressed){
            for(var i = 0; i<drag_points.length;i++){
                var object = drag_points[i];
                if (dist(mouse.x, mouse.y, object.x, object.y)<= object.r){
                    this.dragged_object = object;
                    dragged = true;
                    break;
                }
            }
        }
        return dragged;
    },
    
    // Custom Canvas Functions Below
    
    
    grid_size: 0,
    init_rasterization: function(grid_size){
        this.grid_size = grid_size;
        this.pixel_size = (this.width*2)/this.grid_size;
        this.num_cells = this.grid_size*this.grid_size;
        this.screenSpace = new Array(this.num_cells*2);
        
        var index = 0;
        for(var i = 0; i<this.grid_size; i++){
            for(var j = 0; j < this.grid_size; j++){
                var x = -this.width + j* this.pixel_size + this.pixel_size/2;
                var y = -this.height + i*this.pixel_size + this.pixel_size/2;
                this.screenSpace[index++] = x;
                this.screenSpace[index++] = y;
            }
        }
    },
    
    rasterize: function(shape, steps){
        noStroke();
        for(var i = 0; i<this.num_cells; i++){
            var x = this.screenSpace[i*2];
            var y = this.screenSpace[i*2 + 1];
            if (x<shape.bounding_box.minX ||
                x>shape.bounding_box.maxX ||
                y<shape.bounding_box.minY ||
                y>shape.bounding_box.maxY){ continue;}
                
            var coverage = shape.coverage(x, y, this.pixel_size);
            if(coverage >0){
                shape.shape_color.fill((floor(coverage*steps)/(steps-1))*255);
                rect(
                    x - this.pixel_size/2,
                    y - this.pixel_size/2,
                    this.pixel_size,
                    this.pixel_size
                    );
                
            }
        }
    },
    
    drawGrid: function(){
        stroke(0,0,0,40);
        strokeWeight(1);
        for (var i = 0; i<=this.grid_size; i++){
            var x = map(i, 0, this.grid_size, -this.width, this.width);
            var y = map(i, 0, this.grid_size, -this.height, this.height);

            line(x, -this.height, x, this.height);
            line(-this.width, y, this.width, y);
            }
        },
    
    displayRes: function(){
        this.print(this.grid_size + ' x ' + this.grid_size, 300 - 5, -300, 1, 1, new _color(0), 1);
    },
    
    label: function(shape, txt){
        this.center_x = (shape.bounding_box.minX + shape.bounding_box.maxX)/2;
    this.center_y = (shape.bounding_box.minY + shape.bounding_box.maxY)/2;
    canvas.print(txt, this.center_x, this.center_y, 0, 0, shape.shape_color.contrast(), 1);
    }
};


// Actual Code Below

var shapes = [];
var rebake = [];
var raster_resolution = [];

var vtx_radius = 10;
var vtx_color = new _color(0,0,0,80);
var black = new _color(0, 0, 0, 150);
var console_col = new _color(0,0,0);

for(var j = 0; j<=5; j++){
    var num_vtx = j;
    if(num_vtx<3){num_vtx = 3;}
    
    var vertices = [];
    var random_center_x = random(-130,130);
    var random_center_y = random(-130,130);
    var random_radius = random(50, 100);
    var random_color = new _color(-1);
    random_color.a = random(80,160);
    for (var i = 0; i<num_vtx; i++){
        var vx = random_radius*cos((360/num_vtx)*i) + random_center_x;
        var vy = random_radius*sin((360/num_vtx)*i) + random_center_y;
        vertices.push(new _vertex(vx, vy, vtx_radius, vtx_color));
    }
    shapes.push(new _shape(vertices, black, random_color));
    rebake.push(true);
    raster_resolution.push(floor(random(2,5)));
}
var rebake = new Array(shapes.length).fill(true);


//Draw Frames
canvas.init(300,300, new _color(255));
canvas.init_rasterization(100, true);

draw = function(){
    canvas.beginFrame();
    for(var i= 0; i<shapes.length;i++){
        var temp_shape = shapes[i];
        
        if (rebake[i]){
            temp_shape.bake_edges();
            rebake[i] = false;
        }
    
        temp_shape.draw(false, false, true);
        canvas.rasterize(temp_shape,raster_resolution[i]);
        canvas.label(temp_shape, 'aa steps: ' + raster_resolution[i]);
        rebake[i] = canvas.drag(temp_shape.vertices);
    }
        
    canvas.endFrame(true, true, false, true);
};
