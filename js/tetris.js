// Author: Yuta Miyake
// References: http://coderecipe.jp/recipe/iHjJBJx9Si/

$(document).ready(function(){
       
       // blur
       var vague = $('#blur').Vague({
           intensity:      70,  
           forceSVGUrl:    false, 
           animationOptions: {
             duration: 1000,
             easing: 'linear'
           }
       });

       vague.blur();

       // show title
       var time = 0;
       var gameTitle = setInterval(function(){
       if(time % 2 === 0 )
       {
        $('.title h1 section').css("color","#06ff00");
        }
       else{
         $('.title h1 section').css("color","#ff6600");
       }
        time++;
       },1000);
    
    // end title
      $(document).keypress(function(){
        clearInterval(gameTitle);
        $('.title').fadeOut(300);
        
    // main driver
       setTimeout(function(){$('#canvas').show('slow');},300);
       setTimeout(function(){start();},100);
       
    // global constants
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext( '2d' );
        ctx.strokeStyle="#eeeeee";

        var ROW = 20;
        var COL = 10;
        var WIDTH = 300;
        var HEIGHT = 600;
        var B_WIDTH = WIDTH/COL;
        var B_HEIGHT = HEIGHT/ROW;
        var B_EMPTY = 0;
        var B_OCCUPIED = 1;
        var B_ACTIVE = 2;

        var STOP = -3;
        var BORDER = -2;
        var MOVE = 100;

        var KEYS = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, SPACE: 32};
       
        var TETRIMINOS = [
        [ [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0] ], // I
        [ [0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0] ], // O
        [ [0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0] ], // T
        [ [0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0] ], // J
        [ [0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0] ], // L
        [ [0, 0, 0, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0] ], // Z
        [ [0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0] ], // S
        [ [0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0] ], // L2
        [ [0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0] ]  // I2
        ]; 
       
        var COLORS = 
        [ "#7dfeff", "#FFEF24", "#be45ff", "#4563ff", "orange", 
        "#ff5e55", "#79ff66", "#ee00bb", "#05DFA1"];
       
        var block = {}; // current moving block object
      
    // canvas functions
       function drawPixel(x,y){
            // ctx.fillRect(x*B_WIDTH, y*B_HEIGHT, B_WIDTH-1, B_HEIGHT-1);
            
            var centerX = x*B_WIDTH + B_WIDTH/2;
            var centerY = y*B_HEIGHT + B_HEIGHT/2;
            var radius = B_WIDTH/2-1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.lineWidth=2;
            ctx.fill();
       }
       function cls(){
            ctx.clearRect(0, 0 , WIDTH, HEIGHT);
            //ctx.fillStyle="rgba(255,255,255,0.5)";
            //ctx.fillRect(0,0,WIDTH,HEIGHT);

       }
       function render(){
            cls();
            for ( var y = 0; y < ROW; y++ )
            {
                for ( var x = 0; x < COL; x++ )
                {
                    if( field[ y ][ x ] === B_OCCUPIED )
                    {
                     ctx.fillStyle = "#222222";
                     drawPixel( x, y );   
                    }
                    else if( field[ y ][ x ] === B_ACTIVE )
                    {
                     ctx.fillStyle = block.color;
                     drawPixel( x, y );   
                    }
                }
            }
        }
              
    // supporting game functions
        
        function init(){
            field = [ROW];
            for ( var y = 0; y < ROW; y++ )
            {
                field[ y ] = [COL];
                for ( var x = 0; x < COL; x++ )
                {
                    field[ y ][ x ] = 0;
                }
            }
        }
        function start(){
           // input manager
           $(document).unbind();
           $(document).keydown(function(event){
                var key = event.which;
                control(key);
            });
            
           // game initialization
           init();
           makeBlock();
           updateBoard();
           render();
           showScore();

           // game tick
           tick(1000);
        }
        function tick(interval){
            game = setInterval(function(){
                control(KEYS.DOWN);
            },interval);
        }
        
        function clearLine(){
            var number = 0;
            
            for ( var y = 0; y < ROW; y++ )
            {
                 var clear = true;
                for ( var x = 0; x < COL; x++ )
                {
                    if( field[ y ][ x ] === B_EMPTY)
                    {
                      clear = false;
                    }
                }
              if( clear )
              {
                number++;

                for ( var i = y ; i > 0; i-- )
                {
                    for ( var j = 0; j < COL; j++ )
                    {
                       field[ i ][ j ] = field[ i-1 ][ j ]
                    }
                }

              }
            }
            
            calcScore(number);
            updateScore();
                
        }
        function clearOld(){
            var dx;
            var dy;
            for (var y = 0; y < 4; y++)
            {
                for (var x = 0; x < 4; x++)
                {
                   dx = x + block.xPos;
                   dy = y + block.yPos;
                   if ( block.shape[y][x] == B_OCCUPIED && dx >= 0 && dy >= 0 )
                      {
                       field[dy][dx] = B_EMPTY;
                      }
                }
            }
        }
        
        function setBlock(){
            var end = false;
            var dx,dy;
            for (var y = 0; y < 4; y++)
            {
                for (var x = 0; x < 4; x++) {
                 dx = x + block.xPos;
                 dy = y + block.yPos;
                 if ( block.shape[y][x] == B_OCCUPIED )
                    {
                       field[dy][dx] = B_OCCUPIED;
                       
                       if (dy === 0)
                       {
                          end = true;
                       }
                    }
                }
            }
            return end;
        }
        
        function makeBlock(){
            var selectedIndex = Math.floor( Math.random()*TETRIMINOS.length);
            block.shape = TETRIMINOS[selectedIndex];
            block.color = COLORS[selectedIndex];
            block.xPos = 3;
            block.yPos = -1;
        }
        
        function rotate(){
            var new_shape = [4];
            for ( var y = 0; y < 4; y++ ){
                new_shape[ y ] = [4];
                for ( var x = 0; x < 4 ; x++ ){
                    new_shape[y][x] = block.shape[3-x][y];
                }
            }
            block.shape = new_shape;
        }
        
        function updateBoard(){
            var clear = false;
            var dx,dy;

            for (var y = 0; y < 4; y++){
                for (var x = 0; x < 4; x++){
                  dx = x + block.xPos;
                  dy = y + block.yPos;
                  if ( block.shape[y][x] == B_OCCUPIED && dx >= 0 && dy>= 0){
                      if(field[dy][dx] === B_OCCUPIED){
                        clear = true;
                      }
                      field[dy][dx] = B_ACTIVE;
                  }
                }
            }
            if(clear){
                endGame();
            }
        }
        
        // check if the new position is valid or not
        function checkPos(key){ 
            var result = MOVE;   
            var newX,newY,dx,dy;
            
            if (key === KEYS.RIGHT || key === KEYS.LEFT ){
                switch(key){
                    case KEYS.RIGHT: 
                    newX = block.xPos + 1;
                    newY = block.yPos;
                    break;
  
                    case KEYS.LEFT:
                    newX = block.xPos - 1;
                    newY = block.yPos;
                    break;
                }
                for (var y = 0; y < 4; y++){
                    for (var x = 0; x < 4; x++){
                    dx = x + newX,
                    dy = y + newY;
                    
                    if ( dy>= 0 && dy < 20 ){
                        if ( field[dy][dx] === B_OCCUPIED && block.shape[y][x] === B_OCCUPIED ){
                            result = BORDER;
                        }
                        else if ( block.shape[y][x] === B_OCCUPIED && ( dx > 9 || dx < 0 ) ){
                            result =  BORDER;
                        }
                    }
                  }
                }
            }
            else if( key === KEYS.DOWN ){
                newX = block.xPos;
                newY = block.yPos + 1;
                for (var y = 0; y < 4; y++){
                    for (var x = 0; x < 4; x++){
                      dx = x + newX;
                      dy = y + newY;
                      
                      if( block.shape[y][x] === B_OCCUPIED &&  (dy > 19) ){
                          result = STOP;
                      }
                      else if (dy < 20){
                          if ( field[dy][dx] === B_OCCUPIED && block.shape[y][x] === B_OCCUPIED){
                          result = STOP;
                         }
                      }
                    }
                }
            }
            
            else if (key === KEYS.UP){
                for (var y = 0; y < 4; y++){
                    for (var x = 0; x < 4; x++){
                         dx = x + block.xPos;
                         dy = y + block.yPos;
                
                     if ( block.shape[3-x][y] == B_OCCUPIED && ( dx > 9 || dx < 0 ) ){
                            result =  BORDER;
                        }
                        else if(dy < 20){
                          if (field[dy][dx] ==  B_OCCUPIED && block.shape[3-x][y] == B_OCCUPIED){
                            result = BORDER;
                          }
                        }  
                    }
                }  
            }
      
            return result;
        }
        
        function endGame(){
            clearInterval(game);
            showGameOver();
            $(document).unbind();
            $(document).keypress(function(){
                $('.gameOver').remove();
                start();
            });   
        }

        function showGameOver(){
            $('.game').append($("<div class = 'gameOver' ></div>").html("GAME OVER"));
        }

        function showScore(){
            score = 0;
            bonus = 1;
            $('.score').remove();
            $('.game').append($("<div class = 'score' ></div>").html("SCORE: "+ score));
        }

        function calcScore(combo){
            // single
            if (combo === 1){
                score+=40*bonus;
                bonus = 1;
            }
            // double
            else if (combo === 2){
                score+=100*bonus;
                bonus = 1.5;
            }
            // triple
            else if (combo === 3){
                score+=300*bonus;
                bonus = 2;
            }
            // TETRIS !!
            else if (combo >= 4){
                score+=1200*bonus;
                bonus = 4;
            }
            else{
                score = score;
            }
            
            // all clear !
            var clearAll = true;
            for( var j=0; j < COL; j++){
                if( field[19][j] !== B_EMPTY ){
                    clearAll = false;
                }
            }
            if ( clearAll ){
                score += 12000;
            }
            
            // change interval
            if( score < 2000 && score > 500){
                setTime(700);
            }
            else if(score > 2000 && score < 5000){
               setTime(600); 
            }
            else if(score > 5000 && score < 10000){
               setTime(500); 
            }
            else if(score > 10000){
               setTime(300); 
            }
            
        }
        function updateScore(){
            $('.score').html("SCORE: "+ score);
        }
        
        function move(key){
            switch(key){
                case KEYS.RIGHT:  // right arrow
                block.xPos++;
                break;
                case KEYS.LEFT: // left arrow
                block.xPos--;
                break;
                case KEYS.DOWN: // down arrow
                block.yPos++;
                break;
            }
       };
           
        function control(key){
            var result;
            clearOld();

            // space - force down
            if(key === KEYS.SPACE){
                do{
                 result = checkPos(KEYS.DOWN);
                    
                 if (result !== STOP){
                     clearOld();
                     move(KEYS.DOWN);
                     updateBoard();
                 }
                }while( result !== STOP);
            }
            // arrow keys
            else{
                result = checkPos(key);
            }
            update(result,key);
        }

        function update(result,key){
            if(result ===  STOP ){
               if ( setBlock() ){
                    endGame();
               }
               else{
                    clearLine(); 
                    makeBlock();
                    updateBoard();
               }
               render();
            }
            else if(result === MOVE){
                switch(key){
                    case KEYS.RIGHT:
                    case KEYS.LEFT: 
                    case KEYS.DOWN: 
                    move(key);
                    break;
                        
                    case KEYS.UP:
                    rotate();
                    break;
                }
                updateBoard();
                render();
          }
        }

     }); 
});     