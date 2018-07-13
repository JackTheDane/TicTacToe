// Modularization for better encapsulation

// Controller for handling the inner workings of the game
let gameController = (function () {
  let curPlayer, gameRunning = true, aFields, players;

  aFields = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1
  ]

  function Player(number) {
    this.number = number;
    this.score = 0;
  }

  Player.prototype.increaseScore = function(){
    this.score++;
  };

  players = {
    1: new Player(1),
    2: new Player(2)
  }

  var switchPlayer = () => {
    if( curPlayer === players[1] ){
      curPlayer = players[2];
    } else if ( curPlayer === players[2] ){
      curPlayer = players[1];
    } 
  }

  return {
    init: () => {
      curPlayer = players[1];
    },

    setFieldValue: (id) => {
      aFields[id] = aFields[id] === -1 ? curPlayer : aFields[id]; // Checks if the field has not already been set ( === -1), and else sets it
    },

    checkForWinCondition: () => {

      let gameInfo = { // Object to be returned
        gameWon: false
      };

      // Function for setting the game to having been won
      let checkFieldsForWin = (firstFieldId, midFieldId, lastFieldId) => { 
        
        if( aFields[firstFieldId] !== -1 && aFields[midFieldId] === aFields[firstFieldId] && aFields[lastFieldId] === aFields[firstFieldId] ){ // Check that the fieldIds are set and equal to each other
          gameInfo.gameWon = true;
          gameInfo.firstFieldId = firstFieldId;
          gameInfo.lastFieldId = lastFieldId;

          players[ curPlayer.number ].increaseScore();
        }
        
      };

      // Horizontal
      checkFieldsForWin( 0, 1, 2 );
      checkFieldsForWin( 3, 4, 5 );
      checkFieldsForWin( 6, 7, 8 );

      // Vertical
      checkFieldsForWin( 0, 3, 6 );
      checkFieldsForWin( 1, 4, 7 );
      checkFieldsForWin( 2, 5, 8 );

      // Diagonal
      checkFieldsForWin( 0, 4, 8 );
      checkFieldsForWin( 2, 4, 6 );

      return gameInfo;
    },

    getCurrentPlayer: () => curPlayer.number,

    switchTurns: () => {
      switchPlayer();
    }
  }
})();


