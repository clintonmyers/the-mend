const paramArr = document.URL.split('?');
const queryParam = paramArr[paramArr.length - 1];
const queryArr = queryParam.split('=');
const playerIndex = queryArr[1];

class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};

      this.reset = this.reset.bind(this);
      this.startGame = this.startGame.bind(this);
      this.playCard = this.playCard.bind(this);
      this.playStar = this.playStar.bind(this);
    }

    connection;

    componentDidMount() {
      console.log(this.connection);
      this.connection = new WebSocket('ws://localhost:8080');

      this.connection.onopen = () => {
          console.log(this.connection);
          this.connection.send(JSON.stringify({ action: 'update' }));
      }
      
      this.connection.onerror = (error) => {
          console.log(`WebSocket error: ${error}`)
      }
      
      this.connection.onmessage = (e) => {
        const newState = JSON.parse(e.data);
        if (newState.status === 'win') {
          window.alert('Congrats! You won the game!');
          window.location = 'http://localhost:3000';
        }
        if (newState.status === 'loss') {
          window.alert('You lost the game.');
          window.location = 'http://localhost:3000';
        }
        if (newState.status === 'new' && this.state.status === 'playing') {
          window.alert('The game has been reset.');
          window.location = 'http://localhost:3000';
        }
        this.setState(newState);
        console.log('new state');
        console.log(this.state);
      }
    }

    componentWillUnmount() {
      this.connection.close();
    }

    reset() {
      this.connection.send(JSON.stringify({ action: 'reset' }));
    }

    startGame() {
      this.connection.send(JSON.stringify({ action: 'startGame' }));
    }
    
    playCard() {
      this.connection.send(JSON.stringify({ playerIndex, action: 'playCard' }));
    }
    
    playStar() {
      this.connection.send(JSON.stringify({ action: 'playStar' }));
    }  

    render() {
      return (
        <div className="container">
          <button id="reset" onClick={this.reset}>Reset Game</button>
          <div className="header">
          {
              Object.keys(this.state).length ?
                this.state.hands.flat().length === 0 && this.state.round === 1 ?
                  <h2>Welcome {playerIndex ? `Player ${playerIndex}` : 'Spectator'}</h2>
                  :
                  <h1>Round {this.state.round}</h1>
                :
                ''
            }
          </div>
          <div className="main">
            {
              Object.keys(this.state).length ?
                this.state.hands.length > 1 ?
                  this.state.hands.flat().length === 0 && this.state.round === 1 ?
                    <button onClick={this.startGame}>Start Game ({this.state.hands.length} players)</button>
                    :
                    <h1>{this.state.card || 'Play a card'}</h1>
                  :
                  ''
                :
                ''
            }
          </div>
          {
            Object.keys(this.state).length && playerIndex ?
              this.state.hands.flat().length ?
                <div className="hand">
                  { this.state.hands[playerIndex].toString() }
                  <br/>
                  {
                    this.state.hands[playerIndex].length ?
                      <button onClick={this.playCard}>Play Card</button>
                      :
                      ''
                  }
                  {
                    this.state.stars ?
                      <button onClick={this.playStar}>Play Star ({this.state.stars} remaining)</button>
                      :
                      ''
                  }
                </div>
                :
                ''
              :
              ''
          }
        </div>
      );    
    }
}

const domContainer = document.querySelector('#game');
ReactDOM.render(<Game />, domContainer);