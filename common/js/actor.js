import { hash } from './hash.js';
import { output } from './output.js';
import data from './data.js';

let actor_count = 0;

export class Actor {
  static async init(actor_name) {
    const actor = new Actor();
    actor.name = actor_name;
    const nameHash = await hash(actor_name);
    const magicNums = [(parseInt(nameHash.slice((data.statuses.length + 1) * 4, (data.statuses.length + 1) * 4 + 3), 16) % 100) % data.magic.length, (parseInt(nameHash.slice((data.statuses.length + 2) * 4, (data.statuses.length + 2) * 4 + 3), 16) % 100) % data.magic.length];
    const jobNum = (parseInt(nameHash.slice((data.statuses.length + 3) * 4, (data.statuses.length + 3) * 4 + 3), 16) % 100) % data.job.length;

    actor.job = data.job[jobNum];
    data.statuses.forEach((status, index) => actor[status] = Math.ceil((parseInt(nameHash.slice(index * 4, index * 4 + 3), 16) % 100 + 1) * actor.job.magnifications[index]));
    actor.maxHp = actor.hp;
    actor.elemNum = actor.elem % data.elems.length
    actor.elem = data.elems[actor.elemNum];
    actor.cond = 'fine';
    actor.down = false;
    actor.magic = [];
    magicNums.forEach(magicNum => actor.magic.push(data.magic[magicNum]));
    actor.magic = [...new Set(actor.magic)]; //重複する魔法を削除
    actor.condAccum = 0;
    actor.num = actor_count++;
    return actor;
  }

  static resetNum() {
    actor_count = 0;
  }

  async action() {
    let max_rand = 0;
    let selected_action = '';
    const randPow = (Math.round(Math.random() * 20) + 90) / 100;

    data.actionPatterns.forEach((actionPattern, index) => {
      const rand = Math.ceil(Math.random() * 100) * this.job.tendencies[index];
      if (max_rand < rand) {
        max_rand = rand;
        selected_action = actionPattern;
      }
    });

    switch(selected_action) {
      case 'physical':
        const randHit = Math.ceil(Math.random() * 100);
        await output(`${this.name} の こうげき！`, selected_action);

        if (randHit <= 10) {
          await output('外れてしまった！', 'miss');
          return false;
        } else if (randHit > 90) {
          await output('かいしん の いちげき！', 'critical');
          return {
            type: 'physical',
            pow: Math.round(this.str * randPow * 1.5),
            hit: this.agi,
            elemNum: this.elemNum
          };
        } else {
          return {
            type: 'physical',
            pow: Math.round(this.str * randPow),
            hit: this.agi,
            elemNum: this.elemNum
          };
        }
      case 'magic':
        const selectedMagic = this.magic[Math.floor(Math.random() * this.magic.length)];

        if (this.mp < selectedMagic.cost) {
        await output(`${this.name} は ${selectedMagic.name} の えいしょう に しっぱいした！`, 'fail');
        return false;
        } else {
          await output(`${this.name} は ${selectedMagic.name} を となえた！`, selectedMagic.name);
          this.mp -= selectedMagic.cost;
          document.getElementById(`actor${this.num}_mp`).textContent = this.mp;

          switch (selectedMagic.type) {
            case 'attack':
              return {
                type: 'magic_attack',
                pow: Math.round(this.int * selectedMagic.pow * randPow),
                elemNum: selectedMagic.elemNum
              }
            case 'recovery':
              const amount = Math.round(this.int * selectedMagic.pow * randPow);
              await output(`${this.name} は ${amount} かいふくした！`);
              this.hp += amount;
              if (this.hp > this.maxHp) this.hp = this.maxHp;
              document.getElementById(`actor${this.num}_hp`).textContent = this.hp;
              return false;
            case 'effect':
              return {
                type: 'magic_effect',
                int: this.int,
                cond: selectedMagic.cond,
                elemNum: this.elemNum
              }
            default:
          }
        }
      case 'meditation':
        await output(`${this.name} は しゅうちゅうりょく を たかめている！`, 'meditation');
        const amount = Math.ceil(this.int * randPow / 5);
        this.mp += amount;
        await output(`${this.name} の MP が ${amount} ぞうかした！`);
        document.getElementById(`actor${this.num}_mp`).textContent = this.mp;
        return false;
      default:
    }
  }

