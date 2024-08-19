const textarea = document.querySelector("textarea");

textarea.addEventListener("input", () => {
  textarea.style.height = "52px";
  textarea.style.height = `${textarea.scrollHeight}px`;
});

const emojiMap = {
  ":phone:": "☎️",
  ":messages:": "💬",
  ":speech_balloon:": "💬",
  ":star:": "⭐",
  ":briefcase:": "💼",
  ":alert:": "🚨",
  ":rotating_light:": "🚨",
};

function replacePlaceholdersWithEmojis(text) {
  return text.replace(/:\w+:/g, (match) => {
    return emojiMap[match] || match;
  });
}

textarea.addEventListener("input", () => {
  console.log(textarea.value);
  textarea.value = replacePlaceholdersWithEmojis(textarea.value);
});
