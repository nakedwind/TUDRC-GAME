/* ===== 走進某張地圖時先播一段劇情（只播一次）=====
   STORY_TRIGGERS：from＝從哪張地圖走出入口、to＝要去哪張地圖、scene＝先播 data/story-scenes.js 的哪段劇情。
   劇情裡的選項會給一個結果（outcome），這裡依結果決定接下來怎麼走：
     team＝換成這幾位隊員出勤（js/team.js 的 setTeam）
     go＝'map' 照原本要去的地圖走過去、站到 at [欄, 列]；'base' 回應變中心（js/missions.js 的 returnToBase）
   沒選就按「跳過劇情」：用 skip 那個結果。
   看過哪些記在瀏覽器（STORY_TRIGGER_KEY），開新遊戲會清掉（js/new-game.js）。
   必須在 js/game.js（enterPortal）、js/missions.js、js/team.js 之後載入。
*/
const STORY_TRIGGER_KEY = 'tudrc_story_triggers_v1';
const STORY_TRIGGERS = [
  {
    id: 'y25_rescue',
    from: NEWBIE_START.mapId,     // 新手區（Y25區入口）
    to: 'map_mvtnqrs7',           // Y25區地下街
    scene: 'y25_rescue',
    skip: 'stay',
    outcomes: {
      stay: { team: ['colyn', 'theonie', 'chris', 'luther'], go: 'map', at: [31, 78] },   // 留下來繼續探索：柯林、希奧妮、克莉思、路德跟著溫特
      retreat: { go: 'base' },                                                           // 一起撤退回應變中心
    },
  },
];
const storyTriggerSeen = (() => { try { return JSON.parse(localStorage.getItem(STORY_TRIGGER_KEY) || '[]'); } catch (_) { return []; } })();
function markStoryTrigger(id) {
  if (!storyTriggerSeen.includes(id)) storyTriggerSeen.push(id);
  try { localStorage.setItem(STORY_TRIGGER_KEY, JSON.stringify(storyTriggerSeen)); } catch (_) {}
}
function storyTriggerFor(pt) {
  if (window.TEST_MODE || typeof MAP === 'undefined' || !MAP || !pt) return null;
  return STORY_TRIGGERS.find(t => t.from === MAP.id && t.to === pt.to && !storyTriggerSeen.includes(t.id)
    && typeof STORY_SCENES !== 'undefined' && STORY_SCENES[t.scene]) || null;
}
function runStoryOutcome(trigger, outcome) {
  const o = trigger.outcomes[outcome] || trigger.outcomes[trigger.skip];
  if (!o) return;
  if (o.team && typeof setTeam === 'function') setTeam(o.team);
  if (o.go === 'base' && typeof returnToBase === 'function') { returnToBase(); return; }
  missionTravel(trigger.to, () => {
    if (!o.at) return;
    const x = (o.at[0] + .5) * CELL, y = (o.at[1] + .5) * CELL;
    if (!playerBlocked(x, y)) { G.player.x = x; G.player.y = y; }
  });
}
// 走出入口時先檢查：有沒播過的劇情就先播，播完再依結果走
const enterPortalBeforeStory = enterPortal;
enterPortal = function (pt) {
  const trigger = !mapTransitioning && storyTriggerFor(pt);
  if (!trigger) { enterPortalBeforeStory(pt); return; }
  markStoryTrigger(trigger.id);   // 開始播就記成看過：中途關掉也不會一直重播
  Object.keys(keys).forEach(key => { keys[key] = false; });
  if (typeof AssetGate !== 'undefined' && AssetGate.arm) AssetGate.arm();   // 劇情地圖的圖下載好之前先蓋「載入中」
  if (!StoryScene.playFromGame(trigger.scene, outcome => setTimeout(() => runStoryOutcome(trigger, outcome), 0))) enterPortalBeforeStory(pt);
};
