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
      <div class="flex items-center justify-between px-4 py-2 bg-[#f3f3f3] rounded-[8px] text-sm font-semibold cursor-pointer select-none hover:bg-[#e6e6e6] transition duration-300 ease-out">${person.name}</div>
    `;
  });
};

// Load schedule
const loadSchedule = async () => {
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

// Executions
loadSchedule();
