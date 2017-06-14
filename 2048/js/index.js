document.addEventListener("DOMContentLoaded", function(){
    var game = new GameManager(HTMLRender, InputManager);
});

function Field(location, value, merged){
    this.value = value || (Math.random() < 0.9 ? 2 : 4);
    this.location = {};
    this.location.x = location.x;
    this.location.y = location.y;
    this.merged = merged || false;
}

function GameManager(render, input){

    this.render = new render;
    this.inpute = new input;
    this.gameMap = [];
    this.score = 0;

    this.inpute.move = this.move.bind(this);
    this.inpute.restart = this.restart.bind(this);
    this.inpute.newGame = this.render.newGame.bind(this);

    this.start();
};

GameManager.prototype.start = function(){
    this.buildEmptyGameMap();
    this.addNewField();
    this.addNewField();
}

GameManager.prototype.restart = function(){
    this.render.restart();
    this.score = 0;
    this.start();
}

GameManager.prototype.buildEmptyGameMap = function(){
    for(var i=0; i<4; i++){
        this.gameMap[i] = new Array(4);
        for(var j=0; j<4; j++){
            this.gameMap[i][j] = null;
        }
    }
}

GameManager.prototype.randomEmptyFieldPosition = function(){
    var emptyFields = [];
    for(var i = 0 ; i<this.gameMap.length; i++){
        for(var j = 0; j<this.gameMap.length; j++){
            if(this.gameMap[i][j] === null){
                emptyFields.push({x:i, y:j});
            }
        }
    }
    return emptyFields[Math.floor(Math.random()*emptyFields.length)];
}


GameManager.prototype.addNewField = function(){
    var tile = new Field(this.randomEmptyFieldPosition());
    this.gameMap[tile.location.x][tile.location.y] = tile;
    this.render.addNewSpeck(tile.location, tile.value);
}

GameManager.prototype.move = function(vector){
    var vectorMap = {
        right: { x:1,y:0 },
        left: { x:-1, y:0 },
        up: { x:0, y:-1 },
        down: { x:0, y:1 }
    }

    var moved = false;
    var moveScore = 0;

    switch(vector){
        case 'right':
            for(var j=0; j<4; j++){
                for(var i=2; i > -1; i--){
                    if(this.gameMap[i][j] !== null){
                        var pos = this.findFinalLocation(this.gameMap[i][j], vectorMap[vector]);
                        if(pos){
                            this.render.moveSpeck(this.gameMap[i][j].location, pos);
                            this.actuate(this.gameMap[i][j].location, pos);
                            if(this.gameMap[pos.x][pos.y].merged){
                            	moveScore += this.gameMap[pos.x][pos.y].value;
                            }
                            moved = true;
                        }
                    }
                }
            }
            break;
        case 'left':
            for(var j=0; j<4; j++){
                for(var i=1; i<4; i++){
                    if(this.gameMap[i][j] !== null){
                        var pos = this.findFinalLocation(this.gameMap[i][j], vectorMap[vector]);
                        if(pos){
                            this.render.moveSpeck(this.gameMap[i][j].location, pos);
                            this.actuate(this.gameMap[i][j].location, pos);
                            if(this.gameMap[pos.x][pos.y].merged){
                            	moveScore += this.gameMap[pos.x][pos.y].value;
                            }
                            moved = true;
                        }
                    }
                }
            }
            break;
        case 'up':
            for(var i=0; i<4; i++){
                for(var j=1; j<4; j++){
                    if(this.gameMap[i][j] !== null){
                        var pos = this.findFinalLocation(this.gameMap[i][j], vectorMap[vector]);
                        if(pos){
                            this.render.moveSpeck(this.gameMap[i][j].location, pos);
                            this.actuate(this.gameMap[i][j].location, pos);
                            moved = true;
                            if(this.gameMap[pos.x][pos.y].merged){
                            	moveScore += this.gameMap[pos.x][pos.y].value;
                            }
                        }
                    }
                }
            }
            break;
        case 'down':
            for(var i=0; i<4; i++){
                for(var j=2; j > -1; j--){
                    if(this.gameMap[i][j] !== null){
                        var pos = this.findFinalLocation(this.gameMap[i][j], vectorMap[vector]);
                        if(pos){
                            this.render.moveSpeck(this.gameMap[i][j].location, pos);
                            this.actuate(this.gameMap[i][j].location, pos);
                            if(this.gameMap[pos.x][pos.y].merged){
                            	moveScore += this.gameMap[pos.x][pos.y].value;
                            }
                            moved = true;
                        }
                    }
                }
            }
            break;
    }

    

    if(moved){
        this.render.removeMoveScore();
        this.score += moveScore;
        this.render.updateScore(this.score);
        if(moveScore){
            this.render.addMoveScore(moveScore);
        }
        this.addNewField();
    }
    if(!this.availableMove()){
        this.render.gameOver();
    }
}

GameManager.prototype.findFinalLocation = function(field, vector){
    var next = {};
    next.x = field.location.x + vector.x;
    next.y = field.location.y + vector.y;

    while(this.gameMap[next.x][next.y] === null){
        next.x += vector.x;
        next.y += vector.y;
        if(this.gameMap[next.x] === undefined || this.gameMap[next.x][next.y] === undefined){
            next.x -= vector.x;
            next.y -= vector.y;
            return next;
        }
    }
    if(this.gameMap[next.x][next.y].value !== field.value){
        next.x -= vector.x;
        next.y -= vector.y;
    }
    if(field.location.x === next.x && field.location.y === next.y){ return false; }
    else { return next; }
}

