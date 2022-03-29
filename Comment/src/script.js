import { testComment } from './mock.js'
import { ELEMENT_ID } from './constant.js';

let comments = testComment;

const flushCommentsOnScreen = () => document.getElementById(ELEMENT_ID.COMMENTS).innerHTML = null;

function renderComment (parentElementId, comment) {
    if(!comment) return;
    const {id, text, replies} = comment;

    const commentWrapperElement = document.createElement('div');
    const commentElement = document.createElement('span');
    const replyButton = document.createElement('button');

    commentElement.textContent = text;
    replyButton.setAttribute("id", `${id}_BUTTON`)
    replyButton.textContent = 'Reply';
    replyButton.onclick = () => showInputToReplyComment(id);

    commentWrapperElement.setAttribute("id", id)
    commentWrapperElement.appendChild(commentElement);
    commentWrapperElement.appendChild(replyButton);

    const parentElement = document.getElementById(parentElementId);
    parentElement.appendChild(commentWrapperElement);
    replies?.map(comment => renderComment(id, comment))
}

function renderComments () {
    flushCommentsOnScreen();
    comments.map(comment => renderComment(ELEMENT_ID.COMMENTS, comment))
}

function addComment() {
    const comment = document.getElementById(ELEMENT_ID.COMMENT_BOX).value;
    const newComment = {
        id: (comments.length+1).toString(),
        text: comment,
        replies: null
    }
    comments.push(newComment);
    renderComments();
}

function addReply(id) {
    const replyComment = document.getElementById(`${id}_REPLY_INPUT`).value;
    const indices = id.split("_");
    let add = comments;
    indices.map((index, i) => {
        if(i !== indices.length-1)
            add = add[index-1].replies;
        else
            add = add[index-1];
    })
    // add = add[id.split("_").pop()-1]
    const newReply = {
        text: replyComment,
        replies: null
    };
    if(add.replies) {
        newReply.id = `${id}_${add.length+1}`;
        add.replies.push(newReply);
    } else {
        newReply.id = `${id}_1`;
        add.replies = [newReply];
    }
    renderComments();
}

const showInputToReplyComment = (id) => {
    const commentElement = document.getElementById(id);
    const replyInputElement = document.createElement('input');
    replyInputElement.setAttribute("id", `${id}_REPLY_INPUT`);
    const replyButtonElement = document.createElement('button'); 
    replyButtonElement.textContent = "Post Reply";
    replyButtonElement.onclick = () => addReply(id);
    commentElement.appendChild(replyInputElement);
    commentElement.appendChild(replyButtonElement);
}

function init () {
    const postButton = document.getElementById(ELEMENT_ID.POST_BUTTON);
    postButton.onclick = addComment;
    renderComments();
}

init();

