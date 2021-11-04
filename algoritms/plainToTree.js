let arr = [
  { name: "root", parentId: null, id: 100 },
  { name: "1stlevelChild1", parentId: 100, id: 201 },
  { name: "1stlevelChild2", parentId: 100, id: 202 },
  { name: "2ndlevelChild1", parentId: 201, id: 301 },
  { name: "2ndlevelChild2", parentId: 201, id: 302 }
];

let parentNode = {};

function tree(data) {
  let idToNodeMap = {};
  let root = {};

  for (let i = 0; i < data.length; i++) {
    let datum = data[i];
    datum.children = [];
    idToNodeMap[datum.id] = datum;

    if (datum.parentId === null) {
      root = datum;
    } else {
      parentNode = idToNodeMap[datum.parentId];
      parentNode.children.push(datum);
    }
  }
  return root;
}

tree(arr);
