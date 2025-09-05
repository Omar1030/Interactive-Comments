// ? DOM Elements
const containerForComments = document.getElementById("containerForComments");
const newCommentText = document.getElementById("newCommentText");
const sendCommentBtn = document.getElementById("sendCommentBtn");
const modelDelete = document.getElementById("model-delete");
const overlay = document.getElementById("overlay");
const deleteBtns = document.getElementById("deleteBtns");
const cancelBtn = document.getElementById("cancelBtn");
const deleteBtn = document.getElementById("deleteBtn");

// ? Variables
let url = "../data.json";
let lastIndex = 4;
let _score, _type, _src, _name, _date, _text;
let newComment = "";
let scores;
let comments;
let tagetIconTrash;
let options;

// ! Function : Fetch Comments & Store it in local storage
async function fetchComments(url) {
  let data = await fetch(url);
  let response = data.json();
  response.then((com) => {
    localStorage.setItem("comments", JSON.stringify(com["comments"]));
  });
}

// ! Load Page
window.addEventListener("load", () => {
  // * Check if local storage has the comments
  if (localStorage.getItem("comments") && JSON.parse(localStorage.getItem("comments")).length != 0) {
    // ! Get data from local storage
    let commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));
    loadComments(commentsFromLocalStorage);
  } else {
    // ! Fecth data from JSON
    fetchComments(url);
    let commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));
    loadComments(commentsFromLocalStorage);
  }
});

// ! Function : Render comments in the page
function loadComments(commentsFromLocalStorage) {
  let allComments = document.createElement("div");
  allComments.setAttribute("id", "allComments");

  // Loop : Main comments
  for (var c in commentsFromLocalStorage) {
    _type = true;
    _id = commentsFromLocalStorage[c].id;
    _name = commentsFromLocalStorage[c].user["username"];
    _date = commentsFromLocalStorage[c]["createdAt"];
    _text = commentsFromLocalStorage[c]["content"];
    _score = commentsFromLocalStorage[c]["score"];
    _src = commentsFromLocalStorage[c].user["image"]["png"];
    allComments.appendChild(createMainComment(_id, _type, _score, _src, _name, _date, _text));

    // Loop : Replies "sub-comments"
    let replies = commentsFromLocalStorage[c]["replies"];
    for (var r in replies) {
      _type = false;
      _id = replies[r].id;
      _name = replies[r].user["username"];
      _date = replies[r]["createdAt"];
      _text = replies[r]["content"];
      _score = replies[r]["score"];
      _src = replies[r].user["image"]["png"];
      allComments.appendChild(createMainComment(_id, _type, _score, _src, _name, _date, _text));
    }
  }

  // Reload comments
  containerForComments.replaceChildren(allComments);

  // Actions : Update - Delete
  actions();

  // Sort scores
  sortComments();
}

// ! Function : Create Comment
function createMainComment(id, type, score, src, name, date, text) {
  let commentArticle = document.createElement("articel");
  commentArticle.dataset.score = score;
  commentArticle.setAttribute("id", id);
  commentArticle.setAttribute("class", "article-comment");
  commentArticle.classList.add("comment", "d-block", "mb-3");
  commentArticle.style.maxWidth = `${type ? "770px" : "660px"}`;
  commentArticle.innerHTML = ` 
      <button id="${id}" class="replyBtn btn position-absolute end-0 "><i class="fa-solid fa-reply me-2"></i>Reply</button>
      <div id="option-${id}" class="options position-absolute d-flex gap-3">
        <div id="${id}" class="editIcon"><i class="fa-solid fa-pen-to-square"></i></div>
        <div class="deleteIcon"><i class="fa-solid fa-trash"></i></div>
      </div>
      <div class="row py-4 px-2 rounded-3">
        <div class="col-12 col-md-1 order-2 order-md-1 text-center pt-3 pt-md-0">
          <article class="vote d-flex flex-row flex-md-column justify-content-evenly align-items-center gap-4 rounded-4 fw-bold text-light">
            <button id="${id}" class="upBtn btn">+</button>
            <span id="${id}" class="score">${score}</span>
            <button id="${id}" class="downBtn btn">-</button>
          </article>
        </div>
        <div class="col-12 col-md-11 order-1 order-md-2 ">
          <div class="info d-flex align-items-center gap-4">
            <img src="${src}" alt="perosn" width="45" height="45" loading="lazy" class="rounded-circle">
            <span class="name fw-bolder">${name}</span>
            <span class="create">${date}</span>
          </div>
          <div id="text-${id}" class="text mt-lg-3 mt-3">${text}</div>
        </div>
      </div>`;

  return commentArticle;
}

