function Points(n){
    var self = this;
    var p = new Array(n);
    var canv = document.createElement('canvas');
    canv.height = window.innerHeight;
    canv.width = window.innerWidth;
    canv.style.zIndex = 100;
    canv.style.position = "fixed";
    canv.style.top = "0";
    canv.style.left = "0";
    self.h = canv.height;
    self.w = canv.width;
    self.canv = canv;
    self.vmax = 0.5;
    for(var i=0;i<n;i++){
        p[i] = {'x':Math.random()*self.w,
                'y':Math.random()*self.h,
                'vx':(Math.random()>0.5?1:-1)*(1+Math.random())*self.w/10000,
                'vy':(Math.random()>0.5?1:-1)*(1+Math.random())*self.h/10000,
                'ax':0,
                'ay':0};
    }
    self.p = p;
    self.mouse = null;
    document.body.appendChild(self.canv);
    canv.addEventListener("mousemove",function(e){
        self.mouse = { 'x':e.clientX,
                       'y':e.clientY};
    });
    canv.addEventListener("mouseout",function(e){
        self.mouse = null;
    });
}

Points.prototype.distance = function(a,b){
    var dx = (a.x-b.x)/this.h;
    var dy = (a.y-b.y)/this.h;
    return Math.sqrt(dx*dx + dy*dy);
}

Points.prototype.show = function(){
    var self = this;
    var ctx = self.canv.getContext("2d");
    ctx.clearRect(0,0,self.w,self.h);
    self.p.forEach(function(e){
        ctx.fillStyle = 'rgb(0,102,255,0.9)';
        ctx.fillRect(e.x,e.y,2,2);
    });
    for(var i=0;i<self.p.length;i++){
        for(var j=i+1;j<self.p.length;j++){
            var d = self.distance(self.p[i],self.p[j]);
            if(d<0.1){
                ctx.beginPath();
                ctx.moveTo(self.p[i].x,self.p[i].y);
                ctx.lineTo(self.p[j].x,self.p[j].y);
                ctx.strokeStyle = 'rgb(0,102,255,0.5)';
                ctx.stroke();
            }
            d = Math.max(0.001,d);
            var acc = 1e-7/d/d;
            var alpha = (self.p[i].x-self.p[j].x)/self.h/d;
            var beta = (self.p[i].y-self.p[j].y)/self.h/d;
            self.p[i].ax = self.p[i].ax + alpha*acc;
            self.p[i].ay = self.p[i].ay + beta*acc;
            self.p[j].ax = self.p[j].ax - alpha*acc;
            self.p[j].ay = self.p[j].ay - beta*acc;
        }
        if(self.mouse){
            var d = self.distance(self.mouse, self.p[i]);
            if(d<=0.2){
                var alpha = (self.mouse.x - self.p[i].x)/self.h/d;
                var beta = (self.mouse.y - self.p[i].y)/self.h/d;
                // acc = (d-0.1)*1e-2;
                if(d>0.1){
                    acc = 1e-5/Math.pow(d-0.1,2);
                }else{
                    acc = -1e-5/Math.pow(d-0.1,2);
                }
                self.p[i].ax = self.p[i].ax + alpha*acc;
                self.p[i].ay = self.p[i].ay + beta*acc;
            }
            if(d<0.15){
                ctx.beginPath();
                ctx.moveTo(self.p[i].x,self.p[i].y);
                ctx.lineTo(self.mouse.x,self.mouse.y);
                ctx.strokeStyle = 'rgb(0,102,255,0.5)';
                ctx.stroke();
            }
        }
    }
}

Points.prototype.update = function(){
    var self = this;
    self.p.forEach(function(e){
        e.vx = e.vx+e.ax;
        e.vy = e.vy+e.ay;
        var v = Math.sqrt(e.vx*e.vx+e.vy*e.vy);
        if(v>self.vmax){
            e.vx = self.vmax*e.vx/v;
            e.vy = self.vmax*e.vy/v;
        }
        e.x = e.x+e.vx;
        e.y = e.y+e.vy;
        if(e.x<0){
            e.x = -e.x;
            e.vx = -e.vx;
        }else if(e.x>self.w){
            e.x = 2*self.w - e.x;
            e.vx = -e.vx;
        }
        if(e.y<0){
            e.y = -e.y;
            e.vy = -e.vy;
        }else if(e.y>self.h){
            e.y = 2*self.h - e.y;
            e.vy = -e.vy;
        }
        e.ax = 0;
        e.ay = 0;
    });
}

window.onload = function(){
    var p = new Points(60);
    p.show();
    window.setInterval(function(){
        p.update();
        p.show();
    },10)
}

