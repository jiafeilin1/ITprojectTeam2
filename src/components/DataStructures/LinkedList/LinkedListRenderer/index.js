import React from 'react';
import { motion, AnimateSharedLayout } from 'framer-motion';
import Renderer from '../../common/Renderer/index';
import styles from './LinkedListRenderer.module.scss';
import { classes } from '../../common/util';
import { mode } from '../../../top/Settings';

class LinkedListRenderer extends Renderer {
    constructor(props) {
        super(props);

        this.state = {
            lists: props.data.lists, // assuming the linked lists are passed as props
        };
    }

    // Define the symbols
    renderSymbols() {
        return (
            <svg style={{ display: 'none' }}>
                <symbol id="null-marker" viewBox="0 0 100 100">
                    <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="20" />
                    <line x1="100" y1="0" x2="0" y2="100" stroke="white" strokeWidth="20" />
                </symbol>

                <symbol id="arrow-symbol" viewBox="0 0 100 100">
                    <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2" />
                    <polyline points="60,40 70,50 60,60" stroke="white" strokeWidth="2" fill="none" />
                </symbol>
            </svg>
        );
    }

    renderData() {
        const { lists } = this.state;
        const layers = this.layer(lists);

        return (
            <AnimateSharedLayout>
                <motion.div className={styles.IndexContainer}
                    drag
                >
                    {this.renderSymbols()}

                    {layers.map((layer, listIndex) => (
                        <div className={styles.LayerContainer} key={`layer-${listIndex}`}>

                            {layer.map((list, layerIndex) => (
                                <motion.div className={styles.LinkedListContainer} key={`linkedList-${layerIndex}`}
                                            layoutId={`linkedList-${listIndex},${layerIndex}`}
                                            transition={{type: 'spring', bounce: 0.2}}
                                >

                                    {list.data.map((node, nodeIndex) => (
                                        <div className={classes(styles.nodeContainer,
                                            !node.value && styles.invisible)}
                                             key={`list-${listIndex}-node-${node.key}`}
                                             style={{transform: `translate(${list.unitShift * 76}px)`}}>

                                        <React.Fragment>
                                            <motion.div
                                                key={`node-${node.key}`}
                                                layoutId={`node-${node.key}`}
                                                className={classes(styles.node,
                                                    node.selected && styles.selected,
                                                    node.patched && styles.visited,
                                                    !node.value && styles.invisible,
                                                )}
                                                whileHover={{scale: 1.2}}
                                                transition={{type: 'spring', bounce: 0.2}}
                                            >
                                                {/* Nodes */}
                                                <div className={classes(styles.value,                                                     !node.value && styles.invisible,
                                                    !node.value && styles.invisible,
                                                )}>
                                                    {node.value}
                                                </div>

                                                {/* Labels */}
                                                {node.variables.map((variable, variableIndex) => (
                                                    <div className={styles.label}
                                                         key={`variable-${variableIndex}`}
                                                    >
                                                        {variable}
                                                    </div>))}
                                            </motion.div>

                                            {/* Arrows */}
                                            <div className={styles.symbol}>
                                                <div
                                                    className={styles.arrow}
                                                    layoutId={`list-${listIndex}-arrow-${nodeIndex}`}
                                                >
                                                    <svg className={classes(styles.arrow,
                                                        node.arrow === 90 && styles.down,
                                                        node.arrow === -90 && styles.up,
                                                        node.arrow === 45 && styles.diagDown,
                                                        node.arrow === -45 && styles.diagUp)
                                                    }>
                                                        <use href="#arrow-symbol"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    </div>
                                ))}
                                </motion.div>
                            ))}
                            </div>))}
                        </motion.div>
                        </AnimateSharedLayout>)
                    }

    render() {
        return this.renderData();
    }

    // group by listIndex for rendering
    layer(lists = []) {
        const layers = [];
        lists.forEach(item => {
            if (!layers[item.listIndex]) {
                layers[item.listIndex] = [];
            }
            layers[item.listIndex].push(item);
            layers[item.listIndex].sort((a, b) => a.layerIndex - b.layerIndex);

        });
        return layers;
    }

}

export default LinkedListRenderer;