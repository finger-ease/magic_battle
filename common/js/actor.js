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
    const magicNum = (parseInt(name_hash.slice((statuses.length + 1) * 4, (statuses.length + 1) * 4 + 3), 16) % 100) % magic.length;
    const jobNum = (parseInt(name_hash.slice((statuses.length + 2) * 4, (statuses.length + 2) * 4 + 3), 16) % 100) % job.length;

    actor.job = job[jobNum];
    statuses.forEach((status, index) => actor[status] = Math.ceil((parseInt(name_hash.slice(index * 4, index * 4 + 3), 16) % 100 + 1) * actor.job.magnifications[index]));
    actor.elemNum = actor.elem % elems.length
    actor.elem = elems[actor.elemNum];
    actor.down = false;
    actor.magic = magic[magicNum];
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
        if (this.mp < this.magic.cost) {
        await output(`${this.name} は ${this.magic.name} の えいしょう に しっぱいした！`, 'fail');
        return false;
        } else {
          await output(`${this.name} は ${this.magic.name} を となえた！`, this.magic.name);
          this.mp -= this.magic.cost;
          document.getElementById(`actor${this.num}_mp`).textContent = this.mp;

          switch (this.magic.type) {
            case 'attack':
              return {
                type: 'magic',
                pow: Math.round(this.int * this.magic.pow * rand_pow),
                elemNum: this.magic.elemNum
              }
            case 'recovery':
              const amount = Math.round(this.int * this.magic.pow * rand_pow);
              await output(`${this.name} は ${amount} かいふくした！`);
              this.hp += amount;
              document.getElementById(`actor${this.num}_hp`).textContent = this.hp;
              return false;
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

  async defend(atk, index) {
    const rand_def = (Math.round(Math.random() * 20) + 90) / 100;
    const multiplier = elems_relations[atk.elemNum][this.elemNum];

    switch (atk.type) {
      case 'physical':
        let damage = Math.ceil(atk.pow - this.def * rand_def);
        let avoidance = this.agi - atk.hit;
        const rand_hit = Math.round(Math.random() * 100);

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
              break;
            default:
          }

          await output(`${this.name} は ${damage} の ダメージをうけた！`);
          this.hp -= damage;
        } else {
          await output(`${this.name} は こうげき を かわした！`, 'avoid');
        }

        break;
      case 'magic':
        let damage_2 = Math.ceil(atk.pow - this.res * rand_def);
        if (damage_2 <= 0) damage_2 = 0;
        switch (multiplier) {
          case 1:
            damage_2 = Math.ceil(damage_2 / 2);
            await output('こうか は いまひとつだ！', 'half');
            break;
          case 2:
            break;
          case 4:
            damage_2 *= 2;
            await output('こうか は ばつぐんだ！', 'double');
            break;
          default:
        }

        await output(`${this.name} は ${damage_2} の ダメージをうけた！`, 'damage');
        this.hp -= damage_2;
        break;
    }

    if (this.hp < 0) {
      this.hp = 0;
      await output(`\n${this.name} は ちからつきた！`, 'down');
    }

    document.getElementById(`actor${index}_hp`).textContent = this.hp;
  }
}