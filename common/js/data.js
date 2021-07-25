const statuses = ['hp', 'mp', 'str', 'def', 'int', 'res', 'agi', 'elem'];
const elems = ['炎', '水', '地', '風', '光', '闇'];
const elemRelations = [
  [2, 1, 2, 4, 2, 2],
  [4, 2, 1, 2, 2, 2],
  [2, 4, 2, 1, 2, 2],
  [1, 2, 4, 2, 2, 2],
  [2, 2, 2, 2, 2, 4],
  [2, 2, 2, 2, 4, 2]
];
const actionPatterns = ['physical', 'magic', 'meditation'];
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

export default { statuses, elems, elemRelations, actionPatterns, magic, job };