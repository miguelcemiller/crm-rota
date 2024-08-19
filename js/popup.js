// pages
const homePage = document.querySelector("#home-page");
const resultPage = document.querySelector("#result-page");
const membersPage = document.querySelector("#members-page");

// header els
const membersLink = document.querySelector("#members");
const homeLink = document.querySelector("#home");

// home page els
const textareaInput = document.querySelector("#textarea-input");
const submit = document.querySelector("button[id='submit']");

// result page els
const result = document.querySelector("#result");
const textareaResult = document.querySelector("#textarea-result");
const copyText = document.querySelector("#copy-text");
const back = document.querySelector("button[id='back']");

// members page els
const inputName = document.querySelector("#input-name");
const selectShift = document.querySelector("#shift");
const add = document.querySelector("#add");
const membersList = document.querySelector("#members-list");

// alerts
const alert = document.querySelector(".alert");
const alertValue = document.querySelector(".alert-value");
const closeAlert = document.querySelector(".close-alert");

closeAlert.addEventListener("click", () => {
  alert.style.display = "none";
});

// members header el click event
membersLink.addEventListener("click", () => {
  membersLink.style.display = "none";
  homeLink.style.display = "block";

  homePage.style.display = "none";
  resultPage.style.display = "none";
  membersPage.style.display = "block";
});

// home header els click event
homeLink.addEventListener("click", () => {
  homeLink.style.display = "none";
  membersLink.style.display = "block";

  membersPage.style.display = "none";
  resultPage.style.display = "none";
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
    const textToCopy = textareaInput.value.replace(/💬/g, ":messages:").replace(/🚨/g, ":alert:");

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
  textareaInput.value = "";
  textareaInput.style.height = "50px";

  resultPage.style.display = "none";
  homePage.style.display = "block";
});

// name input
inputName.addEventListener("input", () => {
  let value = inputName.value;

  if (value.length > 0) {
    inputName.value = value.charAt(0).toUpperCase() + value.slice(1);
  }
});

// function to update members list
function updateMembersList() {
  membersList.innerHTML = "";

  const members = JSON.parse(localStorage.getItem("members")) || {};

  // check if members object is empty
  if (Object.keys(members).length === 0) {
    membersList.innerHTML = "<div>no members found.</div>";
    return;
  }

  // iterate over each shift and its associated members
  for (const [shift, memberList] of Object.entries(members)) {
    memberList.forEach((member) => {
      // create a new list item for each member
      const membersListItem = document.createElement("div");
      membersListItem.classList.add("members-list-item");

      // set the inner HTML for the list item
      membersListItem.innerHTML = `
        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${member}</div>
        <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${shift}</div>
        <img class="delete" src="images/x.svg" alt="delete" />
      `;

      // append the new list item to the members list
      membersList.appendChild(membersListItem);
    });
  }

  // add event listeners to delete buttons
  document.querySelectorAll(".delete").forEach((button) => {
    button.addEventListener("click", (e) => {
      const itemDiv = e.target.closest(".members-list-item");
      const memberName = itemDiv.querySelector("div").textContent;
      const shift = itemDiv.querySelector("div:nth-child(2)").textContent;

      // remove member from local storage
      removeMemberFromLocalStorage(memberName, shift);

      // update the list
      updateMembersList();
    });
  });
}

// function to remove a member from local storage
function removeMemberFromLocalStorage(name, shift) {
  const members = JSON.parse(localStorage.getItem("members")) || {};

  if (members[shift]) {
    members[shift] = members[shift].filter((m) => m !== name);

    if (members[shift].length === 0) {
      delete members[shift];
    }

    localStorage.setItem("members", JSON.stringify(members));
  }
}

// function to save a member to local storage
function saveMemberToLocalStorage(name, shift) {
  const members = JSON.parse(localStorage.getItem("members")) || {};

  if (!members[shift]) {
    members[shift] = [];
  }

  members[shift].push(name);
  localStorage.setItem("members", JSON.stringify(members));
}

// add button click event
add.addEventListener("click", () => {
  const name = inputName.value.trim();
  const shift = selectShift.value;

  if (name && shift) {
    const members = JSON.parse(localStorage.getItem("members")) || {};

    // check if the name already exists in any shift
    const nameExists = Object.values(members).some((memberList) => memberList.includes(name));

    if (nameExists) {
      alertValue.innerText = "member already exists.";
      alert.style.display = "flex";
    } else {
      saveMemberToLocalStorage(name, shift);
      inputName.value = "";
      selectShift.value = "";

      updateMembersList();
    }
  } else {
    alertValue.innerText = "enter name and select shift.";
    alert.style.display = "flex";
  }
});

// initialize the shift list on page load
updateMembersList();
