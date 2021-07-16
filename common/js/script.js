import { output } from './output.js';
import { statuses, Actor } from './actor.js';

const actor_num = 4;
let actors = [];

const actorHTML = (num) => {
  let status_list = '';
  statuses.forEach(status => {
    status_list += `
      <li class="status_item">
        <p class="status_title">${status.toUpperCase()}</p>
        <span id="actor${num}_${status}"></span>
      </li>
    `
  });
  return `
    <div class="actor_container">
      <input type="text" id="actor${num}" value="${num}">
      <ul class="status_list">
        ${status_list}
      </ul>
    </div>
  `
}

const set_status = (actor, index) => {
  statuses.forEach(status => document.getElementById(`actor${index}_${status}`).textContent = actor[status]);
}

const clear_status = index => {
  statuses.forEach(status => document.getElementById(`actor${index}_${status}`).textContent = '');
}

window.onload = function () {
  const $setButton = document.getElementById('setButton');
  const $startButton = document.getElementById('startButton');
  const $resetButton = document.getElementById('resetButton');
  let sorted_actors = [];

  for (let i = 0; i < actor_num; i++) document.getElementById('actorWrapper').innerHTML += actorHTML(i);

  $setButton.addEventListener('click', async () => {
    for (let i = 0; i < actor_num; i++) {
      const actor_name = document.getElementById(`actor${i}`).value;
      actors.push(await Actor.init(actor_name)); //アクターを生成して配列にプッシュ
    }

    actors.forEach((actor, index) => {
      set_status(actor, index);
    });

    sorted_actors = actors.slice();
    sorted_actors.sort((a, b) => b.agi - a.agi); //素早さ順に並び替え

    $setButton.style.display = 'none';
    $startButton.style.display = 'block';
    $resetButton.style.display = 'block';
  });

  $startButton.addEventListener('click', async () => {
    $startButton.style.display = 'none';
    $resetButton.style.pointerEvents = 'none';

    while (sorted_actors.length > 1) {
      for (let i = 0; i < sorted_actors.length; i++) {
        const atk = await sorted_actors[i].action();
        if (atk) {
          const arr = sorted_actors.filter(n => n !== sorted_actors[i]);
          const targeted = arr[Math.floor(Math.random() * arr.length)];
          let targeted_index;

          actors.forEach((actor, index) => { if (actor.name === targeted.name) targeted_index = index });
          await targeted.defend(atk, targeted_index);

          if (targeted.hp === 0) {
            sorted_actors = sorted_actors.filter(n => n !== targeted);
            if (i >= targeted.num) i--;
            if (sorted_actors.length === 1) break;
          }
        }
        await output('', false, 0);
      }
    }

    await output(`\n${sorted_actors[0].name} の しょうり！`, 'finish');

    $resetButton.style.pointerEvents = 'auto';
  });

  $resetButton.addEventListener('click', () => {
    for (let i = 0; i < actors.length; i++) clear_status(i);
    actors = [];

    document.getElementById('battleHistory').textContent = '';
    $startButton.style.display = 'none';
    $resetButton.style.display = 'none';
    $setButton.style.display = 'block';
  });
}