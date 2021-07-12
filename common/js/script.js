const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi'];
const character_num = 2;

const sha256 = async (text) => {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
}

const hash = async (character_name) => await sha256(character_name);

class Character {
  static async init(character_name) {
    const character = new Character();
    const name_hash = await hash(character_name);
    statuses.forEach((status, index) => character[status] = parseInt(name_hash.slice(index * 8, index * 8 + 7), 16) % 100);
    return character;
  }
}

const characterHTML = (num) => {
  let status_list = '';
  statuses.forEach(status => {
    status_list += `
      <li class="status_item">
        <p class="status_title">${status.toUpperCase()}</p>
        <span id="character${num}_${status}"></span>
      </li>
    `
  });
  return `
    <div class="character_container">
      <input type="text" id="character${num}" value="${num}">
      <ul class="status_list">
        ${status_list}
      </ul>
    </div>
  `
}

const set_status = async (num, character) => {
  statuses.forEach(status => document.getElementById(`character${num}_${status}`).textContent = character[status]);
}

window.onload = function () {
  for (let i = 1; i <= character_num; i++) document.getElementById('characterWrapper').innerHTML += characterHTML(i);
  document.getElementById('startButton').addEventListener('click', async () => {
    for (let i = 1; i <= character_num; i++) {
      const character_name = document.getElementById(`character${i}`).value;
      if (!character_name) break;
      const character = await Character.init(character_name);
      await set_status(i, character);
    }
  });
}