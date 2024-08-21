// pages
const homePage = document.querySelector("#home-page");
const resultPage = document.querySelector("#result-page");
const membersPage = document.querySelector("#members-page");

// header links
const membersLink = document.querySelector("#members");
const homeLink = document.querySelector("#home");

// home page els
const textareaInput = document.querySelector("#textarea-input");
const submit = document.querySelector("button[id='submit']");

// result page els
const result = document.querySelector("#result");
const textareaResult = document.querySelector("#textarea-result");
const textareaResultContainer = document.querySelector("#textarea-result-container");
const overlay = document.querySelector("#overlay");
const back = document.querySelector("button[id='back']");

// members page els
const inputName = document.querySelector("#input-name");
const selectShift = document.querySelector("#shift");
const add = document.querySelector("#add");
const membersList = document.querySelector("#members-list");

// alerts
const homeAlert = document.querySelector("#home-alert");
const membersAlert = document.querySelector("#members-alert");
const closeAlerts = document.querySelectorAll(".close-alert");

// close alerts click event
closeAlerts.forEach((closeAlert) => {
  closeAlert.addEventListener("click", () => {
    closeAlert.parentElement.style.display = "none";
  });
});

// members link click event
membersLink.addEventListener("click", () => {
  membersLink.style.display = "none";
  homeLink.style.display = "block";

  membersAlert.style.display = "none";
  inputName.value = "";
  selectShift.value = "";

  homePage.style.display = "none";
  resultPage.style.display = "none";
  membersPage.style.display = "block";
});

// home link click event
homeLink.addEventListener("click", () => {
  homeLink.style.display = "none";
  membersLink.style.display = "block";

  homeAlert.style.display = "none";
  textareaInput.value = "";
  textareaInput.style.height = "50px";

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
  ":redsiren:": "🚨",
  ":siren:": "🚨",
  ":alert-1803:": "🚨",
};

// function to replace placeholders with emojis
function replacePlaceholdersWithEmojis(text) {
  return text.replace(/:[\w-]+:/g, (match) => {
    return emojiMap[match] || match;
  });
}

// textarea text input event
textareaInput.addEventListener("input", () => {
  textareaInput.style.height = "52px";
  textareaInput.style.height = `${textareaInput.scrollHeight}px`;
  textareaInput.value = replacePlaceholdersWithEmojis(textareaInput.value);
});

// trigger submit on Enter key
textareaInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    submit.click();
  }
});

