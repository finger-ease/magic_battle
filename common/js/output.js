const battleSpeed = 500;
const $battleHistory = document.getElementById('battleHistory');

const timeOut = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const output = async (text, audio = false, ms = battleSpeed) => {
  if (audio) new Audio(`https://finger-ease.github.io/magic_battle/common/audio/${audio}.mp3`).play();
  $battleHistory.textContent += `${text}\n`;
  $battleHistory.scrollTop = $battleHistory.scrollHeight;
  await timeOut(ms);
}