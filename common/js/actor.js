import { hash } from './hash.js';
import { output } from './output.js';

export const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi', 'elem'];
const elems = ['炎', '水', '地', '風', '光', '闇'];
const elems_relations = [
  [2, 1, 2, 4, 2, 2],
  [4, 2, 1, 2, 2, 2],
  [2, 4, 2, 1, 2, 2],
  [1, 2, 4, 2, 2, 2],
  [2, 2, 2, 2, 2, 4],
  [2, 2, 2, 2, 4, 2]
];
const action_patterns = ['physical', 'magic', 'meditation'];
const magic = [
  {
    name: 'ファイアー',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 0
  },
  {
    name: 'メガファイアー',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 0
  },
  {
    name: 'ウォーター',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 1
  },
  {
    name: 'メガウォーター',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 1
  },
  {
    name: 'アース',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 2
  },
  {
    name: 'メガアース',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 2
  },
  {
    name: 'ウィンド',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 3
  },
  {
    name: 'メガウィンド',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 3
  },
  {
    name: 'ホーリー',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 4
  },
  {
    name: 'メガホーリー',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 4
  },
  {
    name: 'ダーク',
    cost: 10,
    pow: 1.1,
    type: 'attack',
    elemNum: 5
  },
  {
    name: 'メガダーク',
    cost: 20,
    pow: 1.5,
    type: 'attack',
    elemNum: 5
  },
  {
    name: 'ヒール',
    cost: 10,
    pow: 1.1,
    type: 'recovery'
  },
  {
    name: 'メガヒール',
    cost: 20,
    pow: 1.5,
    type: 'recovery'
  },
  {
    name: 'スリープ',
    cost: 15,
    type: 'effect',
    cond: 'sleep'
  },
  {
    name: 'ポイズン',
    cost: 10,
    type: 'effect',
    cond: 'poison'
  },
  {
    name: 'コンフューズ',
    cost: 20,
    type: 'effect',
    cond: 'confuse'
  }
];
const job = [
  {
    name: '戦士',
    magnifications: [1.1, 0.9, 1.1, 1.1, 0.9, 0.9, 1.0, 1.0],
    tendencies: [1.2, 0.8, 0.7]
  },
  {
    name: '魔術師',
    magnifications: [0.9, 1.1, 0.9, 0.9, 1.1, 1.1, 1.0, 1.0],
    tendencies: [0.8, 1.2, 1.0]
  },
  {
    name: '盗賊',
    magnifications: [1.0, 1.0, 1.1, 0.9, 1.0, 0.9, 1.2, 1.0],
    tendencies: [1.0, 1.0, 0.9]
  },
  {
    name: '狂戦士',
    magnifications: [1.2, 0.8, 1.2, 1.2, 0.8, 0.8, 1.0, 1.0],
    tendencies: [1.3, 0.7, 0.6]
  },
  {
    name: '賢者',
    magnifications: [0.8, 1.2, 0.8, 0.8, 1.2, 1.2, 1.0, 1.0],
    tendencies: [0.7, 1.3, 1.1]
  },
  {
    name: '忍者',
    magnifications: [1.0, 1.0, 1.2, 0.8, 1.0, 0.8, 1.4, 1.0],
    tendencies: [1.0, 1.0, 0.9]
  }
]
let actorCount = 0;

export class Actor {
  static async init(actor_name) {
    const actor = new Actor();
    actor.name = actor_name;
    const name_hash = await hash(actor_name);
    const magicNums = [(parseInt(name_hash.slice((statuses.length + 1) * 4, (statuses.length + 1) * 4 + 3), 16) % 100) % magic.length, (parseInt(name_hash.slice((statuses.length + 2) * 4, (statuses.length + 2) * 4 + 3), 16) % 100) % magic.length];
    const jobNum = (parseInt(name_hash.slice((statuses.length + 3) * 4, (statuses.length + 3) * 4 + 3), 16) % 100) % job.length;

    actor.job = job[jobNum];
    statuses.forEach((status, index) => actor[status] = Math.ceil((parseInt(name_hash.slice(index * 4, index * 4 + 3), 16) % 100 + 1) * actor.job.magnifications[index]));
    actor.maxHp = actor.hp;
    actor.elemNum = actor.elem % elems.length
    actor.elem = elems[actor.elemNum];
    actor.cond = 'fine';
    actor.down = false;
    actor.magic = [];
    magicNums.forEach(magicNum => actor.magic.push(magic[magicNum]));
    actor.magic = [...new Set(actor.magic)]; //重複する魔法を削除
    actor.condAccum = 0;
    actor.num = actorCount++;
    return actor;
  }

