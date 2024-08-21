# crm-rota

## Overview

A Chrome extension designed to simplify organizing and managing the CRM team's work rota. It supports easy input of team member names and their shifts, pasting of rota from Slack, and sorting the rota for clear, organized viewing.

## Installation

1. Download or clone this repository
2. Open Google Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** using the toggle switch at the top right
4. Click on **Load unpacked** and select the directory where you downloaded/cloned this repository
5. The extension will now be installed and visible in your Chrome toolbar

## Usage

1. **Enter Data:** Use the **Members** page to input team member names and their shift times.
2. **Paste Rota:** Paste the end-of-day rota from Slack on the **Home** page.
3. **Submit Input:** Click the submit button to process the rota. The results will appear on a new page with the sorted rota.
4. **Review Results:** The rota will be displayed with names sorted by count and shift time, with special handling for new hires marked with `[R3]`.

## Configuration

- **Input Formatting:** Titles like `☎️ INBOUND CRM ☎️` are required. Names should be formatted as `Name [R3] X > Name [R3] X`, where `[R3]` and `X` (the count) are both optional.
- **Shift Times:** Predefined shift times include `9PM`, `10PM`, `11PM`, and `12PM`.
- **Emoji Parsing:** Supported emojis for titles include: `☎️`, `💬`, `⭐`, `💼`, `🚨`.
