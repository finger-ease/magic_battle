const sha256 = async (text) => {
  const uint8 = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
}

const calc_hp = async (character_name) => await sha256(character_name);

class Character {
  constructor(character_name) {
    this.character_name = character_name;
    this.mp = this.calc_mp();
    this.str = this.calc_str();
  }

  static async init(character_name) {
    const character = new Character();
    character.hp = await calc_hp(character_name);
    return character;
  }

  calc_mp() {
    return 1;
  }

  calc_str() {
    return 1;
  }
}

window.onload = function () {
  document.getElementById('startButton').addEventListener('click', async () => {
    const characterA_name = document.getElementById('characterA').value;
    const characterB_name = document.getElementById('characterB').value;

    if (characterA_name && characterB_name) {
      const characterA = await Character.init(characterA_name);
      console.log(characterA.hp);
    } else {
      console.log('error');
    }
  });
}