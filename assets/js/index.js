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
    <div class="flex items-center justify-between gap-2 rounded-[8px] border border-dashed border-white bg-transparent hover:bg-[#272727] transition duration-300 ease-out px-3 py-2 cursor-pointer">
      <div class="flex-1 flex items-center justify-between text-white text-sm font-normal select-none">${person.name}</div>
      <svg id="deleteButton-${person.name}" class="h-[12px] w-auto cursor-pointer hover:opacity-50 fill-[#FA2E2E]" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox='0 0 24 24' onclick="removePerson('${person.name}', 
      '${shift}')">
       <path d="M5.633 22.031c1.135 1.313 3.735 1.969 6.334 1.969 2.601 0 5.199-.656 6.335-1.969.081-.404 3.698-18.468 3.698-18.882 0-2.473-7.338-3.149-10-3.149-4.992 0-10 1.242-10 3.144 0 .406 3.556 18.488 3.633 18.887zm6.418-16.884c-4.211 0-7.625-.746-7.625-1.667s3.414-1.667 7.625-1.667 7.624.746 7.624 1.667-3.413 1.667-7.624 1.667z"/>
      </svg>
    </div>
    `;
  });
};

// Remove person
const removePerson = async (person, shift) => {
  await fetch('/remove-person', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([person, shift]),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // Refresh schedule
      loadSchedule();
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

const handleInputChange = async () => {
  const inputValue = inputName.value.trim();
  await handleCheckName(inputValue, selectShift.value);
};

const handleShiftChange = async () => {
  await handleCheckName(inputName.value.trim(), selectShift.value);
};

const handleCheckName = async (name, shiftValue) => {
  const response = await fetch('/check-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([name.toLowerCase()]),
  });

  const data = await response.json();
  const errorMessage = document.querySelector('#error-message');
  const nameExists = data.message;

  if (nameExists) {
    errorMessage.classList.remove('hidden');
    disableAddButton();
  } else {
    errorMessage.classList.add('hidden');
    updateAddButtonState(name, shiftValue);
  }
};

inputName.addEventListener('input', handleInputChange);
selectShift.addEventListener('change', handleShiftChange);

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
      // Reset inputs
      inputName.value = '';
      selectShift.selectedIndex = 0;
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
