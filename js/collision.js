/******************************************************************************
Author: Yuta Miyake

Description:
    This basically simulates multiple balls' collisions in 2D plane. Each ball 
    has a position and a velocity. Every frame (under 60 fps), each ball's 
    position vectors and velocities are calculated. For collision detection, 
    it uses simple method that it checks if the squared distance between each 
    ball's radius is under the square of diameter.

Problems:
    Collision detection could not handle multiple objects' collisions;
    Sometiems, some objects are stick to each other, and move together
******************************************************************************/

$(document).ready(function(){

    // global variables/constants  =================
    var canvas = document.getElementById('bgcanvas');
    var ctx = canvas.getContext( '2d' );
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var G_ALPHA = 0.7;
    var LINE_WIDTH = 10;
    ctx.canvas.width  = WIDTH;
    ctx.canvas.height = HEIGHT;
    ctx.globalAlpha = G_ALPHA;
    ctx.strokeStyle="#eeeeee";
    ctx.lineWidth = LINE_WIDTH;
    
    var TICK = 16.7; // 60 fps = 16.7
    var DTIME = TICK/1000;
    var BALL_SIZE = 50;
    var MAX_RADIUS = BALL_SIZE/2;
    var WALL_PROXIMITY = Math.pow(MAX_RADIUS,2);
    var PROXIMITY = Math.pow(MAX_RADIUS*2,2);
    var MAX_SPEED = 100;
    var NUM_BALL = 50;
    var balls = [NUM_BALL];

    // window resize
    $(window).resize(function() {
      WIDTH = window.innerWidth;
      HEIGHT = window.innerHeight;
      ctx.canvas.width  = WIDTH;
      ctx.canvas.height = HEIGHT;
      ctx.globalAlpha = G_ALPHA;
      ctx.strokeStyle="#eeeeee";
      ctx.lineWidth = LINE_WIDTH;
    });

    // supporting functions  ========================
    function Ball(pos,vel,color)
    {
        this.pos = pos;
        this.vel = vel;
        this.color = color;
    }
    function Vector(x,y)
    {
        this.x = x;
        this.y = y;
    }
    function Rgb(r,g,b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.delta = 2;
    }
    for(var i = 0; i < NUM_BALL; i++)
    {
        var j = 0;
        var x = Math.floor(Math.random()*(WIDTH-BALL_SIZE-LINE_WIDTH)+LINE_WIDTH);
        var y = Math.floor(Math.random()*(HEIGHT-BALL_SIZE-LINE_WIDTH)+LINE_WIDTH);
        var center1X,center1Y,center2X,center2Y;
        var squDist;
        
        while(j < i)
        {
            center1X = balls[j].pos.x + MAX_RADIUS;
            center1Y = balls[j].pos.y + MAX_RADIUS;
            center2X = x + MAX_RADIUS;
            center2Y = y + MAX_RADIUS;

            squDist = Math.pow(center2X-center1X, 2) + Math.pow(center2Y-center1Y, 2);
            //console.log(x+" "+y+" "+" "+squDist);
            if (squDist <= PROXIMITY)
            {
                j = 0;
                x = Math.floor(Math.random()*(WIDTH-BALL_SIZE));
                y = Math.floor(Math.random()*(HEIGHT-BALL_SIZE));
            }
            else
            {
                j++;
            }
        }
        //console.log("====="+x+" "+y+" "+" "+squDist);
        

        var pos = new Vector(x,y);

        var vel = new Vector(Math.floor(Math.random()*MAX_SPEED),
                            Math.floor(Math.random()*MAX_SPEED));
        var color = new Rgb(Math.floor(Math.random()*256),
                            Math.floor(Math.random()*256),
                            Math.floor(Math.random()*256));
        balls[i] = new Ball(pos,vel,color);
    }

    function drawBall(ball){
         var centerX = ball.pos.x + BALL_SIZE/2;
         var centerY = ball.pos.y + BALL_SIZE/2;
         var radius = MAX_RADIUS;

         ctx.fillStyle = "rgb("+ball.color.r+","+ball.color.g+","+ball.color.b+")";
         ctx.beginPath();
         ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
         ctx.stroke();
         ctx.fill();
    }

    function updatePhysics(ball){
        ball.pos.x += ball.vel.x*DTIME;
        ball.pos.y += ball.vel.y*DTIME;
    }

    function detectCollisions()
    {
        var center1X, center1Y;
        var center2X, center2Y;
        var x,y;
        var squDist;

        for(var i = 0; i < NUM_BALL; i++)
        {
            center1X = balls[i].pos.x + BALL_SIZE/2;
            center1Y = balls[i].pos.y + BALL_SIZE/2;

            if(Math.pow(center1X-0, 2) <= WALL_PROXIMITY || 
                Math.pow(center1X-WIDTH, 2) <= WALL_PROXIMITY)
            {
                balls[i].pos.x -=  balls[i].vel.x*DTIME;
                balls[i].pos.y -=  balls[i].vel.y*DTIME;

                balls[i].vel.x = -balls[i].vel.x;
            }
            if(Math.pow(center1Y-0, 2) <= WALL_PROXIMITY || 
                Math.pow(center1Y-HEIGHT, 2) <= WALL_PROXIMITY)
            {
                balls[i].pos.x -=  balls[i].vel.x*DTIME;
                balls[i].pos.y -=  balls[i].vel.y*DTIME;

                balls[i].vel.y = -balls[i].vel.y;
            }

            /*
            if(balls[i].pos.x <= 0|| balls[i].pos.x >= WIDTH-BALL_SIZE)
            {
                // in case balls go over the walls too much
                balls[i].pos.x -=  balls[i].vel.x*DTIME;
                balls[i].pos.y -=  balls[i].vel.y*DTIME;

                balls[i].vel.x = -balls[i].vel.x;
            }
            if(balls[i].pos.y >= HEIGHT-BALL_SIZE || balls[i].pos.y <= 0)
            {
                // in case balls go over the walls too much
                balls[i].pos.x -=  balls[i].vel.x*DTIME;
                balls[i].pos.y -=  balls[i].vel.y*DTIME;

                balls[i].vel.y = -balls[i].vel.y;
            }
            */

             for(var j = i+1; j < NUM_BALL; j++)
             {   
                center1X = balls[i].pos.x + BALL_SIZE/2;
                center1Y = balls[i].pos.y + BALL_SIZE/2;

                center2X = balls[j].pos.x + BALL_SIZE/2;
                center2Y = balls[j].pos.y + BALL_SIZE/2;

                squDist = Math.pow(center1X-center2X, 2) + Math.pow(center1Y-center2Y, 2);
               
               if (squDist <= PROXIMITY)
               {
                    // in case balls go into another too much
                    balls[j].pos.x -= balls[j].vel.x*DTIME;
                    balls[j].pos.y -= balls[j].vel.y*DTIME;

                    balls[i].pos.x -= balls[i].vel.x*DTIME;
                    balls[i].pos.y -= balls[i].vel.y*DTIME;

                    // swap velocities
                    x = balls[j].vel.x;
                    y = balls[j].vel.y;

                    balls[j].vel.x = balls[i].vel.x;
                    balls[j].vel.y = balls[i].vel.y;

                    balls[i].vel.x = x;
                    balls[i].vel.y = y;
                }
            }
        }
    }
    function updateColor(ball)
    {
        ball.color.r += ball.color.delta;
        ball.color.g += ball.color.delta;
        ball.color.b += ball.color.delta;

        if(ball.color.r > 255 || ball.color.g > 255 || ball.color.b > 255
            || ball.color.r < 0 || ball.color.g < 0 || ball.color.b < 0)
        {
            ball.color.delta = -ball.color.delta;
        }
    }
    
    (function tick()
    {
        ctx.clearRect(0, 0 , WIDTH, HEIGHT);
        for(var i = 0; i < NUM_BALL; i++)
        {
           updatePhysics(balls[i], TICK);
           updateColor(balls[i]);
        }
          detectCollisions();
         
        for(var i = 0; i < NUM_BALL; i++)
        {
         drawBall(balls[i]);
        }
        requestAnimationFrame(tick); // browser optimization
    })();

    //var loop = setInterval(tick,TICK);

});