GameManager.prototype.actuate = function(oldPosition, newPosition){
    if(this.gameMap[newPosition.x][newPosition.y] === null){
        this.gameMap[newPosition.x][newPosition.y] =  new Field(newPosition, this.gameMap[oldPosition.x][oldPosition.y].value, false);
    }
    else{
        this.render.sumSpeck(newPosition);
        this.gameMap[newPosition.x][newPosition.y] =  new Field(newPosition, this.gameMap[oldPosition.x][oldPosition.y].value*2, true);
    }
    this.gameMap[oldPosition.x][oldPosition.y]= null;
}

GameManager.prototype.availableMove = function(){
    if(!this.randomEmptyFieldPosition()){
        for(var i=0; i<4; i++){
            for(var j=0; j<4; j++){
                if(this.gameMap[i+1]){
                    if(this.gameMap[i+1][j].value === this.gameMap[i][j].value) { return true; }
                }
                if(this.gameMap[i][j+1]){
                    if(this.gameMap[i][j+1].value === this.gameMap[i][j].value) { return true; }
                }
            }
        }
        return false;
    }
    else { return true; }
}

function HTMLRender(){
    this.gameField = document.getElementsByClassName('tile-wrapper')[0];
    this.gameScore = document.getElementsByClassName('score-count')[0];
    this.scoreWrapper = document.getElementsByClassName('score-wrapper')[0];
}

HTMLRender.prototype.addNewSpeck = function(location, value){
    var newField = document.createElement('div');
    newField.textContent = value;
    newField.classList.add('tile');
    newField.classList.add('tile-position-'+location.x+'-'+location.y);
    newField.classList.add('tile-'+value)
    this.gameField.appendChild(newField);
}

HTMLRender.prototype.moveSpeck = function(startLocation, finishLocation){
    var oldSpeck = this.gameField.getElementsByClassName('tile-position-'+finishLocation.x+'-'+finishLocation.y)[0];
    if(oldSpeck){
        this.gameField.removeChild(oldSpeck);
    }
    var Speck = this.gameField.getElementsByClassName('tile-position-'+startLocation.x+'-'+startLocation.y)[0];
    Speck.classList.remove('tile-position-'+startLocation.x+'-'+startLocation.y);
    Speck.classList.add('tile-position-'+finishLocation.x+'-'+finishLocation.y)
}

HTMLRender.prototype.sumSpeck = function(location){
    var Speck = this.gameField.getElementsByClassName('tile-position-'+location.x+'-'+location.y)[0];
    var value = Speck.textContent;
    Speck.textContent *= 2;
    Speck.classList.remove('tile-'+value);
    Speck.classList.add('tile-'+value*2);
}

HTMLRender.prototype.updateScore = function(score){
    this.gameScore.textContent = score;
}

HTMLRender.prototype.addMoveScore = function(score){
    var self = this;
    var div = document.createElement('div');
    div.textContent = '+' + score;
    div.classList.add('move-score');
    this.scoreWrapper.appendChild(div);
}

HTMLRender.prototype.removeMoveScore =  function(){
    if(this.scoreWrapper.getElementsByClassName('move-score')[0]){
        this.scoreWrapper.removeChild(this.scoreWrapper.getElementsByClassName('move-score')[0]);
    }
}

HTMLRender.prototype.gameOver = function(){
    document.getElementsByClassName('game-over-wrapper')[0].style.display = "block";
}

HTMLRender.prototype.restart = function(){
    this.updateScore(0);
    document.getElementsByClassName('restart-game-wrapper')[0].style.display = "none";
    document.getElementsByClassName('game-over-wrapper')[0].style.display = "none";
    while(this.gameField.lastChild){
        this.gameField.removeChild(this.gameField.lastChild);
    }
}

HTMLRender.prototype.newGame = function (){
    document.getElementsByClassName('restart-game-wrapper')[0].style.display = "block";
}


function InputManager(){
    this.listen();
}

InputManager.prototype.listen = function(){
    var self = this;
    var keyMap = {
        38: "up",
        39: "right",
        40: "down",
        37: "left"
    }

    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX = 0;
    var touchendY = 0;

    document.body.addEventListener('touchmove', function(event){
        event.preventDefault();
    }) //возможно отключает скрол на mobile

    document.getElementsByClassName('restart')[0].addEventListener('click', function(event){
        self.restart();
    })

    document.getElementsByClassName('restart')[1].addEventListener('click', function(event){
        self.restart();
    })

    document.getElementsByClassName('new-game')[0].addEventListener('click', function(event){
        self.newGame();
    })

    document.getElementsByClassName('no-restart')[0].addEventListener('click', function(event){
        document.getElementsByClassName('restart-game-wrapper')[0].style.display = "none";
    })

    document.addEventListener("keyup", function(event){
        if(keyMap[event.keyCode]){
            self.move(keyMap[event.keyCode]);
        }
        if(event.keyCode === 27){
            document.getElementsByClassName('restart-game-wrapper')[0].style.display = "none";
        }
    })

    document.addEventListener('touchstart', function(event) {
        touchstartX = event.changedTouches[0].clientX;
        touchstartY = event.changedTouches[0].clientY;
    });

    document.addEventListener('touchend', function(event) {
        touchendX = event.changedTouches[0].clientX;
        touchendY = event.changedTouches[0].clientY ;
        swipe();
    });

    function swipe(){
        if (touchendX < touchstartX && (Math.abs(touchstartX-touchendX) > Math.abs(touchstartY-touchendY))) {
            self.move("left");
        }
        else if (touchendX > touchstartX && (Math.abs(touchstartX-touchendX) > Math.abs(touchstartY-touchendY))) {
            self.move("right");
        }
        else if (touchendY < touchstartY) {
            self.move("up");
        }
        else if (touchendY > touchstartY) {
            self.move("down");
        }
    }
}