  async defend(atk) {
    const randDef = (Math.round(Math.random() * 20) + 90) / 100;
    const multiplier = data.elemRelations[atk.elemNum][this.elemNum];
    let damage;

    switch (atk.type) {
      case 'physical':
        let avoidance = this.agi - atk.hit;
        const randHit = Math.round(Math.random() * 100);

        if (avoidance < 5) avoidance = 5;
        if (randHit > avoidance) {
          switch (multiplier) {
            case 1:
              damage = Math.ceil(atk.pow / 2 - this.def * randDef);
              await output('こうか は いまひとつだ！', 'half');
              break;
            case 2:
              damage = Math.ceil(atk.pow - this.def * randDef);
              break;
            case 4:
              damage = Math.ceil(atk.pow * 2 - this.def * randDef);
              await output('こうか は ばつぐんだ！', 'double');
              break;
            default:
          }

          if (damage <= 0) damage = 1;
          document.getElementsByClassName('actor_container')[this.num].classList.add('-damaged');
          await output(`${this.name} は ${damage} の ダメージをうけた！`);
          document.getElementsByClassName('actor_container')[this.num].classList.remove('-damaged');
          this.hp -= damage;
        } else {
          await output(`${this.name} は こうげき を かわした！`, 'avoid');
        }

        break;
      case 'magic_attack':
        switch (multiplier) {
          case 1:
            damage = Math.ceil(atk.pow / 2 - this.res * randDef);
            await output('こうか は いまひとつだ！', 'half');
            break;
          case 2:
            damage = Math.ceil(atk.pow - this.res * randDef);
            break;
          case 4:
            damage = Math.ceil(atk.pow * 2 - this.res * randDef);;
            await output('こうか は ばつぐんだ！', 'double');
            break;
          default:
        }

        if (damage <= 0) damage = 0;
        document.getElementsByClassName('actor_container')[this.num].classList.add('-damaged');
        await output(`${this.name} は ${damage} の ダメージをうけた！`);
        document.getElementsByClassName('actor_container')[this.num].classList.remove('-damaged');
        this.hp -= damage;
        break;
      case 'magic_effect':
        if (this.cond !== 'fine') {
          await output(`${this.name} は すでに じょうたいいじょう だ！`);
          break;
        }

        let resistance = this.res - atk.int;
        const randRes = Math.round(Math.random() * 100);

        if (randRes > resistance) {
          this.cond = atk.cond;

          switch (atk.cond) {
            case 'sleep':
              await output(`${this.name} は ねむってしまった！`);
              document.getElementById(`actor${this.num}_cond`).textContent = '睡眠';
              break;
            case 'poison':
              await output(`${this.name} は どくに おかされた！`);
              document.getElementById(`actor${this.num}_cond`).textContent = '毒';
              break;
            case 'confuse':
              await output(`${this.name} は こんらんした！`);
              document.getElementById(`actor${this.num}_cond`).textContent = '混乱';
              break;
            default:
          }
        } else {
          await output(`${this.name} には きかなかった！`);
        }
        break;
      default:
    }

    await this.downCheck(this.hp);
  }

  async condCheck(cond) {
    const randRecov = Math.round(Math.random() * 100);

    switch (cond) {
      case 'sleep':
        if (randRecov < this.condAccum) {
          await output(`${this.name} は めを さました！`);
          document.getElementById(`actor${this.num}_cond`).textContent = '健康';
          this.cond = 'fine';
          this.condAccum = 0;
        } else {
          await output(`${this.name} は ねむっている！`, 'sleeping');
          this.condAccum += 15;
        }
        break;
      case 'poison':
        if (randRecov < this.condAccum) {
          await output(`${this.name} の どくが なおった！`);
          document.getElementById(`actor${this.num}_cond`).textContent = '健康';
          this.cond = 'fine';
          this.condAccum = 0;
        } else {
          const damage = Math.round(Math.random () * 15) + 5;
          await output(`${this.name} は どくで ${damage} の ダメージをうけた！`, 'poisoning');
          this.hp -= damage;
          await this.downCheck(this.hp);
          this.condAccum += 10;
        }
        break;
      case 'confuse':
        if (randRecov < this.condAccum) {
          await output(`${this.name} は しょうきを とりもどした！`);
          document.getElementById(`actor${this.num}_cond`).textContent = '健康';
          this.cond = 'fine';
          this.condAccum = 0;
        } else {
          await output(`${this.name} は こんらんしている！`, 'confusing');
          this.condAccum += 20;
        }
        break;
      default:
    }
    await output('', false, 0);
  }

  async downCheck(hp) {
    if (hp <= 0) {
      hp = 0;
      this.cond = 'down';
      await output(`\n${this.name} は ちからつきた！`, 'down');
      document.getElementById(`actor${this.num}_cond`).textContent = '戦闘不能';
      document.getElementsByClassName('actor_container')[this.num].classList.add('-down');
    }

    document.getElementById(`actor${this.num}_hp`).textContent = hp;
  }
}