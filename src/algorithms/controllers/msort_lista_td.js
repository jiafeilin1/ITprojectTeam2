// This comment is entirely for the
// amusement of the person who wrote
// it and should be ignored by anyone
// else. However, THE COMMENTS BELOW
// SHOULD BE READ BY ANYONE LOOKING
// AT THE CODE, PARTICULARLY IF IT IS
// TO BE MODIFIED!

// Animation of merge sort for lists (represented using array), top down.
// XXX PROTOTYPE for pointer version. Adapted from code for mergesort for
// arrays (may include some quicksort remnants also).
// XXX Needs major clean up of code to remove junk, refactor, etc before
// being used for anything else
// XXX Not all  steps are animated
// XXX should be more consistent with mergesort for arrays with colours
// etc
// XXX Colours are very limited - colour support is a mystery to me and
// there are major inconsistencies between colours specification for
// graph nodes/edges, 1D arrays and 2D arrays (there is a student group
// that will hopefully look into this and improve things)

import { msort_lista_td } from '../explanations';

const run = run_msort();

export default {
    explanation: msort_lista_td,
    initVisualisers, 
    run
};


// XXX (was) Quicksort common code
// Example of a recursive algorithm that could serve as a guide to
// implementing others.  Some things to note:
// 1) A depth parameter is added to the recursive code and also passed
// to chunker.add()
// 2) Recursive calls are in code blocks that can be collapsed, so the
// whole recursive call can be done in a single step. To do this we must
// have chunks at the recursion level of the call at the start and end
// of the collapsed computation. Here the start chunk is a comment line.
// It does nothing but notes that the call on the next line is recursive.
// At the next step control goes back to the start of the function so
// an extra comment is not a bad thing to do for clarity in any case.
// The chunk after the recursive computation is at the line of code with
// the call, so the call is highlighted when it returns, as we would
// want.
// 3) The stack is visualised in the animation, to help understanding of
// the algorithm overall and also where we are in the recursion.
// 4) There is chunk at the end of the whole computation that cleans up
// the final display a bit.

// There may be remnants of code from a previous version that didn't
// encapsulate the recursive calls properly

// import 2D tracer to generate array in the middle panel
import Array2DTracer from '../../components/DataStructures/Array/Array2DTracer';

import {
  areExpanded,
} from './collapseChunkPlugin';

/////////////////////////////////////////////////////

// We don't strictly need isMergeExpanded: only needed if last chunk of
// merge still had extra vars displayed.  Some code still needs
// isMergeCopyExpanded because it uses arrayB
function isMergeExpanded() {
  return areExpanded(['MergeCopy', 'Merge']); // MergeCopy contains Merge
}

// checks if either recursive call is expanded (otherwise stack is not
// displayed)
function isRecursionExpanded() {
  return areExpanded(['MergesortL']) || areExpanded(['MergesortR']);
}

// see stackFrameColour in index.js to find corresponding function mapping to css
const STACK_FRAME_COLOR = {
  No_color: 0,
  In_progress_stackFrame: 1,
  Current_stackFrame: 2,
  Finished_stackFrame: 3,
  I_color: 4,
  J_color: 5,
  P_color: 6, // pivot
};

let Indices;
let Heads;
let Tails;
let simple_stack;


// ----------------------------------------------------------------------------------------------------------------------------

// Define helper functions
// without javascript Closure arguements (IE 'global variables')
// ----------------------------------------------------------------------------------------------------------------------------

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}


export function update_vis_with_stack_frame(a, stack_frame, stateVal) {
  let left, right,  depth;
  [left, right,  depth] = stack_frame;

  for (let i = left; i <= right; i += 1) {
    // each element in the vis stack is a tuple:
    // 0th index is for base color,
    // 1th index is for pivot, i, j colors
    a[depth][i] = { base: stateVal, extra: [] };
  }
  let mid = Math.floor((left + right)/2);
  // a[depth][mid] = { base: STACK_FRAME_COLOR.P_color, extra: [] };
  a[depth][mid] = { base: STACK_FRAME_COLOR.Current_stackFrame, extra: [] };
  return a;
}


const highlight = (vis, index, isPrimaryColor = true) => {
  if (isPrimaryColor) {
    vis.array.select(index);
  } else {
    vis.array.patch(index);
  }
};

const highlightB = (vis, index, isPrimaryColor = true) => {
  if (isPrimaryColor) {
    vis.arrayB.select(index);
  } else {
    vis.arrayB.patch(index);
  }
};