// submit button click event
submit.addEventListener("click", () => {
  // hide home alerts
  homeAlert.style.display = "none";

  // if input is empty, return
  if (textareaInput.value.trim() === "") {
    homeAlert.querySelector(".alert-value").innerText = "input is empty";
    homeAlert.style.display = "flex";
    return;
  }

  // get members from storage
  const members = JSON.parse(localStorage.getItem("members")) || {};

  // get text input
  const inputText = textareaInput.value.trim();

  const lines = inputText.split("\n");

  const titleEmojis = ["☎️", "💬", "⭐", "💼", "🚨"];

  // FIND MISSING NAMES
  const uniqueNames = [];

  // utility function to clean names
  function cleanName(name) {
    return name
      .replace(/\s*\[R\d+\]\s*/, "")
      .replace(/\d+$/, "")
      .trim();
  }

  for (let line of lines) {
    const tokens = line.split(">").filter((token) => token.trim() !== "");
    for (let token of tokens) {
      let name = token.trim();
      // clean the name
      name = cleanName(name);
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
    homeAlert.querySelector(".alert-value").innerText = `${missingNamesList} not found`;
    homeAlert.style.display = "flex";
    return;
  }

  // separate inputs by title
  const separatedInputs = {};
  let currentTitle = "";

  for (const line of lines) {
    if (titleEmojis.some((emoji) => line.startsWith(emoji))) {
      currentTitle = line;
      separatedInputs[currentTitle] = [];
    } else {
      // check if there is a valid title set
      if (!currentTitle) {
        homeAlert.querySelector(".alert-value").innerText = "invalid input";
        homeAlert.style.display = "flex";
        return;
      }
      // push line to the current title's array
      separatedInputs[currentTitle].push(line);
    }
  }

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

    // Join names with " > " and ensure only one space around ">"
    return sortedNames.join(" > ").replace(/ > +/g, " > ").trim();
  }

  // GROUP BY COUNT AND SHIFT TIME
  function groupByCountAndShift(inputLines) {
    const shiftTimes = ["9PM", "10PM", "11PM", "12PM"];

    const groupedByCount = {};
    const groupedByR3 = {};

    // Initialize the groupedByCount and groupedByR3 objects
    for (let i = 1; i <= 20; i++) {
      groupedByCount[i] = {};
      groupedByR3[i] = {};
      shiftTimes.forEach((shift) => {
        groupedByCount[i][shift] = [];
        groupedByR3[i][shift] = [];
      });
      // Initialize "Unknown" shift time
      groupedByCount[i]["Unknown"] = [];
      groupedByR3[i]["Unknown"] = [];
    }

    const namesWithoutCounts = [];
    const namesWithoutCountsR3 = [];

    inputLines.forEach((line) => {
      const tokens = line.split(">").filter((token) => token.trim() !== "");
      tokens.forEach((token) => {
        const trimmedToken = token.trim();
        const match = trimmedToken.match(/(\d+)$/);
        const isR3 = /\[R\d+\]/.test(trimmedToken);
        const name = match ? trimmedToken.replace(/\d+$/, "").trim() : trimmedToken;
        const count = match ? parseInt(match[1], 10) : 0;

        // Determine the shift time based on the name
        const shiftTime = shiftTimes.find((shift) => {
          const normalizedShiftNames = members[shift]?.map((n) => n.trim().toLowerCase());
          return normalizedShiftNames && normalizedShiftNames.includes(name.toLowerCase());
        });

        if (isR3) {
          if (count === 0) {
            namesWithoutCountsR3.push(trimmedToken);
          } else if (shiftTime) {
            groupedByR3[count][shiftTime].push(trimmedToken);
          } else {
            groupedByR3[count]["Unknown"].push(trimmedToken); // Handle unknown shift time for R3 names
          }
        } else {
          if (count === 0) {
            namesWithoutCounts.push(trimmedToken);
          } else if (shiftTime) {
            groupedByCount[count][shiftTime].push(trimmedToken);
          } else {
            groupedByCount[count]["Unknown"].push(trimmedToken); // Handle unknown shift time for non-R3 names
          }
        }
      });
    });

    // Move the first member of each group to the end
    function moveFirstMemberToEnd(groupedByCount) {
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
    }

    moveFirstMemberToEnd(groupedByR3);
    moveFirstMemberToEnd(groupedByCount);

    // Format the grouped result
    let resultR3 = [];
    let result = [];

    // Order by count first, then shift time
    Object.keys(groupedByR3)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((count) => {
        shiftTimes.concat(["Unknown"]).forEach((shiftTime) => {
          // Include "Unknown" shift time in sorting
          if (groupedByR3[count][shiftTime].length > 0) {
            const sortedNames = groupedByR3[count][shiftTime]
              .map((item) => item.replace(/\d+$/, "")) // Remove counts from names
              .join(" > ")
              .replace(/\s*>\s*/g, " > ") // Ensure single space around ">"
              .replace(/\s*\[R\d+\]\s*/g, " [R3] "); // Ensure single space around [R3]
            resultR3.push(sortedNames);
          }
        });
      });

    Object.keys(groupedByCount)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((count) => {
        shiftTimes.concat(["Unknown"]).forEach((shiftTime) => {
          // Include "Unknown" shift time in sorting
          if (groupedByCount[count][shiftTime].length > 0) {
            const sortedNames = groupedByCount[count][shiftTime]
              .map((item) => item.replace(/\d+$/, "")) // Remove counts from names
              .join(" > ")
              .replace(/\s*>\s*/g, " > ") // Ensure single space around ">"
              .replace(/\s*\[R\d+\]\s*/g, " [R3] "); // Ensure single space around [R3]
            result.push(sortedNames);
          }
        });
      });

    const finalR3Result = namesWithoutCountsR3.length > 0 ? namesWithoutCountsR3.join(">") + (resultR3.length > 0 ? ">" : "") + resultR3.join(">") : resultR3.join(">");

    const finalResult = namesWithoutCounts.length > 0 ? namesWithoutCounts.join(">") + (result.length > 0 ? ">" : "") + result.join(">") : result.join(">");

    return (finalR3Result + (finalR3Result && finalResult ? " > " : "") + finalResult)
      .replace(/\s*>\s*/g, " > ") // Ensure single space around ">"
      .trim();
  }

  for (let title in separatedInputs) {
    const inputLines = separatedInputs[title];
    const sortedLines = inputLines.map((line) => groupAndSortNames(line));

    const groupedResult = groupByCountAndShift([sortedLines.join(" > ")]);

    separatedInputs[title] = groupedResult;
  }

  // OUTPUT
  let formattedOutput = "";

  for (let title in separatedInputs) {
    if (separatedInputs.hasOwnProperty(title)) {
      const list = separatedInputs[title];
      formattedOutput += `${title}\n${list}\n`;
    }
  }

  textareaResult.value = formattedOutput.trim();

  // show the result page
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

// textarea result container hover
textareaResultContainer.addEventListener("mouseover", () => {
  overlay.classList.add("active");
  overlay.setAttribute("copy", true);
});

textareaResultContainer.addEventListener("mouseout", () => {
  overlay.classList.remove("active");
  overlay.setAttribute("copy", false);
});

// overlay click event
overlay.addEventListener("click", () => {
  // only copy if text attribute copy is true
  if (overlay.getAttribute("copy") == "true") {
    // replace 💬 with :messages: and 🚨 with :alert: in the textarea value
    const textToCopy = textareaResult.value.replace(/💬/g, ":messages:").replace(/🚨/g, ":alert:");

    // copy to clipboard
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        overlay.querySelector("img").src = "images/copied.svg";
        overlay.style.pointerEvents = "none";

        setTimeout(() => {
          overlay.querySelector("img").src = "images/copy-text.svg";
          overlay.style.pointerEvents = "auto";
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
  // hide members alert
  membersAlert.style.display = "none";

  const name = inputName.value.trim();
  const shift = selectShift.value;

  if (name && shift) {
    const members = JSON.parse(localStorage.getItem("members")) || {};

    // check if the name already exists in any shift
    const nameExists = Object.values(members).some((memberList) => memberList.includes(name));

    if (nameExists) {
      membersAlert.querySelector(".alert-value").innerText = "member already exists";
      membersAlert.style.display = "flex";
      return;
    } else {
      saveMemberToLocalStorage(name, shift);
      inputName.value = "";
      selectShift.value = "";

      updateMembersList();
    }
  } else {
    membersAlert.querySelector(".alert-value").innerText = "enter name and shift";
    membersAlert.style.display = "flex";
    return;
  }
});

// initialize the shift list on page load
updateMembersList();
