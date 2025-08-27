const containerForComments = document.getElementById("containerForComments");
const newCommentText = document.getElementById("newCommentText");
const mainReplyBtn = document.getElementById("mainReplyBtn");

let url = "../data.json";
let index;
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

// Onload
window.addEventListener("load", () => {
  // * Check if local storage has the comments
  if (localStorage.getItem("comments")) {
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

// Function : Render comments in the page
function loadComments(commentsFromLocalStorage) {
  index = 0
  let allComments = document.createElement("div");
  allComments.setAttribute("id", "allComments");

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
      <div id="options" class="position-absolute d-flex gap-3"><i class="fa-solid fa-pen-to-square"></i><i class="fa-solid fa-trash"></i></div>
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
      id: index++,
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

    let commentsFromLocalStorage = JSON.parse(localStorage.getItem("comments"));

    loadComments(commentsFromLocalStorage);
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

function updateScoreInLocalStorage(id, operator) {
  let cfls = JSON.parse(localStorage.getItem("comments"));
  for (var c = 0; c < cfls.length; c++) {
    if (cfls[c].id == id) {
      console.log(cfls[c])
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

// Function : Update rank comment
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

// Function : Sort comments
function sortComments() {
  let commentArticles = Array.from(allComments.children);
  commentArticles.sort((a, b) => b.dataset.score - a.dataset.score);
  commentArticles.forEach((c) => allComments.appendChild(c));
}
