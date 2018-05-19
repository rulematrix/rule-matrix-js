import { ModelBase } from './index';
import { BaseModel } from './base';

import * as nt from '../service/num';
// Tree Model

export interface LeafNode {
  readonly value: number[];
  readonly impurity: number;
  collapsed?: boolean;
  readonly idx: number;
  readonly output: number;
}

export interface InternalNode extends LeafNode {
  readonly left: TreeNode;
  readonly right: TreeNode;
  readonly feature: number;
  readonly threshold: number;
}

export type TreeNode = InternalNode | LeafNode;

export interface TreeModel extends ModelBase {
  readonly type: 'tree';
  readonly root: TreeNode;
  readonly nNodes: number;
  readonly maxDepth: number;
}

export function isLeafNode(node: TreeNode): node is LeafNode {
  return (<InternalNode> node).left === undefined;
}

export function isInternalNode(node: TreeNode): node is InternalNode {
  return (<InternalNode> node).left !== undefined;
}

export function isTreeModel(model: ModelBase): model is TreeModel {
  return model.type === 'tree';
}

export function collapseInit(root: TreeNode, threshold: number = 0.2) {
  console.log('init collpase attr!'); // tslint:disable-line
  const totalSupport = nt.sum(root.value);
  const minDisplaySupport = Math.floor(threshold * totalSupport);
  traverseTree(root, (node: TreeNode) => {
    node.collapsed = nt.sum(node.value) < minDisplaySupport;
  });
}

export function hasLeftChild(node: TreeNode) {
  return isInternalNode(node) && node.left;
}

export function hasRightChild(node: TreeNode) {
  return isInternalNode(node) && node.right;
}

// Performs pre-order traversal on a tree
export function traverseTree(source: TreeNode, fn: (node: TreeNode, i: number) => void) {
  let idx = 0;
  const _traverse = (node: TreeNode) => {
    // root
    fn(node, idx++);
    // left
    if (hasLeftChild(node)) {
      _traverse((node as InternalNode).left);
    }
    // right
    if (hasRightChild(node)) {
      _traverse((node as InternalNode).right);
    }
  };
  _traverse(source);
}

export class Tree extends BaseModel implements TreeModel {
  readonly type: 'tree';
  readonly root: TreeNode;
  readonly nNodes: number;
  readonly maxDepth: number;
  constructor(raw: TreeModel) {
    super(raw);
    const {root, nNodes, maxDepth} = raw;
    this.type = 'tree';
    this.root = root;
    this.nNodes = nNodes;
    this.maxDepth = maxDepth;
    collapseInit(this.root, 0.2);
  }
  traverse(fn: (node: TreeNode, i: number) => void) {
    traverseTree(this.root, fn);
  }
  
}