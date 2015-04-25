//	Enemies our player must avoid.
var Enemy = function() {
    //	Randomly select an enemy.
	var number = randomNumber(0, (array_enemyImages.length));
	this.sprite = array_enemyImages[number];
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
	if (!pause) {
		//	Multiply movement by the dt parameter to ensure 
		//	the game runs at same speed on all computers.
		this.x += dt * this.speed;

		if (this.x > 505)
			this.init();

		if (this.y > 400)
			this.init();

		if (array_availableRows.indexOf(this.y) < 0)
			this.init();
	}
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Enemy.prototype.init = function () {
	this.x = randomNumber(-250, -100);
	this.y = randomRow();
	this.speed = enemySpeed();

	var number = randomNumber(0, (array_enemyImages.length));
	this.sprite = array_enemyImages[number];
}


var Game = function () {
	
}

Game.prototype.init = function () {
	var $startScreen = document.createElement('div');
	$startScreen.id = 'startScreen';
	document.body.appendChild($startScreen);

	var $title = document.createElement('div');
	$title.id = 'title';
	$startScreen.appendChild($title);
	var textNode = document.createTextNode('Frogger');
	$title.appendChild(textNode);

	var $description = document.createElement('div');
	$description.id = 'description';
	$startScreen.appendChild($description);
	var textNode = document.createTextNode('Help George avoid the cars and get to the other side. Jump on the rocks to cross the river!');
	$description.appendChild(textNode);

	var $instructions = document.createElement('div');
	$instructions.id = 'instructions';
	$startScreen.appendChild($instructions);
	var textNode = document.createTextNode('Use arrow keys to move. Press spacebar to pause the game.');
	$instructions.appendChild(textNode);

	var $resetText = document.createElement('div');
	$resetText.id = 'resetText';
	$startScreen.appendChild($resetText);
	var textNode_resetText = document.createTextNode('Press Space To Start!');
	$resetText.appendChild(textNode_resetText);
}

Game.prototype.start = function (elementID) {
	var snd = new Audio('sounds/dp_frogger_extra.wav');
	snd.play();

	setTimeout(
		function () {
			gameStart = true;
			setDefaults(),
			resetGame();
			var element = document.getElementById(elementID);
			element.parentNode.removeChild(element);
		}, 2000);
}


var Lives = function (x) {
	this.sprite = 'images/george.png';
	this.x = x;
	this.y = -40;
	this.width = 60;
	this.height = 102;
}

Lives.prototype.render = function () {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
};

Lives.prototype.init = function() {
	array_playerLives = [];
	
	//	start with 3 lives
	for (var i = 0; i < numLives; i++) {
		array_playerLives.push(new Lives(i * 40));
	}
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function () {
	this.sprite = 'images/george.png';
	this.soundLevelUp = new Audio('sounds/dp_frogger_coin.wav');
	this.soundMove = new Audio('sounds/dp_frogger_hop.wav');
	this.soundSquash = new Audio('sounds/dp_frogger_squash.wav');
	this.soundSplash = new Audio('sounds/dp_frogger_plunk.wav');
	this.soundMove.preload = true;
}

Player.prototype.checkLives = function()
{
	if (array_playerLives.length > 1) {
		//	Remove 1 life and reset the game.
		numLives--;
		array_playerLives.pop();

		resetGame(level);
	}
	else
		gameOverScreen();
}

Player.prototype.handleInput = function(keyCode) {
	var currentX = this.x;
	var currentY = this.y;
	var text_score;

	switch (keyCode) {
		case 'left':
			if (pause == false && gameOver == false) {
				if (currentX > 100)
				{
					this.soundMove.play();
					this.x = this.x - 101;
					text_score = increaseScore();
					document.getElementById("score").innerHTML = text_score;
					columnIndex--;
				}
			}

			break;
		case 'right':
			if (pause == false && gameOver == false) {
				if (currentX < 400) {
					this.soundMove.play();
					this.x = this.x + 101;
					text_score = increaseScore();
					document.getElementById("score").innerHTML = text_score;
					columnIndex++;
				}
			}
			break;
		case 'up':
			if (pause == false && gameOver == false) {
				this.soundMove.play();
				rowCount = (rowCount < 10) ? rowCount + 1 : rowCount;

				if (rowCount < 10) {
					if (this.y > 156)
						this.y = this.y - 83, rowIndex--;
					else if (this.y == 156 && rowCount > 8)
						this.y = this.y - 83, rowIndex--;
					else if (this.y == 156 && rowCount > 3)
						shiftScreen(1);

					text_score = increaseScore();
					document.getElementById("score").innerHTML = text_score;
				}
				else
					this.y = this.y - 83, rowIndex--, completeLevel();
			}
			break;
		case 'down':
			if (pause == false && gameOver == false) {
				this.soundMove.play();
				rowCount = (rowCount > 0) ? rowCount - 1 : rowCount;

				if (rowCount >= 0 && this.y != 405) {
					if (this.y < 239 || this.y == 322)
						this.y = this.y + 83, rowIndex++;
					else if (this.y == 239 && rowCount < 2)
						this.y = this.y + 83, rowIndex++;
					else if (this.y == 239)
						shiftScreen(-1);

					text_score = increaseScore();
					document.getElementById("score").innerHTML = text_score;
				}
			}
			break;

		case 'space':
			if (!gameStart) {
				game.start('startScreen');
			}
			else if (gameOver) {
				game.start('gameOverWrapper');
			}
			else
				pause = (pause == true) ? false : true;
				

			break;
		default:

			break;
	}

	if (!gameOver) {
		if (rowImages[rowIndex].toString().indexOf('water') > 0 && array_missingStone.indexOf(columnIndex) >= 0) {
			pause = true;
			var timeOut = 0;
			player.sprite = 'images/splash.png';

			if (array_playerLives.length > 1)
				this.soundSplash.play(), timeOut = 1000;

			setTimeout(function () {
				player.checkLives();
			}, timeOut);
		}

		player.render();
	}
}

Player.prototype.render = function () {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.update = function () {
	checkCollisions();
}

Player.prototype.init = function () {
	this.x = 205;
	this.y = 405;
}

var Scoreboard = function () {
	var $scoreboardWrapper = document.createElement('div');
	$scoreboardWrapper.id = 'scoreboardWrapper';
	document.body.appendChild($scoreboardWrapper);
	
	var array_scoreBoardElements = new Array('score', 'level');

	for (var i = 0; i < array_scoreBoardElements.length; i++) {
		var element = '';
		element = array_scoreBoardElements[i];

		var $wrapper = document.createElement('div')
		$wrapper.id = element + 'Wrapper';
		$scoreboardWrapper.appendChild($wrapper);

		var lbl = element.toUpperCase() + ':';
		var textNode = document.createTextNode(lbl);
		$wrapper.appendChild(textNode);

		var $childElement = document.createElement('div');
		$childElement.id = element;
		$wrapper.appendChild($childElement);
	}

	var $score = document.getElementById('score');
	var startingScore = score;
	var textNode_startingScore = document.createTextNode(startingScore);
	$score.appendChild(textNode_startingScore);

	var $level = document.getElementById('level');
	var startingLevel = level;
	var textNode_startingLevel = document.createTextNode(startingLevel);
	$level.appendChild(textNode_startingLevel);
}



function addMissingStone()
{
	if(array_missingStone.length < 4)
	{
		var missingStone = randomNumber(0, 5);
		if (array_missingStone.indexOf(missingStone) < 0)
			array_missingStone.push(missingStone);
		else
			addMissingStone();
	}
}


//	Checks for player/bug and player/friend collisions. 
function checkCollisions() {
	if (array_allEnemies.length >= 1) {
		array_allEnemies.forEach(function (enemy) {
			//Check location of all enemies against player location
			//reset player if collision
			if (player.y === enemy.y && player.x < (enemy.x + 80)) {
				if (player.x > (enemy.x - 80)) {
					var timeOut = 0;

					player.x = 1000;
					player.y = 405;
					pause = true;

					if (array_playerLives.length > 1)
						player.soundSquash.play(), timeOut = 1000;

					setTimeout(function () {
						player.checkLives();
					}, timeOut);
				};
			}
		})
	}
}

function completeLevel() {
	pause = true;
	player.soundLevelUp.play();

	setTimeout(function () {
		increaseScore(1);
		level++;
		document.getElementById("level").innerHTML = level;

		var numStones = array_missingStone.length;
		array_missingStone.length = 0;

		for (var i = 0; i < numStones; i++)
		{
			addMissingStone();
		}

		//	Every 5 levels we'll add another enemy.
		//	We'll also remove a stone (max 4 stones removed).
		if (level % 5 == 0) {
			var enemy = new Enemy();
			enemy.init();
			array_allEnemies.push(enemy);

			addMissingStone();
		}

		if (level % 10 == 0)
			speedMultiplier++;

		resetScreen();
	}, 2000);
}

function enemySpeed()
{
	var randomAdjuster = randomNumber(-100, 50);
	return (speedMultiplier * level) + randomAdjuster + 200;
}


function gameOverScreen()
{
	var snd = new Audio('sounds/dp_timepilot_killed.wav');
	snd.play();
	gameOver = true;

	var $gameOverWrapper = document.createElement('div');
	$gameOverWrapper.id = 'gameOverWrapper';
	document.body.appendChild($gameOverWrapper);
	var textNode = document.createTextNode('Game Over');
	$gameOverWrapper.appendChild(textNode);

	var $finalScoreWrapper = document.createElement('div');
	$finalScoreWrapper.id = 'finalScore';
	$gameOverWrapper.appendChild($finalScoreWrapper);
	var textNode_finalScore = document.createTextNode('Final score: '+ score.toString());
	$finalScoreWrapper.appendChild(textNode_finalScore);

	var $resetText = document.createElement('div');
	$resetText.id = 'resetText';
	$gameOverWrapper.appendChild($resetText);
	var textNode_resetText = document.createTextNode('Press Space To Play Again');
	$resetText.appendChild(textNode_resetText);
}


function increaseScore(levelUp) {
	if (levelUp) {
		score = parseInt(score) + 50;

		if (level > 10 && level % 10 == 0)
			score = parseInt(score) + (100 * (level / 10));
	}
	else
		score = parseInt(score) + (5 * level);

	return score;
}

function randomNumber(min, max)
{
	return Math.floor(Math.random() * (max - min)) + min;
}

function randomRow()
{
	var row = Math.floor(Math.random() * array_availableRows.length);
	return array_availableRows[row];
}

function resetGame(currentLevel)
{
	pause = false;

	if (currentLevel > 0)
	{
		level = currentLevel;
	}
	else
	{
		level = 1;
		document.getElementById("level").innerHTML = level;
		array_missingStone = [randomNumber(0, 4)];

		var numEnemies = array_allEnemies.length;

		if (numEnemies > startingBugCount) {
			var numRemoved = numEnemies - startingBugCount;
			array_allEnemies.splice(startingBugCount, numRemoved);
		}
	}

	resetScreen();
}

function resetScreen()
{
	player.sprite = 'images/george.png';
	pause = false;
	shiftScreenCount = 0;
	rowCount = 0;
	rowIndex = 5;
	columnIndex = 2;

	rowImages = [
		'images/water-block.png',   // Top row is water
        'images/stone-block.png',   // Row 1 of 3 of stone
        'images/stone-block.png',   // Row 2 of 3 of stone
        'images/stone-block.png',   // Row 3 of 3 of stone
        'images/grass-block.png',   // Row 1 of 2 of grass
        'images/grass-block.png'    // Row 2 of 2 of grass
	],
	numRows = 6,
	numCols = 5,
	row, col;

	array_availableRows = [239, 156, 73];

	if (array_allEnemies.length >= 1) {
		array_allEnemies.forEach(function (enemy) {
			enemy.init();
		});
	}

	player.x = 205;
	player.y = 405;
}

function shiftScreen(shiftValue)
{
	var adjustRows = 83 * shiftValue;

	//	Change the rows of the enemies
	if (array_allEnemies.length >= 1) {
		array_allEnemies.forEach(function (enemy) {
			if (enemy.y < 0 && shiftValue < 0)
				enemy.init();
			else if (enemy.y > 390 && shiftValue > 0)
				enemy.init();
			else
				enemy.y = enemy.y + adjustRows;
		})
	}

	var array_newRows = [
		'images/water-block.png',	//	Row of water
		'images/stone-block.png',   //	Row 1 of 3 of stone
		'images/stone-block.png',   //	Row 2 of 3 of stone
		'images/stone-block.png',   //	Row 3 of 3 of stone
		'images/grass-block.png'	//	Top row is grass. Passes level.
	];

	if (shiftValue > 0)
		rowImages.unshift(array_newRows[shiftScreenCount]);
	else
		rowImages.shift();

	shiftScreenCount += shiftValue;
}



// Now instantiate your objects.
// Place all enemy objects in an array called array_allEnemies
// Place the player object in a variable called player
var array_allRows = [-10, 73, 156, 239, 322, 405];
var array_availableRows = [239, 156, 73];
var array_allEnemies = [];
var array_playerLives = [];
var array_missingStone = [randomNumber(0,4)];

var array_enemyImages = [
	'images/enemy-ambulance.png',
	'images/enemy-cab.png',
	'images/enemy-cop.png',
	'images/enemy-firetruck.png'
];

var level = 1;
var numBugs = 5;
var startingBugCount = 5;
var rowCount = 0;
var rowIndex = 5;
var columnIndex = 2;
var shiftScreenCount = 0;
var speedMultiplier = 1;
var numLives = 3;
var score = 0;
var pause = false;
var gameOver = true;
var gameStart = false;

for (var i = 0; i < numBugs; i++) {
	var enemy = new Enemy();
	enemy.init();
	array_allEnemies.push(enemy);
}

function setDefaults()
{
	array_availableRows = [239, 156, 73];
	array_missingStone = [randomNumber(0, 4)];
	level = 1;
	numBugs = 3;
	startingBugCount = 3;
	rowCount = 0;
	rowIndex = 5;
	columnIndex = 2;
	shiftScreenCount = 0;
	speedMultiplier = 1;
	numLives = 3;
	score = 0;
	pause = false;
	gameOver = false;

	document.getElementById("score").innerHTML = score;

	lives.init();
	player.init();
}

var player = new Player();
var lives = new Lives();
var scoreboard = new Scoreboard();
var game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});