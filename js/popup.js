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
const homeAlert = document.querySelector("#home-alert");
const membersAlert = document.querySelector("#members-alert");

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
  // if input is empty, return
  if (textareaInput.value.trim() === "") {
    alertValue.innerText = "input is empty.";
    homeAlert.style.display = "flex";
    return;
  }

  // get members from storage
  const members = JSON.parse(localStorage.getItem("members")) || {};

  // get text input
  const inputText = textareaInput.value.trim();

  const lines = inputText.split("\n");

  const titleEmojis = ["☎️", "💬", "⭐", "💼"];

  // FIND MISSING NAMES
  const uniqueNames = [];

  for (let line of lines) {
    const tokens = line.split(">").filter((token) => token.trim() !== "");
    for (let token of tokens) {
      const name = token.replace(/\d/g, "").trim();
      if (name !== "" && !titleEmojis.some((emoji) => name.startsWith(emoji) || name.endsWith(emoji)) && !uniqueNames.includes(name)) {
        uniqueNames.push(name);
      }
    }
  }

  const missingNames = uniqueNames.filter((name) => {
    // check if the name exists in any shift
    return !Object.values(members).some((member) => member.includes(name));
  });

  if (missingNames.length > 0) {
    const missingNamesList = missingNames.join(", ");
    alertValue.innerText = `${missingNamesList} not found`;
    homeAlert.style.display = "flex";
    return;
  }

  // separate inputs by title
  const separatedInputs = {};

  let currentTitle = "";
  lines.forEach((line) => {
    if (titleEmojis.some((emoji) => line.startsWith(emoji))) {
      currentTitle = line;
      separatedInputs[currentTitle] = [];
    } else {
      separatedInputs[currentTitle].push(line);
    }
  });

  // GROUP ACCORDING TO COUNT
  function groupAndSortNames(inputLine) {
    const namesWithoutNumbers = [];
    const namesWithNumbers = [];

    const tokens = inputLine.split(">").filter((token) => token.trim() !== "");
    tokens.forEach((token) => {
      const name = token.trim();
      const match = name.match(/(\d+)$/); // Check for number at the end of the name
      if (match) {
        namesWithNumbers.push({ name: name, number: parseInt(match[1], 10) });
      } else {
        namesWithoutNumbers.push(name);
      }
    });

    namesWithNumbers.sort((a, b) => a.number - b.number);

    const sortedNames = namesWithoutNumbers.concat(namesWithNumbers.map((obj) => obj.name));

    return sortedNames.join(" > ");
  }

  // GROUP BY COUNT AND SHIFT TIME
  function groupByCountAndShift(inputLines) {
    const shiftTimes = ["9PM", "10PM", "11PM", "12PM"];

    const groupedByCount = {};

    // initialize the groupedByCount object
    for (let i = 1; i <= 20; i++) {
      // starting from 1 to exclude 0 count
      groupedByCount[i] = {};
      shiftTimes.forEach((shift) => {
        groupedByCount[i][shift] = [];
      });
    }

    inputLines.forEach((line) => {
      const tokens = line.split(">").filter((token) => token.trim() !== "");
      tokens.forEach((token) => {
        const trimmedToken = token.trim();
        const match = trimmedToken.match(/(\d+)$/);
        const name = match ? trimmedToken.replace(/\d+$/, "").trim() : trimmedToken;
        const count = match ? parseInt(match[1], 10) : 0;

        // determine the shift time based on the name
        const shiftTime = shiftTimes.find((shift) => members[shift] && members[shift].includes(name)) || "Unknown";

        if (shiftTime !== "Unknown") {
          groupedByCount[count][shiftTime].push(trimmedToken);
        }
      });
    });

    // move the first member of each group to the end
    for (let count in groupedByCount) {
      for (let shiftTime in groupedByCount[count]) {
        const membersList = groupedByCount[count][shiftTime];
        if (membersList.length > 1) {
          // Move the first member to the end
          const firstMember = membersList.shift();
          membersList.push(firstMember);
        }
      }
    }

    // format the grouped result
    let result = [];

    // order by count first, then shift time
    Object.keys(groupedByCount)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((count) => {
        shiftTimes.forEach((shiftTime) => {
          if (groupedByCount[count][shiftTime].length > 0) {
            const sortedNames = groupedByCount[count][shiftTime].join(" > ");
            result.push(sortedNames);
          }
        });
      });

    return result.join(" > ");
  }

  for (let title in separatedInputs) {
    const inputLines = separatedInputs[title];
    const sortedLines = inputLines.map((line) => groupAndSortNames(line));

    // separate names with numbers and without numbers
    const namesWithNumbers = [];
    const namesWithoutNumbers = [];

    sortedLines.forEach((line) => {
      const tokens = line.split(">").filter((token) => token.trim() !== "");
      tokens.forEach((token) => {
        const trimmedToken = token.trim();
        const match = trimmedToken.match(/(\d+)$/);
        if (match) {
          namesWithNumbers.push(trimmedToken);
        } else {
          namesWithoutNumbers.push(trimmedToken);
        }
      });
    });

    // group names with numbers by count and shift time
    const groupedResult = groupByCountAndShift([namesWithNumbers.join(" > ")]);

    // add names without numbers at the beginning
    const finalResult = namesWithoutNumbers.join(" > ") + " > " + groupedResult;

    separatedInputs[title] = finalResult;
  }

  // OUPUT
  let formattedOutput = "";

  for (let title in separatedInputs) {
    if (separatedInputs.hasOwnProperty(title)) {
      const list = separatedInputs[title];
      formattedOutput += `${title}\n${list}\n`;
    }
  }

  // set the value of textareaResult
  textareaResult.value = formattedOutput.trim();

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
    const textToCopy = textareaResult.value.replace(/💬/g, ":messages:").replace(/🚨/g, ":alert:");

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

  // predefined order of shifts
  const shiftOrder = ["9PM", "10PM", "11PM", "12PM"];

  // sort the shifts according to the predefined order
  const sortedShifts = Object.keys(members).sort((a, b) => {
    return shiftOrder.indexOf(a) - shiftOrder.indexOf(b);
  });

  // iterate over each sorted shift and its associated members
  for (const shift of sortedShifts) {
    const memberList = members[shift];
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
      membersAlert.style.display = "flex";
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
