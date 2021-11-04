function Node(data, left, right) {
    this.data = data;
    this.left = left;
    this.right = right;
    this.count = 1;
}

Node.prototype.show = function() {
    return this.data;
};

function BST() {
    this.root = null;
}

BST.prototype.insert = function(data) {
    let node = new Node(data, null, null);
    if (this.root === null) {
        this.root = node;
    } else {
        let current = this.root;
        let parent;

        while (true) {
            parent = current;
            if (data < current.data) {
                current = current.left;
                if (current === null) {
                    parent.left = node;
                    break;
                }
            } else {
                current = current.right;
                if (current === null) {
                    parent.right = node;
                    break;
                }
            }
        }
    }
};

BST.prototype.inOrder = function(node) {
    if (!(node === null)) {
        this.inOrder(node.left);
        console.log(node.show() + " ");
        this.inOrder(node.right);
    }
};

BST.prototype.preOrder = function(node) {
    if (!(node === null)) {
        console.log(node.show() + " ");
        this.preOrder(node.left);
        this.preOrder(node.right);
    }
};

BST.prototype.postOrder = function(node) {
    if (!(node === null)) {
        this.postOrder(node.left);
        this.postOrder(node.right);
        console.log(node.show() + " ");
    }
};

BST.prototype.getMin = function() {
    let current = this.root;
    while (!(current.left === null)) {
        current = current.left;
    }
    console.log(current.show());
    return current.data;
};

BST.prototype.getMax = function() {
    let current = this.root;
    while (!(current.right === null)) {
        current = current.right;
    }
    console.log(current.show());
    return current.data;
};

BST.prototype.find = function(data) {
    let current = this.root;

    if (current === null) {
        return null;
    }

    while (current.data !== data) {
        if (data < current.data) {
            current = current.left;
        } else {
            current = current.right;
        }

        if (current === null) {
            return null;
        }
    }

    return current;
};

// New functionality
BST.prototype.update = function(data) {
    var grade = this.find(data);
    grade.count++;
    return grade;
};

BST.prototype.remove = function(data) {
    return this._removeNode(this.root, data);
};

BST.prototype._removeNode = function(node, data) {
    if (node === null) {
        return null;
    }

    if (data === node.data) {
        //node has no children
        if (node.left === null && node.right === null) {
            return null;
        }
        // node has no left child
        if (node.left === null) {
            return node.right;
        }

        // node has no right child
        if (node.right === null) {
            return node.left;
        }

        //node has two children
        let tempNode = node.right.getMin();
        node.data = tempNode.data;
        node.right = this._removeNode(node.right, tempNode.data);
        return node;
    } else if (data < node.data) {
        node.left = this._removeNode(node.left, data);
        return node;
    } else {
        node.right = this._removeNode(node.right, data);
        return node;
    }
};

function prArray(arr) {
    let i,
        j,
        temparray,
        slice,
        chunk = 10;
    for (i = 0, j = arr.length; i < j; i += chunk) {
        slice = arr.slice(i, i + chunk);
        console.log(slice.join(' ') + '\n');
    }
}

function genArray(length) {
    var arr = [];
    for (let i = 0; i < length; i++) {
        arr[i] = Math.floor(Math.random() * 101);
    }

    return arr;
}

let grades = genArray(100);
prArray(grades);

let gradedistro = new BST();
grades.forEach((x) => {
    let grade = gradedistro.find(x);
    gradedistro[grade === null ? 'insert' : 'update'](x);
});

let cont = 'y';
while (cont === 'y') {
    let g = parseInt(prompt('Enter a grade: '));
    let aGrade = gradedistro.find(g);
    console.log(aGrade === null ? `No occurrences of grade ${g}` : `Occurrences of ${g} : ${aGrade.count}`);
    cont = prompt('Look for another grade? (y/n)');
}
