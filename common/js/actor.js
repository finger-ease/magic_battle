import { hash } from './hash.js';
import { output } from './output.js';

export const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi', 'elem'];
const elems = ['火', '水', '雷', '土', '木', '光', '闇'];
const elems_relation = [
  [2, 1, 2, 2, 4, 2, 2],
  [4, 2, 1, 2, 2, 2, 2],
  [2, 4, 2, 1, 2, 2, 2],
  [2, 2, 4, 2, 1, 2, 2],
  [1, 2, 2, 4, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 4],
  [2, 2, 2, 2, 2, 4, 2]
];
const magic = [
  {
    name: 'fire',
    cost: 10,
    pow: 1.1,
    elemNum: 0
  }
]
let actorCount = 0;

export class Actor {
  static async init(actor_name) {
    const actor = new Actor();
    actor.name = actor_name;
    const name_hash = await hash(actor_name);
    const magicNum = (parseInt(name_hash.slice((statuses.length + 1) * 4, (statuses.length + 1) * 4 + 3), 16) % 100) % magic.length;

    statuses.forEach((status, index) => actor[status] = parseInt(name_hash.slice(index * 4, index * 4 + 3), 16) % 100 + 1);
    actor.elemNum = actor.elem % elems.length
    actor.elem = elems[actor.elemNum];
    actor.down = false;
    actor.magic = magic[magicNum];
    actor.num = actorCount++;
    return actor;
  }

  async action() {
    const rand_action = Math.ceil(Math.random() * 100);
    const rand_pow = (Math.round(Math.random() * 20) + 90) / 100;

    if (rand_action > 50) {
      const rand_hit = Math.ceil(Math.random() * 100);
      await output(`${this.name} の こうげき！`, 'physical');

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
    } else {
      if (this.mp < this.magic.cost) {
        await output(`${this.name} は ${this.magic.name} の えいしょう に しっぱいした！`, 'fail');
      } else {
        await output(`${this.name} は ${this.magic.name} を となえた！`, this.magic.name);
        this.mp -= this.magic.cost;
        document.getElementById(`actor${this.num}_mp`).textContent = this.mp;

        return {
          type: 'magic',
          pow: Math.round(this.int * this.magic.pow * rand_pow),
          elemNum: this.magic.elemNum
        }
      }
    }
  }

  async defend(atk, index) {
    const rand_def = (Math.round(Math.random() * 20) + 90) / 100;
    const multiplier = elems_relation[atk.elemNum][this.elemNum];

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

          await output(`${this.name} は ${damage} の ダメージをうけた！`, 'damage');
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