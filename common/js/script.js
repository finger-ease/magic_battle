const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi', 'type'];
const elements = ['火', '水', '木', '光', '闇'];
const elements_relation = [
  [2, 1, 4, 2, 2],
  [4, 2, 1, 2, 2],
  [1, 4, 2, 2, 2],
  [2, 2, 2, 2, 4],
  [2, 2, 2, 4, 2]
];
const actor_num = 2;
const battleSpeed = 500;
let actors = [];
const $battleHistory = document.getElementById('battleHistory');

const sha256 = async (text) => {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
}

const hash = async (actor_name) => await sha256(actor_name);

const timeOut = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const output = async (text, audio = false, ms = battleSpeed) => {
  if (audio) new Audio(`/common/audio/${audio}.mp3`).play();
  $battleHistory.textContent += `${text}\n`;
  $battleHistory.scrollTop = $battleHistory.scrollHeight;
  await timeOut(ms);
}

class Actor {
  static async init(actor_name) {
    const actor = new Actor();
    actor.name = actor_name;
    const name_hash = await hash(actor_name);

    statuses.forEach((status, index) => actor[status] = parseInt(name_hash.slice(index * 8, index * 8 + 7), 16) % 100 + 1);
    actor.typeNum = actor.type % elements.length
    actor.type = elements[actor.typeNum];
    return actor;
  }

  async attack() {
    const rand_hit = Math.ceil(Math.random() * 100);
    const rand_pow = (Math.round(Math.random() * 20) + 90) / 100;
    await output(`${this.name} の こうげき！`, 'action');

    if (rand_hit <= 10) {
      await output('外れてしまった！', 'miss');
      return false;
    } else if (rand_hit > 90) {
      await output('かいしん の いちげき！', 'critical');
      return [Math.round(this.str * rand_pow * 1.5), this.agi, this.typeNum];
    } else {
      return [Math.round(this.str * rand_pow), this.agi, this.typeNum];
    }
  }

  async defend(atk, index) {
    let damage = atk[0] - this.def;
    let avoidance = this.agi - atk[1];
    const rand_hit = Math.round(Math.random() * 100);
    const multiplier = elements_relation[atk[2]][this.typeNum];

    if (damage <= 0) damage = 1;
    if (avoidance < 5) avoidance = 5;
    if (rand_hit > avoidance) {
      switch (multiplier) {
        case 1:
          damage = Math.ceil(damage / 2);
          await output('こうか は いまひとつだ！', 'half');
          break;
        case 2:
          break;
        case 4:
          damage *= 2;
          await output('こうか は ばつぐんだ！', 'double');
      }

      await output(`${this.name} は ${damage} の ダメージをうけた！`, 'damage');
      this.hp -= damage;

      if (this.hp < 0) {
        this.hp = 0;
        await output(`\n${this.name} は ちからつきた！`, 'down');
      }

      document.getElementById(`actor${index}_hp`).textContent = this.hp;
    } else {
      await output(`${this.name} は こうげき を かわした！`, 'avoid');
    }
  }
}

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
        const atk = await sorted_actors[i].attack();
        if (atk) {
          const arr = sorted_actors.filter(n => n !== sorted_actors[i]);
          const targeted = arr[Math.floor(Math.random() * arr.length)];
          let targeted_index;

          actors.forEach((actor, index) => { if (actor.name === targeted.name) targeted_index = index });
          await targeted.defend(atk, targeted_index);

          if (targeted.hp === 0) {
            sorted_actors = sorted_actors.filter(n => n !== targeted);
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

    $battleHistory.textContent = '';
    $startButton.style.display = 'none';
    $resetButton.style.display = 'none';
    $setButton.style.display = 'block';
  });
}