/* eslint-disable import/no-unresolved */
import Tracer from '../common/Tracer';
import ListRenderer from './ListRenderer/index';



class ListTracer extends Tracer {

    getRendererClass() {
        return ListRenderer;
    }


    init() {

        super.init();
        this.dimensions = {
            baseWidth: 480,
            baseHeight: 480,
        };
        this.isDirected = true;
        this.isWeighted = false;
        this.callLayout = { method: this.layoutCircle, args: [] };
        this.text = null;
        this.logTracer = null;
        this.istc = false;
    }

    set(values = []) {
        this.objects = [];
        this.labels = []
        for (let index in values) {
            this.addNode(index, values[index]);
        }
    }

    layout() { }

    addNode(id, value = undefined,
        isVisited = false, isSelected = false) {
        // if (this.findNode(id)) return;
        // eslint-disable-next-line max-len
        this.objects.push({ id, value, isVisited, isSelected, key: id });
    }

    insertNode(position, value = undefined, isVisited = false, isSelected = false) {
        // Assign a unique ID based on the current max ID + 1
        const id = this.objects.length > 0 ? Math.max(...this.objects.map(obj => obj.id)) + 1 : 0;

        if (position >= 0 && position <= this.objects.length) {
            this.objects.splice(position, 0, { id, value, isVisited, isSelected, key: position });
        }
    }

    removeNode(position) {
        // Ensure the position is within bounds
        if (position >= 0 && position < this.objects.length) {
            this.objects.splice(position, 1);

            // Optionally update keys after removal
            this.objects.forEach((obj, index) => obj.key = index); // Adjust keys after removing an element
        }
    }

    updateNode(id, newValue) {
        const node = this.objects.find(obj => obj.id === id);
        if (node) {
            node.value = newValue;
        }
    }

    swapElements(i, j) {
        const temp1 = this.objects[i];
        const temp2 = this.objects[j];
        const tempKey1 = this.objects[i].key;
        const tempKey2 = this.objects[j].key;

        // Swapping the index of two elements.
        this.objects[i] = temp2;
        this.objects[j] = temp1;
        this.objects[j].key = tempKey2;
        this.objects[i].key = tempKey1;
    }

    reverse() {
        // Reverses the list of objects
        this.objects.reverse();
    }

    clear() {
        // Clears all nodes and labels
        this.objects = [];
        this.labels = [];
    }

    addLabel(index, label) {
        console.log(this.labels);
        this.labels.push({ index, label });
    }

    setLabel(label, newIndex = null, newLabel = null) {
        const matchedLabel = this.labels.find(match => match.label === label);

        if (newIndex && matchedLabel) {
            matchedLabel.index = newIndex;
        }
        if (newLabel && matchedLabel) {
            matchedLabel.label = newLabel;
        }

    }

    select(id) {
        const node = this.objects.find(obj => obj.id === id);
        if (node) {
            node.isSelected = true;
        }
    }

    clearLabels() {
        this.labels = [];
    }
}

export default ListTracer