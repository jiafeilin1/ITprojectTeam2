import { QSM3Exp } from '../explanations';
// import 1D tracer to generate array in a separate component of the middle panel
import ArrayTracer from '../../components/DataStructures/Array/Array1DTracer';

export default {

  explanation: QSM3Exp,

  initVisualisers() {
    return {
      array: {
        instance: new ArrayTracer('array', null, 'Array view', { arrayItemMagnitudes: true }), // Label the input array as array view
        order: 0,
      },
    };
  },

  /**
   *
   * @param {object} chunker
   * @param {array} nodes array of numbers needs to be sorted
   */
  run(chunker, { nodes }) {
    const highlight = (vis, index, primaryColor = true) => {
      if (primaryColor) {
        vis.array.select(index);
      } else {
        vis.array.patch(index);
      }
    };

    const unhighlight = (vis, index, primaryColor = true) => {
      if (primaryColor) {
        vis.array.deselect(index);
      } else {
        vis.array.depatch(index);
      }
    };

    const swapAction = (b, n1, n2) => {
      chunker.add(b, (vis, _n1, _n2) => {
        vis.array.swapElements(_n1, _n2);
      }, [n1, n2]);
    };

    function partition(values, left, right) {
      const a = values;
      let tmp;


      // Find median of 3 to assign as pivot
      const mid = Math.floor((left + right) / 2);
      chunker.add(14, (vis, index) => {
        highlight(vis, index);
      }, [mid]);
      chunker.add(20, (vis, index) => {
        highlight(vis, index, false);
      }, [left]);
      if (a[left] > a[mid]) {
        // Swap a[left] and a[mid]
        tmp = a[left];
        a[left] = a[mid];
        a[mid] = tmp;
        swapAction(15, left, mid);
        chunker.add(21, (vis, index1, index2, index3) => {
          unhighlight(vis, index1);
          unhighlight(vis, index2, false);
          highlight(vis, index2);
          highlight(vis, index3, false);
        }, [left, mid, right]);
      } else {
        chunker.add(21, (vis, index1, index2) => {
          unhighlight(vis, index1, false);
          highlight(vis, index2, false);
        }, [left, right]);
      }
      if (a[mid] > a[right]) {
        // Swap a[right] and a[mid]
        tmp = a[right];
        a[right] = a[mid];
        a[mid] = tmp;
        swapAction(16, right, mid);
        chunker.add(22, (vis, index1, index2, index3) => {
          unhighlight(vis, index1, false);
          unhighlight(vis, index2);
          highlight(vis, index1);
          highlight(vis, index3, false);
        }, [mid, right, left]);
        if (a[left] > a[mid]) {
          // Swap a[left] and a[mid]
          tmp = a[left];
          a[left] = a[mid];
          a[mid] = tmp;
          swapAction(17, left, mid);
          chunker.add(18, (vis, index1, index2, index3) => {
            unhighlight(vis, index2);
            unhighlight(vis, index3, false);
            highlight(vis, index1, false);
            highlight(vis, index3);
          }, [right - 1, left, mid]);
        } else {
          chunker.add(18, (vis, index1, index2) => {
            unhighlight(vis, index1, false);
            highlight(vis, index2, false);
          }, [left, right - 1]);
        }
      } else {
        chunker.add(18, (vis, index1, index2) => {
          unhighlight(vis, index1, false);
          highlight(vis, index2, false);
        }, [right, right - 1]);
      }
      // Swap a[mid] and a[right-1]
      tmp = a[mid];
      a[mid] = a[right - 1];
      a[right - 1] = tmp;
      swapAction(18, mid, right - 1);
      // assign pivot
      const pivot = a[right - 1];

      chunker.add(5);


      // Partition array segment
      let i = left - 1;
      chunker.add(11);
      let j = right - 1;
      chunker.add(12);
      chunker.add(6);
      while (i < j) {
        chunker.add(7);
        do {
          i += 1;
        } while (a[i] < pivot);
        chunker.add(8);
        do {
          j -= 1;
        } while (i <= j && pivot < a[j]);
        chunker.add(9);
        if (i < j) {
          tmp = a[j];
          a[j] = a[i];
          a[i] = tmp;
          swapAction(10, i, j);
        }
      }
      a[right - 1] = a[i];
      a[i] = pivot;
      swapAction(13, i, right - 1);
      chunker.add(13, (vis, i1) => {
        vis.array.sorted(i1);
      }, [i]);
      return [i, a]; // Return [pivot index, array values]
    }


    function QuickSort(array, left, right) {
      // let a = SortLMR(array, left, right);
      let a = array;
      let p;
      chunker.add(2);
      if (left < right) {
        [p, a] = partition(a, left, right);
        // const leftArray = a.slice(left, p);
        // const rightArray = a.slice(p + 1, right + 1);
        chunker.add(3, (vis, pivot, arrayLen) => {
          // fade out the part of the array that is not being sorted (i.e. right side)
          for (let i=pivot; i < arrayLen; i++){
            vis.array.fadeOut(i)
          }
        }, [p, right+1]);
        QuickSort(a, left, p - 1, `${left}/${p - 1}`);

        chunker.add(4, (vis, pivot, arrayLen) => {
          // fade out the part of the array that is not being sorted (i.e. left side)
          for (let i=0; i <= pivot; i++){
            vis.array.fadeOut(i)
          }
          // fade in part of the array that is now being sorted (i.e. right side)
          for (let i=pivot+1; i < arrayLen; i++){
            vis.array.fadeIn(i)
          }
        }, [p, right+1]);
        QuickSort(a, p + 1, right, `${right}/${p + 1}`);
      }
      // array of size 1, already sorted
      else if (left < array.length) {
        chunker.add(2, (vis, l) => {
          vis.array.sorted(l);
        }, [left]);
      }
      return a; // Facilitates testing
    }

    chunker.add(
      1,
      (vis, array) => {
        vis.array.set(array, 'quicksort');
      },
      [nodes],
    );
    QuickSort(nodes, 0, nodes.length - 1, `0/${nodes.length - 1}`);
    // Fade out final node
    chunker.add(19, (vis, idx) => {
      vis.array.fadeOut(idx)
    }, [nodes.length - 1]);
  },
};
