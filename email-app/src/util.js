export const removeAllChilds = node => {
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}