// ! Function : Actions => Update - Delete - Edit - Reply
function actions() {
  // UpBtn - downBtn - scores - comments - deleteBtn
  let upBtn = document.querySelectorAll(".upBtn");
  let downBtn = document.querySelectorAll(".downBtn");
  scores = document.querySelectorAll(".score");
  comments = document.querySelectorAll(".comment");
  let deleteIcon = document.querySelectorAll(".deleteIcon");
  let editIcon = document.querySelectorAll(".editIcon");
  options = document.querySelectorAll(".options");
  let replyBtn = document.querySelectorAll(".replyBtn");

  // Up comment
  upBtn.forEach((b) => b.addEventListener("click", rankComment));

  // Down comment
  downBtn.forEach((b) => b.addEventListener("click", rankComment));

  // Delete comment
  deleteIcon.forEach((b) => b.addEventListener("click", deleteComment));

  // Edit comment
  editIcon.forEach((b) => b.addEventListener("click", editComment));

  // Reply
  replyBtn.forEach((b) => b.addEventListener("click", replyToComment));
}

// ! Function : Add new comment to page
sendCommentBtn.addEventListener("click", addCommentToPage);
function addCommentToPage() {
  if (newCommentText.value.trim() != "") {
    let objComment = {
      id: lastIndex++,
      content: newCommentText.value,
      createdAt: "Now",
      score: 0,
      user: {
        image: {
          png: avatar.src,
        },
        username: username.value ? username.value : "Unknown",
      },
      replies: [],
    };

    newCommentText.value = "";
    username.value = "";
    avatar.src = "/images/avatars/image-unknown.webp";

    let updatedComments = JSON.parse(localStorage.getItem("comments"));
    updatedComments.push(objComment);

    localStorage.setItem("comments", JSON.stringify(updatedComments));

    let commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));

    loadComments(commentsFromLocalStorage);
  }
}

// * Rank
// ! Function : Update scores in local storage
function updateScoreInLocalStorage(id, operator) {
  let cfls = JSON.parse(localStorage.getItem("comments"));
  for (var c = 0; c < cfls.length; c++) {
    if (cfls[c].id == id) {
      if (operator == "+") cfls[c].score = cfls[c].score + 1;
      else if (operator == "-") cfls[c].score = cfls[c].score - 1;
      localStorage.setItem("comments", JSON.stringify(cfls));
      break;
    } else {
      for (var s = 0; s < cfls[c]["replies"].length; s++) {
        if (cfls[c]["replies"][s].id == id) {
          if (operator == "+") cfls[c]["replies"][s].score = cfls[c]["replies"][s].score + 1;
          else if (operator == "-") cfls[c]["replies"][s].score = cfls[c]["replies"][s].score - 1;
          localStorage.setItem("comments", JSON.stringify(cfls));
          break;
        }
      }
    }
  }
}

// ! Function : Sort comments
function sortComments() {
  let commentArticles = Array.from(allComments.children);
  commentArticles.sort((a, b) => b.dataset.score - a.dataset.score);
  commentArticles.forEach((c) => allComments.appendChild(c));
}

// ! Function : Update the rank of comment
function rankComment(e) {
  let arrScores = Array.from(scores);
  let cs = Array.from(comments);
  // Update dataset-score
  cs.forEach((c) => {
    if (e.target.id == c.id) {
      if (e.target.innerText == "+") {
        c.dataset.score = +c.dataset.score + 1;
        updateScoreInLocalStorage(c.id, "+");
      } else {
        c.dataset.score == 0 ? (c.dataset.score = 0) : (c.dataset.score = +c.dataset.score - 1);
        updateScoreInLocalStorage(c.id, "-");
      }
      sortComments();
    }
  });
  // Update Score text
  arrScores.forEach((s) => {
    if (s.id == e.target.id) {
      if (e.target.innerText == "+") {
        s.innerText = +s.innerText + 1;
      } else {
        +s.innerText == 0 ? (s.innerText = 0) : (s.innerText = +s.innerText - 1);
      }
    }
  });
}

// * Delete
// ! Function : Check deletion of the comment
function deleteComment(e) {
  tagetIconTrash = e.target;
  overlay.classList.remove("d-none");
  modelDelete.classList.remove("d-none");
  // Cancel
  cancelBtn.addEventListener("click", cancelFun);
  // Delete
  deleteBtn.addEventListener("click", deleteFun);
}

// ! Function : Cancel the deletion
function cancelFun() {
  console.log("From cancel button");
  overlay.classList.add("d-none");
  modelDelete.classList.add("d-none");
}

