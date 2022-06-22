var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = '⛔'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var gBallInterval;
var gGlueInterval;
var gBallColected
var gBallCounter
var gGlueStuck

var gBallCollectSound = new Audio('audio/ballCollect.mp3')
var gOnGlueSound = new Audio('audio/glue.wav')

function initGame() {
	
	gBallColected = 0
	gBallCounter = 2
	gGlueStuck = false
	gGamerPos = { i: 2, j: 9 };

	gBoard = buildBoard();
	renderBoard(gBoard);
	gBallInterval = setInterval(getRndBall,2000)
	gGlueInterval = setInterval(getRndGlue,5000)
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			// Add created cell to The game board
			board[i][j] = cell;
			// The Passages
			board[0][5].type = FLOOR
			board[9][5].type = FLOOR 
			board[5][0].type = FLOOR
			board[5][11].type = FLOOR
		}
	}
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	board[3][5].gameElement = BALL
	board[6][2].gameElement = BALL

	return board;
}
// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {

			var currCell = board[i][j];
			var cellClass = getClassName({ i: i, j: j })
			// TODO - change to short if statement
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall'
			///TODO - Change To template string
			strHTML += `\t<td class="cell ${cellClass}" 
			onclick="moveTo(${i},${j})">\n`;
			// TODO - change to switch case statement
			switch(currCell.gameElement){

				case GAMER: strHTML += GAMER_IMG;
				break;
				case BALL: strHTML += BALL_IMG;
				break;
			}

			strHTML += '\t</td>\n';
		}

		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

function getRndBall(){
	
	var cells = findEmptyCells()
	if(cells === null) return

	var rndLocation = getRandomInt(0,cells.length)
	var i = cells[rndLocation].i
	var j = cells[rndLocation].j

	gBoard[i][j].gameElement = BALL
	gBallCounter++
	
	renderCell({i,j},BALL_IMG)
}

function getRndGlue(){

	var cells = findEmptyCells()
	if(cells === null) return

	var rndLocation = getRandomInt(0,cells.length)
	var i = cells[rndLocation].i
	var j = cells[rndLocation].j

	gBoard[i][j].gameElement = GLUE
		
	renderCell({i,j},GLUE)

	setTimeout(()=>{
		if(gGamerPos.i === i && gGamerPos.j === j){
			gBoard[i][j].gameElement = GAMER;
			renderCell(gGamerPos,GAMER_IMG)
		} else {
			gBoard[i][j].gameElement = null
			renderCell({i,j},null)
		}
		// gGlueStuck = false
	},3000)
}

function findEmptyCells(){
	
	var emptyCells = []
	for(var i=0; i < gBoard.length; i++){
		for(var j=0; j < gBoard[0].length ; j++){
			var	cell = gBoard[i][j]

			if(cell.type === FLOOR && !cell.gameElement) emptyCells.push({i,j})
		}
	}

	if(emptyCells.length === 0) {gameOver();return null}
	return emptyCells
}

// Move the player to a specific location
function moveTo(i, j) {

	if(gGlueStuck) return

	if(i === -1) i = 9
	if(i === 10) i = 0
	if(j === -1) j = 11
	if(j === 12) j = 0

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
	|| (iAbsDiff === 9 && jAbsDiff === 0) || (iAbsDiff === 0 && jAbsDiff === 11)) {

		if (targetCell.gameElement === BALL) {
			gBallCollectSound.play()
			gBallColected++
			editScore()
			
			if (gBallCounter - gBallColected === 0){
				restartWinner()
			}
		}

		if(targetCell.gameElement === GLUE) {
			gOnGlueSound.play()
			gGlueStuck = true
			setTimeout(()=>{
				gGlueStuck = false
			},3000)
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);
	} 
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	console.log('value',value,'location',location,'gBallColected=',gBallColected,'gBallCounter=',gBallCounter);
	elCell.innerHTML = value;
}
function editScore(){
	var elScoreSpan = document.querySelector('.score span')
	elScoreSpan.innerText = gBallColected
}

function restartWinner(){

	clearInterval(gBallInterval)
	clearInterval(gGlueInterval)
	// alert('You Won')
	var elRestart = document.querySelector('.restart')
	elRestart.style.opacity = 1

	var elRestartWinner = document.querySelector('.winner')
	elRestartWinner.style.opacity = 1
	elRestartWinner.innerText = `You won!! You have collected ${gBallColected} balls`
}
function gameOver(){

	var elBoard = document.querySelector('.board')
	elBoard.innerHTML = `<h1>You Lost</h1>`

	clearInterval(gBallInterval)
	clearInterval(gGlueInterval)
}

function restart(){

	var elScoreSpan = document.querySelector('.score span')
 	elScoreSpan.innerText = 0

	var elRestartWinner = document.querySelector('.winner')
	elRestartWinner.style.opacity = 0

	var elRestart = document.querySelector('.restart')
	elRestart.style.opacity = 0

	initGame()
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

