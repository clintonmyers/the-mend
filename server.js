// server.js

// WEBSOCKETS
const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 8080 })

let clients = [];

wss.on('connection', ws => {
  clients.push(ws);
  ws.on('message', message => {
    sendState = () => {
      console.log('sending state');
      console.log(state);
      clients.forEach(client => {
        client.send(JSON.stringify(state));
      });
    }
    
    let json = JSON.parse(message);
    if (json.action) {
      if (json.action === 'update') {
        sendState();
      } else if (json.action === 'playCard') {
        state = playCard(json.playerIndex, state);
        sendState();
      } else if (json.action === 'playStar') {
        state = playStar(state);
        sendState();
      } else if (json.action === 'startGame') {
        state.deck = shuffle();
        state = dealCards(state);
        sendState();
      }
    }
  });
})

// EXPRESS
const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;

// SERVE STATIC ASSETS
app.use('/', router);
app.use(express.static('public'))
var server = app.listen(port, function () {
  console.log('node.js static server listening on port: ' + port)
});

// API
app.get('/join-game', (req, res) => {
  if (state.hands.length < 4) {
    state = addPlayer(state);
    console.log('New Player');
    console.log(state);
    res.status(301).redirect(`http://localhost:3000/game.html?player=${state.hands.length - 1}`);    
  } else {
    console.log('New Spectator');
    res.redirect(`http://localhost:3000/game.html`);
  }
});

// GAME
const initialState = {
    round: 1,
    lives: 0,
    stars: 1,
    deck: [],
    hands: [],
    card: null
}

let state = initialState;

shuffle = () => {
    console.log('Shuffling...');
    const arr = [];
    for (let i=1; i<=100; i++) {
        arr.push(i);
    }
    return arr;
}

randomNum = (x) => Math.floor(Math.random()*x);

drawCard = (playerIndex, state) => {
    const newState = {...state};
    const deckIndex = randomNum(newState.deck.length);
    newState.hands[playerIndex].push(newState.deck[deckIndex]);
    newState.deck.splice(deckIndex, 1);
    return newState;
}

dealCards = (state) => {
    let newState = {...state};
    for (let i=0; i<newState.round; i++) {
        for (let j=0; j<newState.hands.length; j++) {
            newState = drawCard(j, newState);
        }
    }
    newState.hands = sortArrOfArrs(newState.hands);
    return newState;
}

sortArrOfArrs = (arrays) => {
    const newArrays = arrays;
    for (let i=0; i<newArrays.length; i++) {
        newArrays[i].sort();
    }
    return newArrays;
}

addPlayer = (state) => {
    const newState = {...state};
    newState.hands.push([]);
    newState.lives++;
    return newState;
}

playCard = (playerIndex, state) => {
    let newState = {...state};
    newState.card = newState.hands[playerIndex][0];
    let loseLife = false;
    newState.hands[playerIndex].shift();
    for (let i=0; i<newState.hands.length; i++) {
        if (newState.card > newState.hands[i][0]) {
            loseLife = true;
        }
    }
    if (loseLife) {
        newState = lostLife(newState);
    }
    if (!newState.hands.flat().length) {
        newState.round++;
        if (newState.round === 13) {
            endGame(true);
        } else {
            newState.card = null;
            newState = addRewards(newState);
            newState.deck = shuffle();
            newState = dealCards(newState);
        }
    }
    return newState;
}

playStar = (state) => {
    const newState = {...state};
    newState.stars--;
    newState.hands.forEach(arr => {
        arr.shift();
    });
}

lostLife = (state) => {
    const newState = {...state};
    newState.lives--;
    console.log('That was not the lowest card');
    if (newState.lives > 0) {
        for (let i=0; i<newState.hands.length; i++) {
            newState.hands[i] = newState.hands[i].filter(item => item > newState.card);
        }
    } else {
        endGame(false);
    }
    return newState;
}

endGame = (win) => {
    if (win) {
        console.log('YOU WIN');
    } else if (!win) {
        console.log('GAME OVER');
    }
}

addRewards = (state) => {
    newState = {...state};
    if (
        newState.round === 3 ||
        newState.round === 6 ||
        newState.round === 9
        ) { newState.lives++; }
    if (
        newState.round === 2 ||
        newState.round === 5 ||
        newState.round === 8
        ) { newState.stars++; }
    return newState;
}

// Set initial state // DONE
// Input players // DONE
// Set lives // DONE
// While rounds < 13
    // If lives > 0
        // Generate hands // DONE
        // While cards played < players
            // Play cards (decrement lives) // DONE
            // Or play star // DONE
        // Increment round // DONE
        // Administer rewards // DONE
    // Else You lose
// You win