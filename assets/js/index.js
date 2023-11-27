const tenPmList = document.querySelector('#ten-pm-list');
const elevenPmList = document.querySelector('#eleven-pm-list');
const twelveAmList = document.querySelector('#twelve-am-list');
const oneAmList = document.querySelector('#one-am-list');

const shiftGroups = {
  '10PM': [],
  '11PM': [],
  '12AM': [],
  '1AM': [],
};

// Function to populate a list based on shift
const populateList = (shift, targetList) => {
  targetList.innerHTML = '';
  shiftGroups[shift].forEach((person) => {
    targetList.innerHTML += `
      <div class="flex items-center justify-between px-4 py-2 bg-[#f3f3f3] rounded-[8px] text-xs font-semibold cursor-pointer select-none hover:bg-[#e6e6e6] transition duration-300 ease-out">${person.name}</div>
    `;
  });
};

// Load schedule
const loadSchedule = async () => {
  // Clear existing data
  Object.keys(shiftGroups).forEach((shift) => {
    shiftGroups[shift] = [];
  });

  //get all person
  await fetch('/get-people', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => {
      const dataCopy = data;
      const people = JSON.parse(dataCopy.people);
      people.forEach((person) => {
        const shift = person.shift;
        shiftGroups[shift].push(person);
        shiftGroups[shift].sort((a, b) => a.shift_order - b.shift_order);
      });
    });

  // Populate lists for each shift
  populateList('10PM', tenPmList);
  populateList('11PM', elevenPmList);
  populateList('12AM', twelveAmList);
  populateList('1AM', oneAmList);
};

// Function to create Sortable configuration for a given shift
const createSortable = (shift) => ({
  animation: 150,
  ghostClass: 'ghost-class',
  onUpdate: async function (evt) {
    console.log(evt.oldIndex + 1, '->', evt.newIndex + 1);

    // Update orders
    await fetch('/update-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([evt.oldIndex + 1, evt.newIndex + 1, shift]),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  },
});

// Sortable 10 PM list
const sortableTenPmList = new Sortable(tenPmList, createSortable('10PM'));
// Sortable 11 PM list
const sortableElevenPmList = new Sortable(elevenPmList, createSortable('11PM'));
// Sortable 12 AM list
const sortableTwleveAmList = new Sortable(twelveAmList, createSortable('12AM'));
// Sortable 1 AM list
const sortableOneAmList = new Sortable(oneAmList, createSortable('1AM'));

// Check name and shift inputs
const inputName = document.querySelector('#input-name');
const selectShift = document.querySelector('#select-shift');
const addButton = document.querySelector('#add-button');

inputName.addEventListener('input', function () {
  const inputValue = inputName.value.trim();
  updateAddButtonState(inputValue, selectShift.value);
});

selectShift.addEventListener('change', () => {
  const selectedValue = selectShift.value;
  updateAddButtonState(inputName.value.trim(), selectedValue);
});

// Function to update Add button state
const updateAddButtonState = (nameValue, shiftValue) => {
  if (nameValue.length > 0 && shiftValue) {
    enableAddButton();
  } else {
    disableAddButton();
  }
};

// Toggle Add button
const enableAddButton = () => {
  addButton.classList.remove('disabled');
};

const disableAddButton = () => {
  addButton.classList.add('disabled');
};

// Executions
loadSchedule();

// Add person
const addPerson = async () => {
  // get number of people in shift
  let numberOfPepleInShift = 0;
  shiftGroups[selectShift.value].forEach((person) => {
    numberOfPepleInShift++;
  });
  //get all person
  await fetch('/add-person', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([inputName.value, selectShift.value, numberOfPepleInShift]),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // Refresh schedule
      loadSchedule();
    });
};

// Add button clicked
addButton.addEventListener('click', addPerson);

// Check input rota
const inputRota = document.querySelector('#input-rota');
const fireButton = document.querySelector('#fire-button');
const results = document.querySelector('#results');

inputRota.addEventListener('input', function (event) {
  const typedText = event.target.innerText.trim();
  if (typedText.length > 0) {
    fireButton.classList.remove('disabled');
  } else {
    fireButton.classList.add('disabled');
  }
});

// Fire button clicked
fireButton.addEventListener('click', () => {
  results.innerHTML = '';
  results.innerHTML = inputRota.innerText;
});
