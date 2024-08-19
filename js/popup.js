// pages
const homePage = document.querySelector("#home-page");
const resultPage = document.querySelector("#result-page");
const membersPage = document.querySelector("#members-page");

// header els
const members = document.querySelector("#members");
const home = document.querySelector("#home");

// home page els
const textareaInput = document.querySelector("#textarea-input");
const submit = document.querySelector("button[id='submit']");

// result page els
const result = document.querySelector("#result");
const textareaResult = document.querySelector("#textarea-result");
const copyText = document.querySelector("#copy-text");
const back = document.querySelector("button[id='back']");

// members page els
const nameInput = document.querySelector("#member-name");
const selectShift = document.querySelector("#shift");
const add = document.querySelector("#add");
const membersList = document.querySelector("#members-list");

// global
const textarea = document.querySelector("textarea");

// members header el click event
members.addEventListener("click", () => {
  members.style.display = "none";
  home.style.display = "block";

  homePage.style.display = "none";
  membersPage.style.display = "block";
});

// home header els click event
home.addEventListener("click", () => {
  home.style.display = "none";
  members.style.display = "block";

  membersPage.style.display = "none";
  homePage.style.display = "block";
});

// emoji mappings
const emojiMap = {
  ":phone:": "☎️",
  ":messages:": "💬",
  ":star:": "⭐",
  ":briefcase:": "💼",
  ":alert:": "🚨",
  ":rotating_light:": "🚨",
};

// function to replace placeholders with emojis
function replacePlaceholdersWithEmojis(text) {
  return text.replace(/:\w+:/g, (match) => {
    return emojiMap[match] || match;
  });
}

// textarea text input event
textareaInput.addEventListener("input", () => {
  textareaInput.style.height = "52px";
  textareaInput.style.height = `${textareaInput.scrollHeight}px`;
  textareaInput.value = replacePlaceholdersWithEmojis(textareaInput.value);
});

// submit button click event
submit.addEventListener("click", () => {
  textareaResult.value = textareaInput.value;

  requestAnimationFrame(() => {
    textareaResult.style.height = "52px";
    textareaResult.style.height = `${textareaResult.scrollHeight}px`;
  });

  homePage.style.display = "none";
  resultPage.style.display = "block";
});

// prevent user select in textarea result
textareaResult.addEventListener("mousedown", (e) => e.preventDefault());
textareaResult.addEventListener("keydown", (e) => e.preventDefault());

// copy text click event
copyText.addEventListener("click", () => {
  // only copy if text is 'copy text'
  if (copyText.querySelector("div").innerText == "copy text") {
    // replace 💬 with :messages: and 🚨 with :alert: in the textarea value
    const textToCopy = textarea.value.replace(/💬/g, ":messages:").replace(/🚨/g, ":alert:");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        copyText.querySelector("img").src = "images/copied.svg";
        copyText.querySelector("div").innerText = "copied!";

        setTimeout(() => {
          copyText.querySelector("img").src = "images/copy-text.svg";
          copyText.querySelector("div").innerText = "copy text";
        }, 1000);
      })
      .catch((err) => {
        console.error("failed to copy text: ", err);
      });
  }
});

// back button click event
back.addEventListener("click", () => {
  textarea.value = "";
  textarea.style.height = "50px";

  resultPage.style.display = "none";
  homePage.style.display = "block";
});

// function to update members list
function updateMembersList() {
  membersList.innerHTML = ""; // Clear existing list
  const membersShifts = JSON.parse(localStorage.getItem("shifts")) || {};
  for (const [shiftObj, membersObj] of Object.entries(membersShifts)) {
    membersObj.forEach((member) => {
      const membersListItem = document.createElement("div");
      membersListItem.classList.add("members-list-item");
      membersListItem.innerHTML = `<div>${member}</div><div>${shiftObj}</div><img src="images/x.svg" alt="" />`;
      membersList.appendChild(membersListItem);
    });
  }
}

function saveShiftToLocalStorage(shift, member) {
  const shifts = JSON.parse(localStorage.getItem("shifts")) || {};
  if (!shifts[shift]) {
    shifts[shift] = [];
  }
  shifts[shift].push(member);
  localStorage.setItem("shifts", JSON.stringify(shifts));
}

add.addEventListener("click", () => {
  const memberName = nameInput.value.trim();
  const timeShift = selectShift.value;

  if (memberName && timeShift) {
    saveShiftToLocalStorage(timeShift, memberName);
    nameInput.value = "";
    selectShift.value = "";
    updateMembersList();
  } else {
    alert("please enter a team member and select a time shift.");
  }
});

// Initialize the shift list on page load
updateMembersList();
