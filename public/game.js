const paramArr = document.URL.split('?');
const queryParam = paramArr[paramArr.length - 1];
const queryArr = queryParam.split('=');
const playerIndex = queryArr[1];

class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
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
        this.setState(JSON.parse(e.data));
        console.log('new state');
        console.log(this.state);
      }
    }

    componentWillUnmount() {
      this.connection.close();
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
          <div className="header">
            {
              
            }
            <h2>Welcome {playerIndex ? `Player ${playerIndex}` : 'Spectator'}</h2>
          </div>
          <div className="main">
            {
              Object.keys(this.state).length ?
                this.state.hands.flat().length === 0 && this.state.round === 1 ?
                  <button onClick={this.startGame}>Start Game</button>
                  :
                  <h1>{this.state.card || 'Play a card'}</h1>
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
                  <button onClick={this.playStar}>Play Star</button>
                </div>
                :
                ''
              :
              ''
          }
          {/* {
            playerIndex && this.state.hands.flat().length > 0 ?
              <div className="hand">
                <p>{ this.state.hands[playerIndex].toString }</p>
                <br/>
                {
                  this.state.hands[playerIndex].length ?
                    <button onClick={playCard}>Play Card</button>
                    :
                    ''
                }
                <button onClick={playStar}>Play Star</button>
              </div>
            :
            ''
          } */}
        </div>
      );    
    }
}

const domContainer = document.querySelector('#game');
ReactDOM.render(<Game />, domContainer);