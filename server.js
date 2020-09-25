// server.js
 
const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 8080 })
 
wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  ws.send('Hello! Message From Server!!')
})

let state = {
    round: 1,
    lives: 0,
    stars: 1,
    deck: [],
    hands: []
}

const express = require('express')
const app = express()
const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })

shuffle = () => {
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

setPlayers = (playerQty, state) => {
    if (playerQty >= 2 && playerQty <= 4) {
        const newState = {...state};
        for (let i=0; i<playerQty; i++) {
            newState.hands.push([]);
            newState.lives++;
            console.log('here');
        }
        console.log(newState);
        return newState
    } else {
        // Error: Incorrect player quantity
        return null
    }
}

playCard = (playerIndex, state) => {
    let newState = {...state};
    const card = newState.hands[playerIndex][0];
    let loseLife = false;
    newState.hands[playerIndex].shift();
    for (let i=0; i<newState.hands.length; i++) {
        if (card > newState.hands[i][0]) {
            loseLife = true;
        }
    }
    if (loseLife) {
        newState = lostLife(card, newState);
    }
    if (!newState.hands.flat().length) {
        newState.round++;
        if (newState.round === 13) {
            endGame(true);
        } else {
            newState = addRewards(newState);
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

lostLife = (card, state) => {
    const newState = {...state};
    newState.lives--;
    console.log('That was not the lowest card');
    if (newState.lives > 0) {
        for (let i=0; i<newState.hands.length; i++) {
            newState.hands[i] = newState.hands[i].filter(item => item > card);
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

state.deck = shuffle();

console.log(state);

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
  
readline.question('How many players? ', num => {
console.log(`There are ${num} players.`);
state = setPlayers(num, state);
console.log(state);
state = dealCards(state);
state = playCard(1, state);
console.log(state);
readline.close();
});

app.get('/', function (req, res) {
    // do something here
  })


// Set initial state // DONE
// Input players // DONE
// Set lives // DONE
// While rounds < 13
    // If lives > 0
        // Generate hands // DONE
        // While cards played < players
            // Play cards (decrement lives) // DONE
            // Or play star
        // Increment round // DONE
        // Administer rewards // DONE
    // Else You lose
// You win