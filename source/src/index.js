import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isSimulating: false,
      width: 0,
      height: 0 
    }
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    
  }
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  render() {
    return <Board rows={10} cols={16} windowSize={[this.state.width, this.state.height]} />;
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    //alive is true, dead is false
    //should probably add constants for those
    //and make cellStates immutable too
    let cellStates = new Array(this.props.rows)
    for (let i = 0; i < this.props.rows; i++) {
      cellStates[i] = new Array(this.props.cols).fill(false);
    }

    this.state = {
      cellStates
    };
    //bind stuff
    this.updateCells = this.updateCells.bind(this);
    this.surroundingLivingCells = this.surroundingLivingCells.bind(this);
    
  }

  // could probably use .map here instead of nested for loops
  updateCells() {
    //create temporary updatedCellStates array
    let updatedCellStates = new Array(this.props.rows)
    for (let i = 0; i < this.props.cols; i++) {
      updatedCellStates[i] = new Array(this.props.cols);
    }

    //for each current cell cellState
    for (let r = 0; r < this.props.rows; r++) {
      for (let c = 0; c < this.props.cols; c++) {
        updatedCellStates[r][c] = this.shouldLive(
          this.state.cellStates[r][c], this.surroundingLivingCells(r, c)
        );
      }
    }

    this.setState({cellStates: updatedCellStates});

  }

  shouldLive(isAlive, livingNeighbors) {
    if (isAlive) {
      return (livingNeighbors === 2 || livingNeighbors === 3);
    }
    return livingNeighbors === 3;
  }

  surroundingLivingCells(r, c) {
    const states = this.state.cellStates;
    let num = 0;

    if (r > 0 && c > 0 && states[r-1][c-1]) num++;
    if (r > 0 && states[r-1][c]) num++;
    if (r > 0 && c < this.props.cols-1 && states[r-1][c+1]) num++;
    if (c < this.props.cols-1 && states[r][c+1]) num++;
    if (r < this.props.rows-1 && c < this.props.cols-1 && states[r+1][c+1]) num++;
    if (r < this.props.rows-1 && states[r+1][c]) num++;
    if (r < this.props.rows-1 && c > 0 && states[r+1][c-1]) num++;
    if (c > 0 && states[r][c-1]) num++;

    return num;
  }

  handleClick(row, col) {
    let updatedCellStates = this.state.cellStates.slice();
    updatedCellStates[row][col] = !updatedCellStates[row][col];
    this.setState({cellStates: updatedCellStates});
  }

  renderCell(state, row, col, key) {
    return(
      <Cell
        key={key}
        isAlive={state}
        onClick={() => this.handleClick(row, col)}
        row={row}
        col={col}
        board={this}
        windowSize={this.props.windowSize}
      />
    )
  }

  render() {
    //uses cellStates to populate an array of <div> elements
    //each containing an array of <Cell> elements
    const cells = this.state.cellStates.map(
      (row, rowIndex) =>
      <div className='cell-row' key={rowIndex}>
        {row.map(
          (state, colIndex) =>
          this.renderCell(state, rowIndex, colIndex, rowIndex+" "+colIndex)
        )}
      </div>
    );

    return(
      <div>
        {cells}

        <button onClick={this.updateCells}>Update Cells</button>
      </div>
    );
  }
}

function Cell(props) {
  let src = props.isAlive ? 'kanye-happy.png' : 'kanye-sad.png';
  return(
    <img
      className='cell'
      style={{
        width: (props.windowSize[1]-100)/props.board.props.rows,
        height: (props.windowSize[1]-100)/props.board.props.rows,
      }}
      onClick={props.onClick}
      src={src}
    />
  );
}

// -------------------------------------------------------

ReactDOM.render(<Game/>, document.getElementById('root'));
