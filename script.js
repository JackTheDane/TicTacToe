// Modularization for better encapsulation

// Controller for handling the inner workings of the game
let gameController = (function () {
  let curPlayer = 1;

  let switchPlayer = () => {
    if( curPlayer === 1 ){
      curPlayer = 2;
    } else if ( curPlayer === 2 ){
      curPlayer = 1;
    } 
  }

  return {
    getCurrentPlayer: () => curPlayer,
    switchTurns: () => {
      switchPlayer();
    }
  }
})();


// Controller for handling manipulation of the DOM
let UIController = (function () {
  
  let DOMselectors = {
    title: '.title',
    gameboard: '.gameboard'
  }

  return {
    getDOMSelectors: () => DOMselectors, // Return DOMSelectors for other controllers to use

    markField: (fieldId, player) => {

      if( player === 1 ){
        document.getElementById(fieldId).dataset.tile = 'circle'
      } else if ( player === 2 ) {
        document.getElementById(fieldId).dataset.tile = 'cross'
      }
    }
  }

})();


// Controller for connecting other controllers between each other and the DOM
let controller = (function (gameCtrl, UICtrl) {
  let selectors;

  selectors = UICtrl.getDOMSelectors(); // Get the DOM Selectors
  // currentPlayer = gameCtrl.getCurrentPlayer() // Get current player number

  let beginEventListeners = () => { // Function for setting up event listeners
    document.querySelector(selectors.gameboard).addEventListener('click', e => {
      
      if( e.target.classList.contains('gameboard__field') ){
        let fieldId, id, playerNum;

        fieldId = e.target.id;
        id = fieldId.split('-')[1];
        playerNum = gameCtrl.getCurrentPlayer();

        UICtrl.markField(fieldId, playerNum); // Mark the field
        gameCtrl.switchTurns();
      }
        
    });
  };

  return {
    init: () => {
      beginEventListeners();

      console.log( document.querySelector(selectors.title) );
    }
  }
  
})(gameController, UIController);

controller.init(); // Initialize the game