import { EMAIL_DATA } from "../public/data.js";
import { ELEMENT_ID } from "./constants.js";
import { removeAllChilds } from "./util.js";

const emails = EMAIL_DATA.emails;
const emailfolderElement = document.querySelector(`#${ELEMENT_ID.EMAIL_FOLDER}`);
const emailListElement = document.querySelector(`#${ELEMENT_ID.EMAIL_LIST}`);
const emailDescElement = document.querySelector(`#${ELEMENT_ID.EMAIL_DESC}`);
emailfolderElement.addEventListener('click', onFolderSelect);
emailListElement.addEventListener('click', onEmailSelect);

let selectedFolderId = "inbox";
let selectedEmail = emails[0];

function init () {
    preProcessEmail();
    renderEmailFolder();
    renderEmailList();
    renderEmailDesc ();
}

function preProcessEmail () {
    emails.map(email => {
        email.read = !!email.read;
        email.fav = !!email.fav;
    })
}

function renderEmailFolder () {
    const folders = [...emailfolderElement.children];
    folders.forEach((folder) => {
        if(folder.id === selectedFolderId)
            folder.classList.add("active");
        else
            folder.classList.remove("active");
        const folderwiseEmailCount = getFolderwiseEmailList(folder.id)?.length ?? 0;
        folder.querySelector("*[data-id='count']").textContent = folderwiseEmailCount;
    })
}

function getFolderwiseEmailList (folderId) {
    switch (folderId) {
        case "inbox": return emails;
        case "read": return emails.filter(({read}) => read);
        case "unread": return emails.filter(({read}) => !read);
        case "fav": return emails.filter(({fav}) => fav);
        default: return emails;
    }
}

function renderEmailList () {
    const emailListCardTemplateElement = document.querySelector("div[data-id='email-list-template']");
    let filteredEmails = getFolderwiseEmailList(selectedFolderId);
    selectedEmail = filteredEmails[0];
    removeAllChilds(emailListElement);
    filteredEmails.forEach((email, index) => {
        const {id, from, subject, content, time, read, fav} = email;
        let newEmailCardElement = emailListCardTemplateElement.cloneNode(true);
        newEmailCardElement.id = `email-list-card-${id}`;
        newEmailCardElement.dataset.id = id;
        newEmailCardElement.querySelector("*[data-id='from']").textContent = from;
        newEmailCardElement.querySelector("*[data-id='desc']").textContent = content;
        newEmailCardElement.querySelector("*[data-id='subject']").textContent = subject;
        newEmailCardElement.querySelector("*[data-id='time']").textContent = time;
        newEmailCardElement.querySelector("*[data-id='read-flag']").checked = read;
        newEmailCardElement.querySelector("*[data-id='read-flag']").addEventListener("click", (e) => markMailReadUnread(email, e));
        newEmailCardElement.querySelector("*[data-id='fav-flag']").checked = fav;
        newEmailCardElement.querySelector("*[data-id='fav-flag']").addEventListener("click", (e) => markMailFavorite(email, e));
        newEmailCardElement.querySelector("span[class='material-icons-outlined']").addEventListener("click", (e) => deleteEmail(email, e))
        if(selectedEmail.id === id) 
            newEmailCardElement.classList.add("active");
        emailListElement.appendChild(newEmailCardElement);
    });
}

function renderEmailDesc () {
    if(selectedEmail) {
        const {from, to, subject, content, time} = selectedEmail;
        emailDescElement.querySelector("*[data-id='from']").textContent = from;
        emailDescElement.querySelector("*[data-id='to']").textContent = to;
        emailDescElement.querySelector("*[data-id='desc']").textContent = content;
        emailDescElement.querySelector("*[data-id='subject']").textContent = subject;
        emailDescElement.querySelector("*[data-id='time']").textContent = time;
    } else {
        emailDescElement.querySelector("*[data-id='from']").textContent = "";
        emailDescElement.querySelector("*[data-id='to']").textContent = "";
        emailDescElement.querySelector("*[data-id='desc']").textContent = "";
        emailDescElement.querySelector("*[data-id='subject']").textContent = "";
        emailDescElement.querySelector("*[data-id='time']").textContent = "";
    }
}

function onFolderSelect (e) {
    selectedFolderId = e.target.id;
    init();
}

function onEmailSelect (e) {
    const cardPathIndex = e.path.findIndex(({id}) => id === ELEMENT_ID.EMAIL_LIST) - 1;
    const cardIndex = e.path[cardPathIndex].dataset.id;
    document.getElementById(`email-list-card-${selectedEmail.id}`).classList.remove("active");
    const selectedEmailElement = document.getElementById(`email-list-card-${cardIndex}`);
    selectedEmailElement.classList.add("active");
    selectedEmailElement.querySelector("input[data-id='read-flag']").checked = true;
    selectedEmail = emails[cardIndex-1];
    selectedEmail.read = true;
    renderEmailFolder();
    renderEmailDesc();
}


function markMailReadUnread (email, e) { 
    email.read = !email.read;
    renderEmailFolder();
    e.stopPropagation();
}

function markMailFavorite (email, e) {
    email.fav = !email.fav;
    renderEmailFolder();
    e.stopPropagation();
}

function deleteEmail (email, e) {
    const emailIndex = emails.findIndex(({id}) => id === email.id)
    emails.splice(emailIndex, 1);
    e.stopPropagation();
    init();
}

init();