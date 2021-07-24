import { output } from './output.js';
import { statuses, Actor } from './actor.js';

let actors = [];

const actorHTML = (num) => {
  let status_list = '';
  statuses.forEach(status => {
    status_list += `
      <li class="status_item">
        <p class="status_title">${status.toUpperCase()}</p>
        <span id="actor${num}_${status}"></span>
      </li>
    `;
  });
  status_list += `
    <li class="status_item">
      <p class="status_title">魔法</p>
      <span id="actor${num}_mag"></span>
    </li>
    <li class="status_item">
      <p class="status_title">職業</p>
      <span id="actor${num}_job"></span>
    </li>
  `;
  return `
    <div class="actor_container">
      <input type="text" id="actor${num}" class="actor_name" value="${num}">
      <ul class="status_list">
        ${status_list}
      </ul>
    </div>
  `;
};

const set_status = (actor, index) => {
  statuses.forEach(status => document.getElementById(`actor${index}_${status}`).textContent = actor[status]);
  document.getElementById(`actor${index}_mag`).textContent = actor.magic.name;
  document.getElementById(`actor${index}_job`).textContent = actor.job.name;
}

const clear_status = index => {
  statuses.forEach(status => document.getElementById(`actor${index}_${status}`).textContent = '');
  document.getElementById(`actor${index}_mag`).textContent = '';
  document.getElementById(`actor${index}_job`).textContent = '';
}

window.onload = function () {
  const $entryWrapper = document.getElementById('entryWrapper');
  const $plusButton = document.getElementById('plusButton');
  const $minusButton = document.getElementById('minusButton');
  const $setButton = document.getElementById('setButton');
  const $startButton = document.getElementById('startButton');
  const $resetButton = document.getElementById('resetButton');
  const $battleHistory = document.getElementById('battleHistory');
  let actor_num = 0;
  let sorted_actors = [];

  $plusButton.addEventListener('click', () => {
    document.getElementById('actorWrapper').innerHTML += actorHTML(actor_num++);
    document.getElementById('actorNum').value++;
    if (actor_num >= 2) $setButton.style.display = 'block';
  });

  $minusButton.addEventListener('click', () => {
    if (actor_num > 0) {
      document.getElementsByClassName('actor_container')[--actor_num].remove();
      document.getElementById('actorNum').value--;
      if (actor_num <= 1) $setButton.style.display = 'none';
    }
  });

  $setButton.addEventListener('click', async () => {
    const actor_names = [];

    Array.from(document.getElementsByClassName('actor_name')).forEach(actor_name => actor_name.readOnly = true);

    for (let i = 0; i < actor_num; i++) actor_names.push(document.getElementById(`actor${i}`).value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"));

    const s = new Set(actor_names);

    if (s.size === actor_names.length) {
      Actor.resetNum();
      $entryWrapper.style.display = 'none';

      for (let i = 0; i < actor_names.length; i++) actors.push(await Actor.init(actor_names[i])); //アクターを生成して配列にプッシュ

      actors.forEach((actor, index) => set_status(actor, index));

      sorted_actors = actors.slice();
      sorted_actors.sort((a, b) => b.agi - a.agi); //素早さ順に並び替え

      $setButton.style.display = 'none';
      $startButton.style.display = 'block';
      $resetButton.style.display = 'block';
      $battleHistory.textContent = '';
    } else {
      $battleHistory.textContent = '同名のキャラクターがいます';
    }
  });

  $startButton.addEventListener('click', async () => {
    let remain_actors = [];
    let elapsed_turn = 0;
    $startButton.style.display = 'none';
    $resetButton.style.pointerEvents = 'none';
    $battleHistory.style.display = 'block';

    while (remain_actors.length !== 1 && elapsed_turn <= 50) {
      for (let i = 0; i < sorted_actors.length; i++) {
        if (sorted_actors[i].down) continue;
        document.getElementsByClassName('actor_container')[sorted_actors[i].num].classList.add('-active');
        const atk = await sorted_actors[i].action();

        if (atk) {
          const arr = sorted_actors.filter(sorted_actor => sorted_actor !== sorted_actors[i] && !sorted_actor.down); //攻撃対象の配列を作成
          const targeted = arr[Math.floor(Math.random() * arr.length)];
          let targeted_index;

          actors.forEach((actor, index) => { if (actor.name === targeted.name) targeted_index = index });
          await targeted.defend(atk, targeted_index);

          if (targeted.hp === 0) targeted.down = true;
        }
        document.getElementsByClassName('actor_container')[sorted_actors[i].num].classList.remove('-active');
        await output('', false, 0);
      }
      elapsed_turn += 1;
      remain_actors = sorted_actors.filter(sorted_actor => !sorted_actor.down);
    }

    remain_actors = sorted_actors.filter((sorted_actor) => !sorted_actor.down);

    if (remain_actors.length === 1) {
      document.getElementsByClassName('actor_container')[remain_actors[0].num].classList.add('-active');
      await output(`\n${remain_actors[0].name} の しょうり！`, 'finish');
    } else {
      await output(`50ターンけいか ひきわけ`);
    }

    $resetButton.style.pointerEvents = 'auto';
  });

  $resetButton.addEventListener('click', () => {
    Array.from(document.getElementsByClassName('actor_container')).forEach(actor_container => actor_container.classList.remove('-active'));
    Array.from(document.getElementsByClassName('actor_name')).forEach(actor_name => actor_name.readOnly = false);
    for (let i = 0; i < actors.length; i++) clear_status(i);
    actors = [];

    $battleHistory.textContent = '';
    $battleHistory.style.display = 'none';
    $startButton.style.display = 'none';
    $resetButton.style.display = 'none';
    $entryWrapper.style.display = 'flex';
    $setButton.style.display = 'block';
  });
};
