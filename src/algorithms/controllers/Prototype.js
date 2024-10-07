/* eslint-disable no-multi-spaces,indent,prefer-destructuring,brace-style */

import LinkedListTracer from "../../components/DataStructures/LinkedList/LinkedListTracer";

const LL_BOOKMARKS = {
    LL_default: 1,
    LL_if_left_less_right: 2,
    LL_left_to_mid: 3,
    LL_mid_to_end: 4,
    LL_sort_left: 5,
    LL_sort_right: 6,
    LL_result: 7,
    LL_done: 8,
    LL_middle: 9,
    LL_pre_left: 300,
    LL_pre_right: 400,
};

export default {

    initVisualisers() {
        return {
            list: {
                instance: new LinkedListTracer('list', null, 'List Prototype', { arrayItemMagnitudes: true }),
                order: 0,
            }
        };
    },

    run(chunker, { nodes }) {
        const A = [...nodes];
        let n = nodes.length;
        let slow;

        const swapAction = (bookmark, n1, n2) => {
            chunker.add(bookmark, (vis, _n1, _n2) => {
                vis.list.swap(0, _n1, _n2);  // Modified to use the `swap` method from LinkedListTracer
            }, [n1, n2]);
        };

        // Initialise
        chunker.add(
            1,
            (vis, list) => {
                vis.list.set([list]);  // Set a single list in an array as LinkedListTracer expects lists
            },
            [nodes]
        );

        // Split List into two sections
        chunker.add(
            2,
            (vis) => {
                vis.list.select(0, 0);  // Selecting the first node in the list
            },
        );

        chunker.add(
            201,
            (vis) => {
                vis.list.assignVariable("Slow", 0, 0);  // Assign "Slow" label to the first node
                vis.list.assignVariable("Fast", 0, 0);  // Assign "Fast" label to the first node
            },
        );

        chunker.add(202);

        for (let i = 1; i < n / 2; i++) {
            let fast = i * 2;
            slow = i;
            chunker.add(
                203,
                (vis) => {
                    vis.list.assignVariable('Slow', 0, i);  // Move "Slow" label to the `i-th` node
                    vis.list.assignVariable('Fast', 0, fast);  // Move "Fast" label to the `fast-th` node
                },
            );
            chunker.add(202);
        }

        chunker.add(
            204,
            (vis) => {
                vis.list.clearLabels(0);  // Clear all labels (assuming you add this method)
                vis.list.assignVariable("Left", 0, 0);  // Label the left part
                vis.list.assignVariable("Right", 0, slow + 1);  // Label the right part
                vis.list.select(0, slow + 1);  // Select the node at `slow + 1`
            }
        );
    }
};
