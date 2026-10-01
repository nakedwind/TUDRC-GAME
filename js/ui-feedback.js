/* 共用按鈕回饋。現有程式的 button/menu/switch 音效在同一次點擊中合併成一次。 */
const UIFeedback = (() => {
  const controls = 'button, input[type="button"], input[type="submit"], select, summary, input[type="checkbox"], input[type="radio"], input[type="color"], [role="button"], [role="tab"], [role="switch"], .tile, .sw, a.backlink, a.back, #editors a';
  const switches = 'select, summary, input[type="checkbox"], input[type="radio"], input[type="color"], [role="tab"], [role="switch"], [aria-pressed], [aria-selected], .team-pick, .buildcat, .build-quick-slot, .tool, .layer, .tile, .sw, .orient button, [data-o], #monsterList button, #list button, .elevator-floors button, #buildToggle, #demolishToggle, #npcArrangeToggle, #gridToggle, #solidToggle, #flipX, #flipY, #sentryMenu [data-act], #fieldCommandMenu button';
  const genericSounds = new Set(['button', 'menu', 'switch']);
  const clickTimers = new WeakMap();
  let active = null;
  let pressedControl = null;

  function findControl(target) {
    const el = target instanceof Element ? target.closest(controls) : null;
    return el && !el.matches(':disabled') && !el.closest('[inert]') ? el : null;
  }
  function soundFor(el) {
    return el.dataset.uiSound || (el.matches(switches) ? 'switch' : 'button');
  }
  function activate(el) {
    const ticket = { sound: soundFor(el) };
    active = ticket;
    // 等目標按鈕自己的 click 處理完成，再播放一次統一的 UI 音效。
    setTimeout(() => {
      if (active === ticket) active = null;
      if (typeof SFX !== 'undefined') SFX.play(ticket.sound);
    }, 0);
  }
  function clickFlash(el) {
    clearTimeout(clickTimers.get(el));
    el.classList.remove('ui-pressing');
    el.classList.add('ui-clicked');
    clickTimers.set(el, setTimeout(() => el.classList.remove('ui-clicked'), 140));
  }
  document.addEventListener('pointerdown', e => {
    const el = findControl(e.target);
    if (pressedControl) pressedControl.classList.remove('ui-pressing');
    pressedControl = el && !el.matches('select') ? el : null;
    if (pressedControl) pressedControl.classList.add('ui-pressing');
  }, true);
  for (const type of ['pointerup', 'pointercancel']) {
    document.addEventListener(type, () => {
      if (pressedControl) pressedControl.classList.remove('ui-pressing');
      pressedControl = null;
    }, true);
  }
  window.addEventListener('blur', () => {
    if (pressedControl) pressedControl.classList.remove('ui-pressing');
    pressedControl = null;
  });
  document.addEventListener('click', e => {
    const el = findControl(e.target);
    if (!el || el.matches('select')) return;
    clickFlash(el);
    activate(el);
  }, true);
  document.addEventListener('change', e => {
    const el = findControl(e.target);
    if (el && el.matches('select, input[type="color"]')) activate(el);
  }, true);
  return {
    intercept(name) { return !!active && genericSounds.has(name); },
  };
})();
