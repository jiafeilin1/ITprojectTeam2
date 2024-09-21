import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { GlobalActions } from '../../context/actions';
import '../../styles/ProgressBar.scss';
import { chunk } from 'lodash';

class ProgressBar extends React.Component {
  constructor(props) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.lastX = null;

    this.max;
    this.current;
    this.accessibleList;
    this.searchRadius = 5;
    this.next;
    this.prev;

    this.ref = React.createRef();
  }

  handleMouseDown(e) {
    // let rect = e.currentTarget.getBoundingClientRect();
    // let x = e.clientX - rect.left;
    // this.lastX = x;
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove(e) {
    e.preventDefault();

    let chunkNum;
    let rect = this.ref.current.getBoundingClientRect();
    let width = this.ref.current.offsetWidth;

    let x = e.clientX - rect.left;
    if (x <= 0) {
      chunkNum = 0;

    } else if (x >= width) {
      chunkNum = this.max - 1;

    } else {
      x = Math.round((x / width) * this.max);
      if (x === this.current) {
        return;
      }

      // search for the closest accessible chunk
      // in a certain radius
      for (let i = 0; i <= this.searchRadius; i++) {
        if (i === 0) {
          if (this.accessibleList[x]) {
            chunkNum = x;
            break;
          }
          continue;
        }

        if (this.accessibleList[x + i]) {
          chunkNum = x + i;
          break;
        }

        if (this.accessibleList[x - i]) {
          chunkNum = x - i;
          break;
        }
      }
    }

    console.log(chunkNum);
    if (this.accessibleList[chunkNum]) {
      if (chunkNum > this.current) {
        this.next({stopAt: chunkNum, playing: false});
      }
      if (chunkNum < this.current && chunkNum !== this.max - 1) {
        this.prev({stopAt: chunkNum, playing: false});
      }
    }
  }

  handleMouseUp(e) {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  refresh() {
    this.forceUpdate();
  }

  render() {
    const { current, max, state, dispatch } = this.props;
    const node = {
      rectPrimary: document.querySelector('.mux-lpi-rect--primary'),
      buffer: document.querySelector('.mux-lpi-buffer'),
    };

    this.max = max;
    this.current = current;
    this.accessibleList = (state.chunker !== undefined) ?
      state.chunker.accessibleList :
      null;

    this.prev = (playing) => {
      dispatch(GlobalActions.PREV_LINE, playing);
    };

    this.next = (playing) => {
      dispatch(GlobalActions.NEXT_LINE, playing);
    };

    function setTransform(ref, value) {
      if (ref !== null) {
        const { style } = ref;
        style.transform = value;
        style.WebkitTransform = value;
        style.MozTransform = value;
        style.OTransform = value;
        style.MSTransform = value;
      }
    }

    function setProgress(ref, val) {
      setTransform(ref, `scaleX(${val})`);
    }

    function setBuffer(ref, val) {
      setTransform(ref, `scaleX(${val})`);
    }

    setProgress(node.rectPrimary, parseFloat(current / max, 10));
    setBuffer(node.buffer, 1);


    return (
        <div
          role="progressbar"
          className="mux-lpi"
          tabIndex={0}
          ref={this.ref}
          onMouseDown={this.handleMouseDown}
        >
          <div className="progressLable" id="progressLabel">
            <div className="innerText">
              {
                // if the user enters a valid input and clicks on LOAD
                // the progress bar displays the percentage of progress
                // convert the lines of code to percentge by multiplying the division by 100
                `Progress: ${Math.round((current / max) * 100, 2)} %`
                // if the user does not enter a valid input, initialise the progress bar as not loaded
              }
            </div>
          </div>
          <div className="mux-lpi-buffer" />
          <div className="mux-lpi-rect mux-lpi-rect--primary">
            <span className="mux-lpi-rect-inner" />
          </div>
        </div>
    );
  }
}

export default ProgressBar;
ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};