// ! Function : Confirm the deletion
function deleteFun() {
  overlay.classList.add("d-none");
  modelDelete.classList.add("d-none");
  tagetIconTrash.closest(".comment").remove();
  let targetId = tagetIconTrash.closest(".comment").id;
  let cfls = JSON.parse(localStorage.getItem("comments"));
  cfls.forEach((mc, i) => {
    if (targetId == mc.id) {
      cfls.splice(i, 1);
      let respliesIds = [];
      mc["replies"].forEach((rid) => {
        respliesIds.push(rid.id);
      });
      Array.from(allComments.children).forEach((ac) => {
        respliesIds.forEach((id) => {
          if (ac.id == id) {
            ac.remove();
          }
        });
      });
    } else {
      mc["replies"].forEach((sc, i) => {
        if (targetId == sc.id) {
          mc["replies"].splice(i, 1);
        }
      });
    }
  });
  localStorage.setItem("comments", JSON.stringify(cfls));
}

// * Edit
// ! Function : Edit the comment
function editComment() {
  const textBox = document.getElementById(`text-${this.id}`);
  const txt = textBox.innerText;
  const option = document.getElementById(`option-${this.id}`);
  textBox.innerHTML = `<textarea name="text" id="edit-text-${this.id}" class="edit-text">${txt}</textarea>`;
  option.innerHTML = `<button class="update-btn fw-bolder border-0 bg-transparent" onclick="updateComment(${this.id})">Update</button>`;
}

// ! Function : Update the comment
function updateComment(id) {
  const textBox = document.getElementById(`edit-text-${id}`);
  const txt = textBox.value;
  const baseText = document.getElementById(`text-${id}`);
  baseText.innerHTML = txt;
  const option = document.getElementById(`option-${id}`);
  option.innerHTML = `<div id="${id}" class="editIcon"><i class="fa-solid fa-pen-to-square"></i></div>
        <div class="deleteIcon"><i class="fa-solid fa-trash"></i></div>`;
  updateLocalStorage(id);
}

// ! Function : Update LocalStorage after update the comment
function updateLocalStorage(id) {
  const newTxt = document.getElementById(`text-${id}`).innerText;
  const commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));
  commentsFromLocalStorage.forEach((mc) => {
    if (mc.id == id) {
      mc.content = newTxt;
    } else {
      mc.replies.forEach((rc) => {
        if (rc.id == id) {
          rc.content = newTxt;
        }
      });
    }
  });
  localStorage.setItem("comments", JSON.stringify(commentsFromLocalStorage));
  loadComments(JSON.parse(localStorage.getItem("comments")));
}

// * Reply
// ! Function : Reply to the comment
function replyToComment(e) {
  let newReply = document.createElement("div");
  newReply.classList.add("newReply", "row", "py-4", "px-2", "rounded-3", "mb-3");
  newReply.innerHTML = `
        <div class="col-12 col-md-1 order-2 order-md-1 text-center pt-3 pt-md-0">

          <article class="vote d-flex flex-row flex-md-column justify-content-evenly align-items-center gap-4 rounded-4 fw-bold text-light">
            <button id="1" class="upBtn btn">+</button>
            <span id="1" class="score">0</span>
            <button id="1" class="downBtn btn">-</button>
          </article>

        </div>

        <div class="col-12 col-md-11 order-1 order-md-2 ">

          <div class="info d-flex align-items-center gap-4">
            <img src="./images/avatars/image-maxblagun.png" alt="perosn" width="45" height="45" loading="lazy" class="rounded-circle">
            <span class="name fw-bolder">maxblagun</span>
            <span class="create">2 weeks ago</span>
          </div>

          <div id="text-1" class="text mt-lg-3 mt-3">
            <textarea name="text" id="edit-text-1" class="edit-text"></textarea>
          </div>
          
          <button class="addNewReply">Reply</button>

        </div>`;
  e.target.closest(".article-comment").insertAdjacentElement("afterend", newReply);

  let commentsFromLocalStorage = JSON.parse(localStorage)

}

// * Data of user for new comment
// ! Function : Set data of user for adding comment
(function setData() {
  setImage();
})();

// ! Function : Set image
function setImage() {
  const avatar = document.getElementById("avatar");
  const avatarInput = document.getElementById("avatarInput");

  // * Open Input by click on image
  avatar.addEventListener("click", () => avatarInput.click());

  // * Get the image
  avatarInput.addEventListener("change", (e) => {
    const img = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
      avatar.src = e.target.result;
    });
    reader.readAsDataURL(img);
  });
}
