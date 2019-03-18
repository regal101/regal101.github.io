function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

var Game = function(){

  var myMusic;
  this.musicTimer = 0;
  this.myMusic = new sound("Night.mp3");
  this.myMusic.play();

  var twoPi = Math.PI * 2;
  var raycaster = {
    init: function(){
      this.maxDistance = Math.sqrt(minimap.cellsAcross * minimap.cellsAcross + minimap.cellsDown * minimap.cellsDown);
      var numberOfRays = 300;
      var angleBetweenRays = .2 * Math.PI /180;
      this.castRays = function() {
        foregroundSlivers = [];
        backgroundSlivers = [];
        minimap.rays = [];
        dino.show = false;
        for (var i=0;i<numberOfRays;i++) {
          var rayNumber = -numberOfRays/2 + i;
          var rayAngle = angleBetweenRays * rayNumber + player.angle;
          this.castRay(rayAngle, i);
        }
      }
      this.castRay = function(rayAngle, i){
        rayAngle %= twoPi;
        if (rayAngle < 0) rayAngle += twoPi;
        var right = (rayAngle > twoPi * 0.75 || rayAngle < twoPi * 0.25);
        var up = rayAngle > Math.PI;
        var slope = Math.tan(rayAngle);
        var distance = 0;
        var xHit = 0;
        var yHit = 0;
        var wallX;  
        var wallY;
        var dX = right ? 1 : -1; 
        var dY = dX * slope;  
        var x = right ? Math.ceil(player.x) : Math.floor(player.x);
        var y = player.y + (x - player.x) * slope; 
        var wallType;
        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown) {
          wallX = Math.floor(x + (right ? 0 : -1));
          wallY = Math.floor(y);
          if (map[wallY][wallX] > -1) {
            var distanceX = x - player.x;
            var distanceY = y - player.y;
            distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);  
            xHit = x;  
            yHit = y;
            wallType = map[wallY][wallX];
            break;
          } else{
            if(dino.x === wallX && dino.y === wallY){
              dino.show = true;
            };
          }
          x += dX; 
          y += dY;
        }
        slope = 1/slope;
        dY = up ? -1 : 1;
        dX = dY * slope;
        y = up ? Math.floor(player.y) : Math.ceil(player.y);
        x = player.x + (y - player.y) * slope;
        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown) {
          wallY = Math.floor(y + (up ? -1 : 0));
          wallX = Math.floor(x);
          if (map[wallY][wallX] > -1) {
            var distanceX = x - player.x;
            var distanceY = y - player.y;
            var blockDistance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
            if (!distance || blockDistance < distance) {
              distance = blockDistance;
              xHit = x;
              yHit = y;
              wallType = map[wallY][wallX];
            }
            break;
          }else{
            if(dino.x === wallX && dino.y === wallY){
              dino.show = true;
            };
          }
          x += dX;
          y += dY;
        }
        if(dino.show === true){
          var dinoDistanceX = dino.x + .5 - player.x;
          var dinoDistanceY = dino.y + .5 - player.y;
          dino.angle = Math.atan(dinoDistanceY/dinoDistanceX) - player.angle;
          dino.distance = Math.sqrt(dinoDistanceX*dinoDistanceX + dinoDistanceY * dinoDistanceY);
        };
        minimap.rays.push([xHit, yHit]);
        var adjustedDistance = Math.cos(rayAngle - player.angle) * distance;
        var wallHalfHeight = canvas.height / adjustedDistance / 2;
        var wallTop = Math.max(0, canvas.halfHeight - wallHalfHeight);
        var wallBottom = Math.min(canvas.height, canvas.halfHeight + wallHalfHeight);
        var percentageDistance = adjustedDistance / this.maxDistance;
        var brightness = 1 - percentageDistance;
        var shade = Math.floor(palette.shades * brightness);
        var color = palette.walls[wallType][shade];
        if(adjustedDistance < dino.distance){
          foregroundSlivers.push([i, wallTop, wallBottom, color]);
        }else{
          backgroundSlivers.push([i, wallTop, wallBottom, color]);
        };
      }
    }
  }
  var player = {
    init: function(){
      this.x = 10;
      this.y = 6;
      this.direction = 0;
      this.angle = 0;
      this.speed = 0;
      this.movementSpeed = 0.1;
      this.turnSpeed = 4 * Math.PI / 180; 
      this.move = function(){
        var moveStep = this.speed * this.movementSpeed;
        this.angle += this.direction * this.turnSpeed;
        var newX = this.x + Math.cos(this.angle) * moveStep;
        var newY = this.y + Math.sin(this.angle) * moveStep;
        if (!containsBlock(newX, newY)){
          this.x = newX;
          this.y = newY;
        };
      };
      this.draw = function(){
        var playerXOnMinimap = this.x * minimap.cellWidth;
        var playerYOnMinimap = this.y * minimap.cellHeight;
        minimap.context.fillStyle = "#000000";
        minimap.context.beginPath();
        minimap.context.arc(minimap.cellWidth*this.x, minimap.cellHeight*this.y, minimap.cellWidth/2, 0, 2*Math.PI, true); 
        minimap.context.fill();
        var projectedX = this.x + Math.cos(this.angle);
        var projectedY = this.y + Math.sin(this.angle);
        minimap.context.fillRect(minimap.cellWidth*projectedX - minimap.cellWidth/4, minimap.cellHeight*projectedY - minimap.cellHeight/4, minimap.cellWidth/2, minimap.cellHeight/2);
      };
    }
  }
  function containsBlock(x,y) {
    return (map[Math.floor(y)][Math.floor(x)] !== -1); 
  };
  var map = [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,0,-1,2,3,2,-1,-1,-1,1], 
      [1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,-1,-1,-1,1], 
      [1,-1,-1,2,-1,-1,-1,-1,-1,3,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,2,-1,-1,2,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]; 
  var canvas = {
    init: function(){
      this.element = document.getElementById('canvas');
      this.context = this.element.getContext("2d");
      this.width = this.element.width;
      this.height = this.element.height;
      this.halfHeight = this.height/2;
      this.blank = function(){
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = palette.sky;
        this.context.fillRect(0, 0, this.width, this.halfHeight);
        this.context.fillStyle = palette.ground;
        this.context.fillRect(0, this.halfHeight, this.width, this.height);
      }
      this.drawSliver = function(sliver, wallTop, wallBottom, color){
        this.context.beginPath();
        this.context.strokeStyle = color;
        this.context.moveTo(sliver + .5, wallTop);
        this.context.lineTo(sliver + .5, wallBottom);
        this.context.closePath();
        this.context.stroke();
      }
    }
  };
  
  var minimap = {
    init: function(){
      this.element = document.getElementById('minimap');
      this.context = this.element.getContext("2d");
      this.element.width = 300;
      this.element.height = 300;
      this.width = this.element.width;
      this.height = this.element.height;
      this.cellsAcross = map[0].length;
      this.cellsDown = map.length;
      this.cellWidth = this.width/this.cellsAcross;
      this.cellHeight = this.height/this.cellsDown;
      this.colors = ["#ffff00", "#ff00ff", "#00ffff", "#0000ff"];
      this.draw = function(){
        for(var y = 0; y < this.cellsDown; y++){
          for(var x = 0; x < this.cellsAcross; x++){
            var cell = map[y][x];
            if (cell===-1){
              this.context.fillStyle = "#ffffff"
            }else{
              this.context.fillStyle = this.colors[map[y][x]];
            };
            this.context.fillRect(this.cellWidth*x, this.cellHeight*y, this.cellWidth, this.cellHeight);
          };
        };
        for(var i = 0; i < this.rays.length; i++){
          this.drawRay(this.rays[i][0], this.rays[i][1])
        }
      };
      this.drawRay = function(xHit, yHit){
        this.context.beginPath();
        this.context.moveTo(this.cellWidth*player.x, this.cellHeight*player.y);
        this.context.lineTo(xHit * this.cellWidth, yHit * this.cellHeight);
        this.context.closePath();
        this.context.stroke();
      };
    }
  };
  
  var gun = {
    init : function(){
      shootSound = new sound("shotgun.wav");
      this.shooting = false;
      
      d = new Date();
      this.lastShotTime = d.getTime()
      
      this.sprite = new jaws.Sprite({image: "gun1.png", x: 150, y: 122, anchor: "center"});

      this.draw = function(){
        this.scale = 0.7;
        this.sprite.scaleTo(this.scale);

        d = new Date();
        //console.log(d.getTime() - this.lastShotTime);
        if(d.getTime() - this.lastShotTime > 250){
          this.shooting = false;
        }
      
        if(this.shooting == true){                                          
          this.sprite = new jaws.Sprite({image: "gun2.png", x: 150, y: 122, anchor: "center"});
        } else{
          this.sprite = new jaws.Sprite({image: "gun1.png", x: 150, y: 122, anchor: "center"});
        }
        
        this.sprite.draw();
      };

      this.fireBullet = function(angle){
        angle %= twoPi;
        if (angle < 0) angle += twoPi;
        var right = (angle > twoPi * 0.75 || angle < twoPi * 0.25);
        var up = angle > Math.PI;
        var slope = Math.tan(angle);
        var distance = 0;
        var xHit = 0;
        var yHit = 0;
        var wallX;  
        var wallY;
        var dX = right ? 1 : -1; 
        var dY = dX * slope;  
        var x = right ? Math.ceil(player.x) : Math.floor(player.x);
        var y = player.y + (x - player.x) * slope; 
        var wallType;
        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown) {
          tileX = Math.floor(x + (right ? 0 : -1));
          tileY = Math.floor(y);
          if(tileX === dino.x && tileY === dino.y){
            console.log("dino hit");
            dino.alive = false;
          }
          if (map[tileY][tileX] > -1) {
            var distanceX = x - player.x;
            var distanceY = y - player.y;
            distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);  
            xHit = x;  
            yHit = y;
            tileType = map[tileY][tileX];
            console.log(distance);
            break;
          } 
          x += dX; 
          y += dY;
        }
        slope = 1/slope;
        dY = up ? -1 : 1;
        dX = dY * slope;
        y = up ? Math.floor(player.y) : Math.ceil(player.y);
        x = player.x + (y - player.y) * slope;
        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown) {
          tileY = Math.floor(y + (up ? -1 : 0));
          tileX = Math.floor(x);
          if(tileX === dino.x && tileY === dino.y){
            console.log("dino hit");
            dino.alive = false;

          }
          if (map[tileY][tileX] > -1) {
            var distanceX = x - player.x;
            var distanceY = y - player.y;
            var blockDistance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
            if (!distance || blockDistance < distance) {
              distance = blockDistance;
              xHit = x;
              yHit = y;
              tileType = map[tileY][tileX];
              console.log(distance);
            }
            break;
          }
          x += dX;
          y += dY;
        }
        
        //minimap.rays.push([xHit, yHit]);

      }
    },

    shoot : function() {
      d = new Date();
      if(this.shooting == false && d.getTime() - this.lastShotTime > 500){
        shootSound.play();
        this.shooting = true;
        gun.fireBullet(player.angle); 
        d = new Date();
        this.lastShotTime = d.getTime()
      }
       
    }

  }
 

  var palette = {
    init: function(){
      this.ground = '#DFD3C3'; 
      this.sky = '#ff0000'; 
      this.shades = 300;
      var initialWallColors = [[189, 80, 0], 
                               [189, 80, 50], 
                               [189, 80, 0], 
                               [189, 80, 0]];
      this.walls = [];
      for(var i = 0; i < initialWallColors.length; i++){
        this.walls[i] = [];
        for(var j = 0; j < this.shades; j++){
          var red = Math.round(initialWallColors[i][0] * j / this.shades); 
          var green = Math.round(initialWallColors[i][1] * j / this.shades);
          var blue =  Math.round(initialWallColors[i][2] * j / this.shades);
          var color = "rgb("+red+","+green+","+blue+")";
          this.walls[i].push(color);
        };
      };
    }
  }
  var dino = {
    init: function(){
      this.alive = true;
      this.sprite = new jaws.Sprite({image: "dino.png", x: 0, y: canvas.height/2, anchor: "center"});
      this.x = 12; 
      this.y = 4;
      this.show = false;
      this.distance = 10000;
      this.draw = function(){
        this.scale = raycaster.maxDistance / dino.distance / 2;
        this.sprite.scaleTo(this.scale);
        this.angle %= twoPi;
        if (this.angle < 0) this.angle += twoPi;
        this.angleInDegrees = this.angle * 180 / Math.PI;
        var potentialWidth = 300*.2;
        var halfAngularWidth = potentialWidth/2;
        this.adjustedAngle = this.angleInDegrees + halfAngularWidth;
        if(this.adjustedAngle > 180 || this.adjustedAngle < -180){
          this.adjustedAngle %= 180;
        };
        this.sprite.x = this.adjustedAngle/potentialWidth*canvas.width;

        if(this.alive == true){
          this.sprite.draw();
        }
        
      };
    }
  };

  this.draw = function(){
    minimap.draw();
    player.draw(); 
    canvas.blank();
    for(var i = 0; i < backgroundSlivers.length; i++){
      canvas.drawSliver.apply(canvas, backgroundSlivers[i]);
    };
    if (dino.show){
      dino.draw();
    };
    for(var i = 0; i < foregroundSlivers.length; i++){
      canvas.drawSliver.apply(canvas, foregroundSlivers[i]);
    };
    gun.draw();
  };
  this.setup = function() {
    gun.init();
    minimap.init();
    player.init();
    raycaster.init(); 
    canvas.init();
    palette.init();
    dino.init();
  };
  this.update = function(){

    d = new Date();
    //console.log(d.getTime() - this.musicTimer)
    if (d.getTime() - this.musicTimer > 1000){
      this.musicTimer = d.getTime();
      this.myMusic.play();
    }
    
    //console.log(player.angle)

    raycaster.castRays();
    if(jaws.pressed("left")) { player.direction = -1 };
    if(jaws.pressed("right")) { player.direction = 1 };
    if(jaws.pressed("up")) { player.speed = 1 };
    if(jaws.pressed("down")) { player.speed = -1 }; 

    if(jaws.on_keyup(["left", "right"], function(){
       player.direction = 0;
    })); 
    if(jaws.on_keyup(["up", "down"], function(){
       player.speed = 0;
    })); 
    if(jaws.pressed("space")) { 
      gun.shoot();
    }; 
    player.move();
  };
}