  static resetNum() {
    actorCount = 0;
  }

  async action() {
    let max_rand = 0;
    let selected_action = '';
    const rand_pow = (Math.round(Math.random() * 20) + 90) / 100;

    action_patterns.forEach((action_pattern, index) => {
      const rand = Math.ceil(Math.random() * 100) * this.job.tendencies[index];
      if (max_rand < rand) {
        max_rand = rand;
        selected_action = action_pattern;
      }
    });

    switch(selected_action) {
      case 'physical':
        const rand_hit = Math.ceil(Math.random() * 100);
        await output(`${this.name} の こうげき！`, selected_action);

        if (rand_hit <= 10) {
          await output('外れてしまった！', 'miss');
          return false;
        } else if (rand_hit > 90) {
          await output('かいしん の いちげき！', 'critical');
          return {
            type: 'physical',
            pow: Math.round(this.str * rand_pow * 1.5),
            hit: this.agi,
            elemNum: this.elemNum
          };
        } else {
          return {
            type: 'physical',
            pow: Math.round(this.str * rand_pow),
            hit: this.agi,
            elemNum: this.elemNum
          };
        }
      case 'magic':
        const selected_magic = this.magic[Math.floor(Math.random() * this.magic.length)];

        if (this.mp < selected_magic.cost) {
        await output(`${this.name} は ${selected_magic.name} の えいしょう に しっぱいした！`, 'fail');
        return false;
        } else {
          await output(`${this.name} は ${selected_magic.name} を となえた！`, selected_magic.name);
          this.mp -= selected_magic.cost;
          document.getElementById(`actor${this.num}_mp`).textContent = this.mp;

          switch (selected_magic.type) {
            case 'attack':
              return {
                type: 'magic_attack',
                pow: Math.round(this.int * selected_magic.pow * rand_pow),
                elemNum: selected_magic.elemNum
              }
            case 'recovery':
              const amount = Math.round(this.int * selected_magic.pow * rand_pow);
              await output(`${this.name} は ${amount} かいふくした！`);
              this.hp += amount;
              if (this.hp > this.maxHp) this.hp = this.maxHp;
              document.getElementById(`actor${this.num}_hp`).textContent = this.hp;
              return false;
            case 'effect':
              return {
                type: 'magic_effect',
                int: this.int,
                cond: selected_magic.cond,
                elemNum: this.elemNum
              }
            default:
          }
        }
      case 'meditation':
        await output(`${this.name} は しゅうちゅうりょく を たかめている！`, 'meditation');
        const amount = Math.ceil(this.int * rand_pow / 5);
        this.mp += amount;
        await output(`${this.name} の MP が ${amount} ぞうかした！`);
        document.getElementById(`actor${this.num}_mp`).textContent = this.mp;
        return false;
      default:
    }
  }

  async defend(atk) {
    const rand_def = (Math.round(Math.random() * 20) + 90) / 100;
    const multiplier = elems_relations[atk.elemNum][this.elemNum];
    let damage;

    switch (atk.type) {
      case 'physical':
        let avoidance = this.agi - atk.hit;
        const rand_hit = Math.round(Math.random() * 100);

        if (avoidance < 5) avoidance = 5;
        if (rand_hit > avoidance) {
          switch (multiplier) {
            case 1:
              damage = Math.ceil(atk.pow / 2 - this.def * rand_def);
              await output('こうか は いまひとつだ！', 'half');
              break;
            case 2:
              damage = Math.ceil(atk.pow - this.def * rand_def);
              break;
            case 4:
              damage = Math.ceil(atk.pow * 2 - this.def * rand_def);
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
            damage = Math.ceil(atk.pow / 2 - this.res * rand_def);
            await output('こうか は いまひとつだ！', 'half');
            break;
          case 2:
            damage = Math.ceil(atk.pow - this.res * rand_def);
            break;
          case 4:
            damage = Math.ceil(atk.pow * 2 - this.res * rand_def);;
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
        const rand_res = Math.round(Math.random() * 100);

        if (rand_res > resistance) {
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
    const rand_recov = Math.round(Math.random() * 100);

    switch (cond) {
      case 'sleep':
        if (rand_recov < this.condAccum) {
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
        if (rand_recov < this.condAccum) {
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
        if (rand_recov < this.condAccum) {
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