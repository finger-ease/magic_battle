import { output } from './output.js';
import { Actor } from './actor.js';
import data from './data.js';

class Button {
  constructor(id, boolean) {
    this.elem = document.getElementById(id);
    this.flag_1 = boolean;
    this.flag_2 = true;
  }

  enable() {
    this.flag_1 = true;
    this.elem.disabled = false;
  }

  disable() {
    this.flag_1 = false;
    this.elem.disabled = true;
  }
}

const $omitMode = document.getElementById('omitMode');
const $randomMode = document.getElementById('randomMode');
const $increaseButton = new Button('increaseButton', true);
const $decreaseButton = new Button('decreaseButton', true);
const $setButton = new Button('setButton', false);
const $battleButton = new Button('battleButton', false);
const $resetButton = new Button('resetButton', false);
const $actorContainers = document.getElementsByClassName('actor_container');
const $battleHistory = document.getElementById('battleHistory');
const input = {flag: true};
let actors = [];
let actor_num = 0;
let sorted_actors = [];

const actorHTML = (num) => {
  let status_list = '';
  data.statuses.forEach(status => {
    status_list += `
      <li class="status_item">
        <p class="status_title">${status.toUpperCase()}</p>
        <span id="actor${num}_${status}"></span>
      </li>
    `;
  });
  status_list += `
    <li class="status_item">
      <p class="status_title">職業</p>
      <span id="actor${num}_job"></span>
    </li>
    <li class="status_item">
      <p class="status_title">魔法1</p>
      <span id="actor${num}_mag1"></span>
    </li>
    <li class="status_item">
      <p class="status_title">魔法2</p>
      <span id="actor${num}_mag2"></span>
    </li>
    <li class="status_item">
      <p class="status_title">状態</p>
      <span id="actor${num}_cond"></span>
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
}

const setStatus = (actor, i) => {
  data.statuses.forEach(status => document.getElementById(`actor${i}_${status}`).textContent = actor[status]);
  document.getElementById(`actor${i}_job`).textContent = actor.job.name;
  actor.magic.forEach((magic, j) => document.getElementById(`actor${i}_mag${j + 1}`).textContent = magic.name);
  document.getElementById(`actor${i}_cond`).textContent = '健康';
}

const clearStatus = i => {
  data.statuses.forEach(status => document.getElementById(`actor${i}_${status}`).textContent = '');
  document.getElementById(`actor${i}_mag1`).textContent = '';
  document.getElementById(`actor${i}_mag2`).textContent = '';
  document.getElementById(`actor${i}_job`).textContent = '';
  document.getElementById(`actor${i}_cond`).textContent = '';
}

const increaseActor = () => {
  if ($increaseButton.flag_1 && $increaseButton.flag_2) {
    document.getElementById('actorWrapper').insertAdjacentHTML('beforeend', actorHTML(actor_num++));
    document.getElementById('actorNum').value++;
    if (actor_num >= 2) $setButton.enable();
    [...document.getElementsByClassName('actor_name')].forEach(actor_name => actor_name.addEventListener('focus', () => { //インプットにフォーカス時、キー操作を無効化
      input.flag = false;
      $increaseButton.flag_2 = false;
      $decreaseButton.flag_2 = false;
      $setButton.flag_2 = false;
      $battleButton.flag_2 = false;
      $resetButton.flag_2 = false;
    }));

    [...document.getElementsByClassName('actor_name')].forEach(actor_name => actor_name.addEventListener('blur', () => {
      input.flag = true;
      $increaseButton.flag_2 = true;
      $decreaseButton.flag_2 = true;
      $setButton.flag_2 = true;
      $battleButton.flag_2 = true;
      $resetButton.flag_2 = true;
    }));

    if ($omitMode.checked) document.querySelectorAll('.status_item:nth-of-type(n+3):nth-of-type(-n+11)').forEach(status_item => status_item.style.display = 'none');
    if ($randomMode.checked) {
      const cs = Array(Math.floor(Math.random() * 10) + 1);
      const span = 0x3093 - 0x3041 + 1;

      for (let j = 0; j < cs.length; j++) cs[j] = 0x3041 + Math.floor(Math.random() * span);
      document.getElementById(`actor${actor_num - 1}`).value = String.fromCharCode.apply(String, cs);
    }
  }
}

const decreaseActor = () => {
  if ($decreaseButton.flag_1 && $decreaseButton.flag_2 && actor_num > 0) {
    $actorContainers[--actor_num].remove();
    if (actor_num <= 1) $setButton.disable();
    document.getElementById('actorNum').value--;
  }
}

const set = async () => {
  if ($setButton.flag_1 && $setButton.flag_2) {
    const actorNames = [];

    for (let i = 0; i < actor_num; i++) actorNames.push(document.getElementById(`actor${i}`).value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"));

    const s = new Set(actorNames);

    if (s.size === actorNames.length) {
      $randomMode.disabled = true;
      $increaseButton.disable();
      $decreaseButton.disable();
      $setButton.disable();

      [...document.getElementsByClassName('actor_name')].forEach(actor_name => actor_name.readOnly = true);
      Actor.resetNum();

      for (let i = 0; i < actorNames.length; i++) actors.push(await Actor.init(actorNames[i])); //アクターを生成して配列にプッシュ

      actors.forEach((actor, index) => setStatus(actor, index));

      sorted_actors = actors.slice();
      sorted_actors.sort((a, b) => b.agi - a.agi); //素早さ順に並び替え

      $battleButton.enable();
      $resetButton.enable();
    }
  }
}

const battle = async () => {
  if ($battleButton.flag_1 && $battleButton.flag_2) {
    let remain_actors = actors.slice();
    let elapsed_turn = 0;
    $battleButton.disable();
    $resetButton.disable();
    $battleHistory.style.visibility = 'visible';

    while (remain_actors.length > 1 && elapsed_turn <= 50) {
      for (let i = 0; i < sorted_actors.length; i++) {
        let arr = [];

        switch (sorted_actors[i].cond) {
          case 'down':
            break;
          case 'sleep':
            await sorted_actors[i].condCheck(sorted_actors[i].cond);
            break;
          case 'confuse':
            await sorted_actors[i].condCheck(sorted_actors[i].cond);

            if (sorted_actors[i].cond === 'fine') {
              arr = sorted_actors.filter(sorted_actor => sorted_actor !== sorted_actors[i] && sorted_actor.cond !== 'down'); //攻撃対象の配列を作成
            } else {
              arr = sorted_actors.filter(sorted_actor => sorted_actor === sorted_actors[i]);
            }
            break;
          case 'poison':
            await sorted_actors[i].condCheck(sorted_actors[i].cond);
            if (sorted_actors[i].cond === 'down') break;
          default:
            arr = sorted_actors.filter(sorted_actor => sorted_actor !== sorted_actors[i] && sorted_actor.cond !== 'down'); //攻撃対象の配列を作成
        }

        if (arr.length > 0) {
          $actorContainers[sorted_actors[i].num].classList.add('-active');
          const atk = await sorted_actors[i].action();

          if (atk) {
            const targeted = arr[Math.floor(Math.random() * arr.length)];
            await targeted.defend(atk);
          }
          $actorContainers[sorted_actors[i].num].classList.remove('-active');
          await output('', false, 0);
        }
      }
      elapsed_turn += 1;
      remain_actors = sorted_actors.filter(sorted_actor => sorted_actor.cond !== 'down');
    }

    remain_actors = sorted_actors.filter((sorted_actor) => sorted_actor.cond !== 'down');

    if (remain_actors.length === 1) {
      $actorContainers[remain_actors[0].num].classList.add('-active');
      await output(`\n${remain_actors[0].name} の しょうり！`, 'finish');
    } else {
      await output(`ひきわけ`);
    }

    $resetButton.enable();
  }
}

const reset = () => {
  if ($resetButton.flag_1 && $resetButton.flag_2) {
    $battleHistory.textContent = '';
    $battleHistory.style.visibility = 'hidden';
    $battleButton.disable();
    $resetButton.disable();
    [...$actorContainers].forEach(actor_container => actor_container.classList.remove('-active', '-down'));
    [...document.getElementsByClassName('actor_name')].forEach(actor_name => actor_name.readOnly = false);
    for (let i = 0; i < actors.length; i++) clearStatus(i);
    actors = [];

    $randomMode.disabled = false;
    $increaseButton.enable();
    $decreaseButton.enable();
    $setButton.enable();
  }
}



$randomMode.addEventListener('change', () => {
  [...document.getElementsByClassName('actor_name')].forEach((actor_name, index) => {
    if ($randomMode.checked) {
      const cs = Array(Math.floor(Math.random() * 10) + 1);
      const span = 0x3093 - 0x3041 + 1;

      for (let j = 0; j < cs.length; j++) cs[j] = 0x3041 + Math.floor(Math.random() * span);
      actor_name.value = String.fromCharCode.apply(String, cs);
    } else {
      actor_name.value = index;
    }
  });
});

$omitMode.addEventListener('change', () => {
  if ($omitMode.checked) {
    document.querySelectorAll('.status_item:nth-of-type(n+3):nth-of-type(-n+11)').forEach(status_item => status_item.style.display = 'none');
  } else {
    document.querySelectorAll('.status_item:nth-of-type(n+3):nth-of-type(-n+11)').forEach(status_item => status_item.style.display = 'flex');
  }
});

$increaseButton.elem.addEventListener('click', increaseActor);
$decreaseButton.elem.addEventListener('click', decreaseActor);
$setButton.elem.addEventListener('click', set);
$battleButton.elem.addEventListener('click', battle);
$resetButton.elem.addEventListener('click', reset);

window.addEventListener('keydown', async (e) => {
  switch (e.key) {
    case ';':
      increaseActor();
      break;
    case '-':
      decreaseActor();
      break;
    case 's':
      await set();
      break;
    case 'b':
      await battle();
      break;
    case 'r':
      reset();
      break;
    default:
  }
});