// Controller for handling manipulation of the DOM
let UIController = (function () {
  
  let DOMselectors = {
    title: '.title',
    gameboard: '.gameboard',
    player1Score: '.score__player1',
    player2Score: '.score__player2',
    winLine: '.gameboard__win-line'
  }

  let nodeModules = { // All of the nodemodules that are used repeatedly
    title: document.querySelector( DOMselectors.title ),
    gameboard: document.querySelector( DOMselectors.gameboard ),
    player1Score: document.querySelector( DOMselectors.player1Score ),
    player2Score: document.querySelector( DOMselectors.player2Score ),
    winLine: document.querySelector( DOMselectors.winLine )
  }

  let crossWinLine = (playerNum, firstFieldId, lastFieldId) => {
    let svgLine, boardDimensions;

    svgLine = document.querySelector( DOMselectors.winLine + ' line' ); // Get the line inside the SVG
    console.log('svgLine: ', svgLine);

    // 1. Get gameboard dimensions
    boardDimensions = {
      height: nodeModules.gameboard.clientHeight,
      width: nodeModules.gameboard.clientWidth
    }

    // 2. Set SVG dimensions
    nodeModules.winLine.setAttribute('height', boardDimensions.height);
    nodeModules.winLine.setAttribute('width', boardDimensions.width);

    // 3. Calculate line coordinates
    let x1, x2, y1, y2, y1Temp, y2Temp;

    // Using modulus, the x coordinates are calculated
    // IE. 0 -> 1/6
    // 1 -> 3/6
    // 2 -> 5/6

    x1 = ((1 + (firstFieldId%3)*2)/6) * boardDimensions.width;
    x2 = ((1 + (lastFieldId%3)*2)/6) * boardDimensions.width;

    // Vertical
    // Under 3 -> First line
    // More than 2 and under 6 -> Second line
    // Over or equal to 6 -> Third line
    if( firstFieldId < 3 ){
      y1Temp = 0;
    } else if( firstFieldId >= 3 && firstFieldId < 6 ){
      y1Temp = 1;
    } else if( firstFieldId >= 6 ){
      y1Temp = 2;
    }

    if( lastFieldId < 3 ){
      y2Temp = 0;
    } else if( lastFieldId >= 3 && lastFieldId < 6 ){
      y2Temp = 1;
    } else if( lastFieldId >= 6 ){
      y2Temp = 2;
    }

    y1 = ((1 + y1Temp*2)/6) * boardDimensions.height;
    y2 = ((1 + y2Temp*2)/6) * boardDimensions.height;

    // 4. Set line positions

    svgLine.setAttribute('x1', x1);
    svgLine.setAttribute('x2', x2);

    svgLine.setAttribute('y1', y1);
    svgLine.setAttribute('y2', y2);

    // 5. Set line color
    if( playerNum === 1 ){
      svgLine.setAttribute('stroke', 'blue')
    } else if ( playerNum === 2 ){
      svgLine.setAttribute('stroke', 'red')
    }

  }

  return {
    init: () => {
      nodeModules.gameboard.dataset.currentPlayer = 1;
      nodeModules.gameboard.classList.remove('gameWon')
      nodeModules.title.dataset.currentPlayer = 1;
      nodeModules.title.textContent = "Player 1's turn";
      nodeModules.player1Score.textContent = 0;
      nodeModules.player2Score.textContent = 0;
    },

    getDOMSelectors: () => DOMselectors, // Return DOMSelectors for other controllers to use

    markField: (fieldId, player) => {
      let tile;

      if( player === 1 ){
        tile = 'circle'
      } else if ( player === 2 ) {
        tile = 'cross'
      }

      document.getElementById(fieldId).dataset.tile = tile;
    },

    switchTurns: (previousPlayer) => { // Turn switches to the opposite of the previous player number
      let currentPlayer, playerTitle;

      // 0.5. Set classes and strings based on previous player number
      if( previousPlayer === 1 ){
        playerTitle = "Player 2's turn";
        currentPlayer = 2;
      } else if ( previousPlayer === 2 ){
        playerTitle = "Player 1's turn";
        currentPlayer = 1;
      }

      // 1. Switch player class for title & gameboard
      nodeModules.title.dataset.currentPlayer = currentPlayer;
      nodeModules.gameboard.dataset.currentPlayer = currentPlayer;

      // 2. Change title content to reflect current player turn
      nodeModules.title.textContent = playerTitle;
    },

    gameWon: (playerNumber, firstFieldId, lastFieldId) => {
      let playerScore;

      // 1. set title
      nodeModules.title.textContent = 'Player ' + playerNumber + ' wins!';

      // 2. Add gameWon class
      nodeModules.gameboard.classList.add('gameWon');

      // 3. Increase player score
      playerScore = nodeModules['player'+ playerNumber +'Score'];
      playerScore.textContent = parseInt( playerScore.textContent ) + 1;

      // 4. Cross over winning fields
      crossWinLine(playerNumber, firstFieldId, lastFieldId);

      // 5. Display rematch button

    }
  }

})();


// Controller for connecting other controllers between each other and the DOM
let controller = (function (gameCtrl, UICtrl) {
  let selectors, gameRunning = true;

  selectors = UICtrl.getDOMSelectors(); // Get the DOM Selectors
  // currentPlayer = gameCtrl.getCurrentPlayer() // Get current player number

  let beginEventListeners = () => { // Function for setting up event listeners
    document.querySelector(selectors.gameboard).addEventListener('click', e => {
      
      if( e.target.classList.contains('gameboard__field') && gameRunning ){ // Check if the targeted element was a gameboard field
        let fieldId, id, playerNum, gameInfo;

        fieldId = e.target.id;
        id = fieldId.split('-')[1];
        playerNum = gameCtrl.getCurrentPlayer();

        // 1. Mark the field clicked with the correct player tile
        gameCtrl.setFieldValue(id); // Mark the field in the game controller
        UICtrl.markField(fieldId, playerNum); // Mark the field

        // 2. Check for win condition
        gameInfo = gameCtrl.checkForWinCondition();

        if( gameInfo.gameWon ){
          gameRunning = false;

          UICtrl.gameWon(playerNum, gameInfo.firstFieldId, gameInfo.lastFieldId);
        
        } else { // Switch turns if game not already won

          // 3. Switch turns
          gameCtrl.switchTurns();
          UICtrl.switchTurns(playerNum); // Pass the current player number to the UI
        }

      }
        
    });
  };

  return {
    init: () => {
      beginEventListeners();

      gameCtrl.init();
      UIController.init();

    }
  }
  
})(gameController, UIController);

controller.init(); // Initialize the game