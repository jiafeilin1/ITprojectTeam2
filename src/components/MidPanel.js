import React, { useContext } from 'react';
import { GlobalContext } from '../context/GlobalState';
import '../styles/MidPanel.scss';
import NextLineButton from './NextLineButton';
import PlayButton from './PlayButton';
import PrevLineButton from './PrevLineButton';

function MidPanel() {
  const { algorithm } = useContext(GlobalContext);

  return (
    <div className="midPanelContainer">
      <div className="midPanelHeader">
        <div className="algorithmTitle">{algorithm.name}</div>
        <button type="button" className="quizButton">Quiz</button>
      </div>
      <div className="midPanelBody">
        {/* Animation Goes here */}
        {algorithm.chunker && algorithm.chunker.getVisualisers()[0].render()}
      </div>
      <div className="midPanelFooter">
        <div className="controlPanel">
          <PlayButton />
          <PrevLineButton />
          <NextLineButton />
        </div>
        <div className="parameterPanel">
          { algorithm.param }
        </div>
      </div>
    </div>
  );
}


export default MidPanel;
