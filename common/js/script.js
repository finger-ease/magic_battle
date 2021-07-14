const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi'];
const actor_num = 4;
const actors = [];

const sha256 = async (text) => {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
}

const hash = async (actor_name) => await sha256(actor_name);

const addHistory = text => document.getElementById('battleHistory').textContent += `${text}\n`;

class Actor {
  static async init(actor_name) {
    const actor = new Actor();
    actor.name = actor_name;
    const name_hash = await hash(actor_name);

    statuses.forEach((status, index) => actor[status] = parseInt(name_hash.slice(index * 8, index * 8 + 7), 16) % 100 + 1);
    return actor;
  }

  attack() {
    const rand_hit = Math.ceil(Math.random() * 100);
    const rand_pow = (Math.round(Math.random() * 20) + 90) / 100;
    addHistory(`${this.name} の こうげき！`);

    if (rand_hit <= 10) {
      addHistory('外れてしまった！');
      return false;
    } else if (rand_hit > 90) {
      addHistory('かいしん の いちげき！');
      return [Math.round(this.str * rand_pow * 1.5), this.agi];
    } else {
      return [Math.round(this.str * rand_pow), this.agi];
    }
  }

  defend(atk, index) {
    let damage = atk[0] - this.def;
    let avoidance = this.agi - atk[1];
    const rand_hit = Math.round(Math.random() * 100);

    if (damage <= 0) damage = 1;
    if (avoidance < 0) avoidance = 0;
    if (rand_hit > avoidance) {
      addHistory(`${this.name} は ${damage} の ダメージをうけた！`);
      this.hp -= damage;

      if (this.hp < 0) {
        this.hp = 0;
        addHistory(`\n${this.name} は ちからつきた！`);
      }

      document.getElementById(`actor${index}_hp`).textContent = this.hp;
    } else {
      addHistory(`${this.name} は こうげき を かわした！`)
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

const set_status = async (actor, index) => {
  statuses.forEach(status => document.getElementById(`actor${index}_${status}`).textContent = actor[status]);
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

    actors.forEach(async (actor, index) => {
      await set_status(actor, index);
    });

    sorted_actors = actors.slice();
    sorted_actors.sort((a, b) => b.agi - a.agi); //素早さ順に並び替え

    $setButton.style.display = 'none';
    $startButton.style.display = 'block';
    $resetButton.style.display = 'block';
  });

  $startButton.addEventListener('click', () => {
    while (sorted_actors.length > 1) {
      for (let i = 0; i < sorted_actors.length; i++) {
        const atk = sorted_actors[i].attack();
        if (atk) {
          const arr = sorted_actors.filter(n => n !== sorted_actors[i]);
          const targeted = arr[Math.floor(Math.random() * arr.length)];
          let targeted_index;

          actors.forEach((actor, index) => { if (actor.name === targeted.name) targeted_index = index });
          targeted.defend(atk, targeted_index);

          if (targeted.hp === 0) {
            sorted_actors = sorted_actors.filter(n => n !== targeted);
            if (sorted_actors.length === 1) break;
          }
        }
        addHistory('');

      }
    }

    addHistory(`\n${sorted_actors[0].name} の しょうり！`);
  });
}