/* 
------------- ATTENTION -------------
IF You will add a condition to check if the data is exist in local storage 
    true: Load it from local storage
ELSE 
    false: fetch it from JSON

*/

const containerForComments = document.getElementById("containerForComments");

const newCommentText = document.getElementById("newCommentText");
const mainReplyBtn = document.getElementById("mainReplyBtn");

let url = "../data.json";
let index = 0;
let _score, _type, _src, _name, _date, _text;
let newComment = "";
let scores;
let comments;

// Function : Fetch Comments & Store it in local storage
async function fetchComments(url) {
  let data = await fetch(url);
  let response = data.json();
  response.then((com) => {
    localStorage.setItem("comments", JSON.stringify(com["comments"]));
  });
}
fetchComments(url);

// Load comment on the page
window.addEventListener("load", loadComments);

function loadComments() {
  let allComments = document.createElement("div");
  allComments.setAttribute("id", "allComments");

  // Add comments to allcomments
  if (localStorage.getItem("comments")) {
    // Comments from localStorage
    let commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));

    // Loop : Main comments
    for (var c in commentsFromLocalStorage) {
      _type = true;
      _name = commentsFromLocalStorage[c].user["username"];
      _date = commentsFromLocalStorage[c]["createdAt"];
      _text = commentsFromLocalStorage[c]["content"];
      _score = commentsFromLocalStorage[c]["score"];
      _src = `images/avatars/image-${_name}.webp`;
      allComments.appendChild(createMainComment(index++, _type, _score, _src, _name, _date, _text));

      // Loop : Replies "sub-comments"
      let replies = commentsFromLocalStorage[c]["replies"];
      for (var r in replies) {
        _type = false;
        _name = replies[r].user["username"];
        _date = replies[r]["createdAt"];
        _text = replies[r]["content"];
        _score = replies[r]["score"];
        _src = `images/avatars/image-${_name}.webp`;
        allComments.appendChild(createMainComment(index++, _type, _score, _src, _name, _date, _text));
      }
    }
  }

  // Reload comments
  containerForComments.replaceChildren(allComments);

  // Update scores
  updateScores();

  // Sort scores
  sortComments();
}

// Function : Create Comment
function createMainComment(id, type, score, src, name, date, text) {
  let commentArticle = document.createElement("articel");
  commentArticle.dataset.score = score;
  commentArticle.setAttribute("id", id);
  commentArticle.classList.add("comment", "d-block", "mb-3");
  commentArticle.style.maxWidth = `${type ? "770px" : "660px"}`;
  commentArticle.innerHTML = ` 
      <button id="${id}" class="reply btn position-absolute end-0 "><i class="fa-solid fa-reply me-2"></i>Reply</button>
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
            <img src="${src}" alt="perosn" width="45" height="45" loading="lazy">
            <span class="name fw-bolder">${name}</span>
            <span class="create">${date}</span>
          </div>
          <div class="text mt-lg-3 mt-3">${text}</div>
        </div>
      </div>`;

  return commentArticle;
}

// Function : Get text of new comment
// newCommentText.addEventListener("change", (e) => {
//   newComment = e.target.value;
//   // e.target.value = "";
// });

// Function : Add comment to page
mainReplyBtn.addEventListener("click", addCommentToPage);
function addCommentToPage() {
  if (newCommentText.value.trim() != "") {
    let objComment = {
      id: index,
      content: newCommentText.value,
      createdAt: "Now",
      score: 0,
      user: {
        username: "amyrobson",
      },
      replies: [],
    };

    newCommentText.value = "";

    let updatedComments = JSON.parse(localStorage.getItem("comments"));
    updatedComments.push(objComment);

    localStorage.setItem("comments", JSON.stringify(updatedComments));

    loadComments();
  }
}

// Function : Update scores
function updateScores() {
  // UpBtn - downBtn - scores - comments
  let upBtn = document.querySelectorAll(".upBtn");
  let downBtn = document.querySelectorAll(".downBtn");
  scores = document.querySelectorAll(".score");
  comments = document.querySelectorAll(".comment");

  // Up comment
  upBtn.forEach((b) => b.addEventListener("click", rankComment));

  // Down comment
  downBtn.forEach((b) => b.addEventListener("click", rankComment));
}

// Function : Update rank comment
function rankComment(e) {
  let arrScores = Array.from(scores);
  let cs = Array.from(comments);
  // Update dataset-score
  cs.forEach((c) => {
    if (e.target.id == c.id) {
      if (e.target.innerText == "+") {
        c.dataset.score = +c.dataset.score + 1;
      } else {
        c.dataset.score == 0 ? (c.dataset.score = 0) : (c.dataset.score = +c.dataset.score - 1);
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

// Function : Sort comments
function sortComments() {
  let commentArticles = Array.from(allComments.children);
  commentArticles.sort((a, b) => b.dataset.score - a.dataset.score);
  commentArticles.forEach((c) => allComments.appendChild(c));
}