const unhighlight = (vis, index, isPrimaryColor = true) => {
  if (isPrimaryColor) {
    vis.array.deselect(index);
  } else {
    vis.array.depatch(index);
  }
};

const unhighlightB = (vis, index, isPrimaryColor = true) => {
  if (isPrimaryColor) {
    vis.arrayB.deselect(index);
  } else {
    vis.arrayB.depatch(index);
  }
};


// ----------------------------------------------------------------------------------------------------------------------------


// Just use a single 2D array to represent lists for now.  Could
// possibly add a 1D array with arrayItemMagnitudes: true and rearrange
// data at the end to show sortedness XXX
export function initVisualisers() {
    return {
      array: {
        instance: new Array2DTracer('array', null,
         'Array representation of lists (PROTOTYPE FOR POINTER REPRESENTATION)'),
        order: 0,
      },
    }
}

/**
 *
 * @param {object} chunker
 * @param {array} nodes array of numbers needs to be sorted
 */

export function run_msort() {

  return function run(chunker, { nodes }) {
    // can't rename from nodes

    // ----------------------------------------------------------------------------------------------------------------------------
    // Define 'global' variables
    // ----------------------------------------------------------------------------------------------------------------------------

    const entire_num_array = nodes;
    let A = nodes;

    // ----------------------------------------------------------------------------------------------------------------------------
    // Define helper functions
    // ----------------------------------------------------------------------------------------------------------------------------

    function assignMaybeNullVar(vis, variable_name, index) {
      if (index === 'Null') {
        vis.array.assignVariable(variable_name, 2, undefined);
        vis.array.assignVariable(variable_name+'=Null', 2, 0);
      } else
        vis.array.assignVariable(variable_name, 2, index);
    }

    function assignVarToA(vis, variable_name, index) {
      if (index === undefined)
        vis.array.removeVariable(variable_name);
      else
        vis.array.assignVariable(variable_name, index);
    }

    function assignVarToB(vis, variable_name, index) {
      if (index === undefined)
        vis.arrayB.removeVariable(variable_name);
      else
        vis.arrayB.assignVariable(variable_name, index);
    }

    // ----------------------------------------------------------------------------------------------------------------------------
    // Define quicksort functions
    // ----------------------------------------------------------------------------------------------------------------------------

    // calls vis.array.setList(c_stk) to display simple stack but only
    // if recursion is expanded (otherwise stack is never displayed)
    // XXX is this confusing if we run the algorithm a bit with
    // recursion expanded then collapse recursion? I guess if you are
    // doing that you have a pretty good understanding anyway?
    const set_simple_stack = (vis_array, c_stk) => {
    if (isRecursionExpanded())
      vis_array.setList(c_stk);
    }

    function MergeSort(L, len, depth) {


      //// start mergesort --------------------------------------------------------

      // XXX defined function to display first couple of list elements
      simple_stack.unshift('(['+Heads[L]+'..],'+len+')');

      // should show animation if doing high level steps for whole array OR if code is expanded to do all reccursive steps

      chunker.add('Main', (vis, Lists, cur_L, cur_len, cur_depth, c_stk) => {
        vis.array.set(Lists, 'msort_lista_td');
        vis.array.assignVariable('L', 2, cur_L);
        // colour all of R list
        let Tails = Lists[2];
        for (let i = cur_L; i !== 'Null'; i = Tails[i]) {
          vis.array.select(1, i, 1, i, '0');
          vis.array.select(2, i, 2, i, '0');
        }
        // if (cur_depth === 0) {
           // }
        // for (let i = cur_left; i <= cur_right; i++) {
          // highlight(vis, i, true)
        // }
        set_simple_stack(vis.array, c_stk);
        }, [[Indices, Heads, Tails], L, len, depth, simple_stack], depth);

      chunker.add('len>1', (vis, a) => {
        }, [[Indices, Heads, Tails]], depth);

      if (len > 1) {
        let midNum = Math.floor(len/2);
        // chunker.add('mid', (vis, a, cur_left, cur_mid, cur_right) => {
          // for (let i = cur_mid+1; i <= cur_right; i++) {
            // unhighlight(vis, i, true)
          // }
          // assignVarToA(vis, 'mid', cur_mid);
          // }, [A, left, mid, right], depth);

        let Mid = L;
        chunker.add('Mid', (vis, Lists, cur_L, cur_Mid, c_stk) => {
          // vis.array.set(Lists, 'msort_lista_td');
          // set_simple_stack(vis.array, c_stk);
          vis.array.assignVariable('Mid', 2, cur_Mid);
          }, [[Indices, Heads, Tails], L, Mid, simple_stack], depth);
          // XXX chunker.add...
        for (let i = 1; i < midNum; i++) {
          Mid = Tails[Mid];
          // XXX chunker.add...
        }
        // split L into lists L and R at (after) mid point
        let R = Tails[Mid];
        Tails[Mid] = 'Null';
        chunker.add('tail(Mid)<-Null', (vis, Lists, cur_L, cur_Mid,
cur_R, c_stk) => {
          vis.array.set(Lists, 'msort_lista_td');
          set_simple_stack(vis.array, c_stk);
          vis.array.assignVariable('L', 2, cur_L);
          vis.array.assignVariable('Mid', 2, cur_Mid);
          vis.array.assignVariable('R', 2, cur_R);
          vis.array.select(1, cur_L, 1, cur_L, '0');
          vis.array.select(2, cur_L, 2, cur_L, '0');
          vis.array.select(1, cur_R, 1, cur_R, '0');
          vis.array.select(2, cur_R, 2, cur_R, '0');
          }, [[Indices, Heads, Tails], L, Mid, R, simple_stack], depth);

        // dummy chunk for before recursive call - we need this so there
        // is a chunk at this recursion level as the first chunk in the
        // collapsed code for the recursive call
        chunker.add('preSortL', (vis, Lists, cur_L, cur_Mid, cur_R, c_stk) => {
          vis.array.set(Lists, 'msort_lista_td');
          set_simple_stack(vis.array, c_stk);
          vis.array.assignVariable('L', 2, cur_L);
          vis.array.select(1, cur_L, 1, cur_L, '0');
          vis.array.select(2, cur_L, 2, cur_L, '0');
          }, [[Indices, Heads, Tails], L, Mid, R, simple_stack], depth);


        L = MergeSort(L, midNum, depth + 1);

        // chunk after recursive call - it's good to highlight the
        // recursive call once it has returned plus we need a chunk at
        // this level when the recursive code is collapsed
        chunker.add('sortL', (vis, Lists, cur_L, cur_R, cur_Mid, c_stk) => {
          vis.array.set(Lists, 'msort_lista_td');
          set_simple_stack(vis.array, c_stk);
          vis.array.assignVariable('L', 2, cur_L);
          vis.array.assignVariable('R', 2, cur_R);
          // colour all of L list
          let Tails = Lists[2];
          for (let i = cur_L; i !== 'Null'; i = Tails[i]) {
            vis.array.select(1, i, 1, i, '1');
            vis.array.select(2, i, 2, i, '1');
          }
          vis.array.select(1, cur_R, 1, cur_R, '0');
          vis.array.select(2, cur_R, 2, cur_R, '0');
          // for (let i = cur_left; i <= cur_mid; i++) {
            // unhighlight(vis, i, true);
            // highlight(vis, i, false)
          // }
          // for (let i = cur_mid+1; i <= cur_right; i++) {
            // highlight(vis, i, true);
          // }
          }, [[Indices, Heads, Tails], L, R, Mid, simple_stack], depth);

        // dummy chunk before recursive call, as above
        chunker.add('preSortR', (vis, Lists, cur_L, cur_Mid, cur_R, c_stk) => {
          vis.array.set(Lists, 'msort_lista_td');
          set_simple_stack(vis.array, c_stk);
          // vis.array.assignVariable('L', 2, undefined);
          vis.array.assignVariable('R', 2, cur_R);
          vis.array.select(1, cur_R, 1, cur_R, '0');
          vis.array.select(2, cur_R, 2, cur_R, '0');
          // colour all of R list
          // let Tails = Lists[2];
          // for (let i = cur_R; i !== 'Null'; i = Tails[i]) {
            // vis.array.select(1, i, 1, i, '1');
            // vis.array.select(2, i, 2, i, '1');
          // }
          }, [[Indices, Heads, Tails], L, Mid, R, simple_stack], depth);

        R = MergeSort(R, len - midNum, depth + 1);

        // chunk after recursive call
        chunker.add('sortR', (vis, Lists, cur_L, cur_R,
c_stk) => {
          // vis.array.set(a, 'msort_lista_td');
          vis.array.set(Lists, 'msort_lista_td');
          set_simple_stack(vis.array, c_stk);
          vis.array.assignVariable('L', 2, cur_L);
          vis.array.assignVariable('R', 2, cur_R);
          vis.array.select(1, cur_L, 1, cur_L, '0');
          vis.array.select(2, cur_L, 2, cur_L, '0');
          // colour all of R list
          let Tails = Lists[2];
          for (let i = cur_R; i !== 'Null'; i = Tails[i]) {
            vis.array.select(1, i, 1, i, '1');
            vis.array.select(2, i, 2, i, '1');
          }

          // for (let i = cur_mid+1; i <= cur_right; i++) {
            // unhighlight(vis, i, true);
            // unhighlight(vis, i, false)
          // }
          }, [[Indices, Heads, Tails], L, R, simple_stack], depth);

          // Merge L and R
          let M; // result
          if (Heads[L] <= Heads[R]) {
              M = L;
              L = Tails[L];
          } else {
              M = R;
              R = Tails[R];
          }
          // scan through adding elements to the end of M
          let E = M;
          chunker.add('E', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
            vis.array.set(Lists, 'msort_lista_td');
            set_simple_stack(vis.array, c_stk);
            assignMaybeNullVar(vis, 'L', cur_L);
            assignMaybeNullVar(vis, 'R', cur_R);
            vis.array.assignVariable('M', 2, cur_M);
            vis.array.assignVariable('E', 2, cur_E);
            if (cur_L !== 'Null') {
              vis.array.select(1, cur_L, 1, cur_L, '0');
              vis.array.select(2, cur_L, 2, cur_L, '0');
            }
            if (cur_R !== 'Null') {
              vis.array.select(1, cur_R, 1, cur_R, '0');
              vis.array.select(2, cur_R, 2, cur_R, '0');
            }
            vis.array.select(1, cur_M, 1, cur_M, '1');
            vis.array.select(2, cur_M, 2, cur_M, '1');
            }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
          while (L !== 'Null' && R !== 'Null') {
            chunker.add('whileNotNull', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
              vis.array.set(Lists, 'msort_lista_td');
              set_simple_stack(vis.array, c_stk);
              assignMaybeNullVar(vis, 'L', cur_L);
              assignMaybeNullVar(vis, 'R', cur_R);
              vis.array.assignVariable('M', 2, cur_M);
              assignMaybeNullVar(vis, 'E', cur_E);
              if (cur_L !== 'Null') {
                vis.array.select(1, cur_L, 1, cur_L, '0');
                vis.array.select(2, cur_L, 2, cur_L, '0');
              }
              if (cur_R !== 'Null') {
                vis.array.select(1, cur_R, 1, cur_R, '0');
                vis.array.select(2, cur_R, 2, cur_R, '0');
              }
              // colour all of M list, up to + including cur_E
              // (we don't color up to Null because the tail of E hasn't
              // been smashed)
              let Tails = Lists[2];
              for (let i = cur_M; i !== cur_E; i = Tails[i]) {
                vis.array.select(1, i, 1, i, '1');
                vis.array.select(2, i, 2, i, '1');
              }
              if (cur_E !== 'Null') {
                vis.array.select(1, cur_E, 1, cur_E, '1');
                vis.array.select(2, cur_E, 2, cur_E, '1');
              }
            }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
            if (Heads[L] <= Heads[R]) {
              Tails[E] = L;
              E = L;
              L = Tails[L];
              chunker.add('popL', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
                vis.array.set(Lists, 'msort_lista_td');
                set_simple_stack(vis.array, c_stk);
                assignMaybeNullVar(vis, 'L', cur_L);
                assignMaybeNullVar(vis, 'R', cur_R);
                vis.array.assignVariable('M', 2, cur_M);
                assignMaybeNullVar(vis, 'E', cur_E);
                if (cur_L !== 'Null') {
                  vis.array.select(1, cur_L, 1, cur_L, '0');
                  vis.array.select(2, cur_L, 2, cur_L, '0');
                }
                if (cur_R !== 'Null') {
                  vis.array.select(1, cur_R, 1, cur_R, '0');
                  vis.array.select(2, cur_R, 2, cur_R, '0');
                }
                // colour all of M list, up to + including cur_E
                // (we don't color up to Null because the tail of E hasn't
                // been smashed)
                let Tails = Lists[2];
                for (let i = cur_M; i !== cur_E; i = Tails[i]) {
                  vis.array.select(1, i, 1, i, '1');
                  vis.array.select(2, i, 2, i, '1');
                }
                if (cur_E !== 'Null') {
                  vis.array.select(1, cur_E, 1, cur_E, '1');
                  vis.array.select(2, cur_E, 2, cur_E, '1');
                }
              }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
            } else {
              Tails[E] = R;
              E = R;
              R = Tails[R];
              chunker.add('popR', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
                vis.array.set(Lists, 'msort_lista_td');
                set_simple_stack(vis.array, c_stk);
                assignMaybeNullVar(vis, 'L', cur_L);
                assignMaybeNullVar(vis, 'R', cur_R);
                vis.array.assignVariable('M', 2, cur_M);
                assignMaybeNullVar(vis, 'E', cur_E);
                if (cur_L !== 'Null') {
                  vis.array.select(1, cur_L, 1, cur_L, '0');
                  vis.array.select(2, cur_L, 2, cur_L, '0');
                }
                if (cur_R !== 'Null') {
                  vis.array.select(1, cur_R, 1, cur_R, '0');
                  vis.array.select(2, cur_R, 2, cur_R, '0');
                }
                // colour all of M list, up to + including cur_E
                // (we don't color up to Null because the tail of E hasn't
                // been smashed)
                let Tails = Lists[2];
                for (let i = cur_M; i !== cur_E; i = Tails[i]) {
                  vis.array.select(1, i, 1, i, '1');
                  vis.array.select(2, i, 2, i, '1');
                }
                if (cur_E !== 'Null') {
                  vis.array.select(1, cur_E, 1, cur_E, '1');
                  vis.array.select(2, cur_E, 2, cur_E, '1');
                }
              }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
            }
          }
          // add any elements not scanned to the end of M
          if (L === 'Null') {
            Tails[E] = R;
            chunker.add('appendR', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
              vis.array.set(Lists, 'msort_lista_td');
              set_simple_stack(vis.array, c_stk);
              vis.array.assignVariable('M', 2, cur_M);
              // colour all of M list
              let Tails = Lists[2];
              for (let i = cur_M; i !== 'Null'; i = Tails[i]) {
                vis.array.select(1, i, 1, i, '1');
                vis.array.select(2, i, 2, i, '1');
              }
            }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
          } else {
            Tails[E] = L;
            chunker.add('appendL', (vis, Lists, cur_L, cur_R, cur_M, cur_E, c_stk) => {
              vis.array.set(Lists, 'msort_lista_td');
              set_simple_stack(vis.array, c_stk);
              vis.array.assignVariable('M', 2, cur_M);
              // colour all of M list
              let Tails = Lists[2];
              for (let i = cur_M; i !== 'Null'; i = Tails[i]) {
                vis.array.select(1, i, 1, i, '1');
                vis.array.select(2, i, 2, i, '1');
              }
            }, [[Indices, Heads, Tails], L, R, M, E, simple_stack], depth);
          }
          chunker.add('returnM', (vis, Lists, cur_L, cur_M, c_stk) => {
            vis.array.set(Lists, 'msort_lista_td');
            set_simple_stack(vis.array, c_stk);
            vis.array.assignVariable('L', 2, undefined);
            vis.array.assignVariable('R', 2, undefined);
            vis.array.assignVariable('E', 2, undefined);
            vis.array.assignVariable('M', 2, cur_M);
            // colour all of M list
            let Tails = Lists[2];
            for (let i = cur_M; i !== 'Null'; i = Tails[i]) {
              vis.array.select(1, i, 1, i, '1');
              vis.array.select(2, i, 2, i, '1');
            }
            }, [[Indices, Heads, Tails], L, M, simple_stack], depth);

        // chunk after recursive call, as above, after adjusting
        // stack frames/depth etc
        L = M;  // just for return below
      }
        // XXX should we delete 'else' and always go to the 'Done' line
        // even for non-trivial array segments? (might need to
        // generalise (un)highlight code below
        else
      {
        chunker.add('returnL', (vis, a, cur_L) => {
          vis.array.select(1, cur_L, 1, cur_L, '1');
          vis.array.select(2, cur_L, 2, cur_L, '1');
          // if (cur_left === cur_right) {
            // unhighlight(vis, cur_left, true);
            // highlight(vis, cur_left, false)
          // }
          }, [A, L], depth);
      }

      simple_stack.shift();
      return L;
    }


    // ----------------------------------------------------------------------------------------------------------------------------
    // Perform actual mergesort
    // ----------------------------------------------------------------------------------------------------------------------------

    // XXXXXXXXX
    Indices = ['i'];
    Heads = ['Head(i) (data)'];
    Tails = ['Tail(i) (next)'];
    simple_stack = [];
 
    for (let i = 1; i<entire_num_array.length; i++) {
      Indices.push(i);
      Heads.push(entire_num_array[i-1]);
      Tails.push(i+1);
    }
    Tails[entire_num_array.length-1] = 'Null';
    const msresult = MergeSort(1, entire_num_array.length - 1, 0);
    // const msresult = 0;

    return msresult;
  }
}

