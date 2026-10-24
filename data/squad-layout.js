/* ===== T-Pad「Y102隊員」頁的版面（由「🧑‍🚀 Y102隊員裝備／技能編輯器」匯出，整段覆蓋即可）=====
   elements：每個可以調整的區域／圖片／文字 → { x, y：位移（像素）, w, h：寬高（像素）, size：圖片大小（寬，高度照比例）, font：字級, align：文字對齊 }
   texts：改過的介面文字（標題、按鈕…）
   沒寫在這裡的就照原本的樣子。套用的程式在 js/squad-page.js。 */
const SQUAD_LAYOUT = {
  "elements": {
    "box.bars": {
      "y": -10
    },
    "stat:atk": {
      "y": -10
    },
    "stat:rate": {
      "y": -10
    },
    "stat:acc": {
      "y": -10
    },
    "stat:def": {
      "y": -10
    },
    "stat:range": {
      "y": -10
    },
    "stat:move": {
      "y": -10
    },
    "text.status": {
      "y": 2
    },
    "btn.switch": {
      "size": 30
    },
    "text.switchLabel": {
      "x": 10,
      "y": -5,
      "font": 13
    },
    "rosterImg:red": {
      "y": -22
    },
    "rosterImg:avaren": {
      "y": -22
    },
    "rosterImg:theonie": {
      "y": -22
    },
    "rosterImg:amber": {
      "y": -22
    },
    "rosterImg:luther": {
      "y": -22
    },
    "rosterImg:colyn": {
      "y": -22
    },
    "rosterImg:eldrin": {
      "y": -22
    },
    "rosterImg:chris": {
      "y": -22
    },
    "rosterImg:taana": {
      "y": -22
    },
    "rosterImg:tino": {
      "y": -22
    },
    "rosterImg:claire": {
      "y": -22
    },
    "rosterImg:muomn": {
      "y": -22
    },
    "rosterImg:noah": {
      "y": -22
    },
    "rosterImg:ash": {
      "y": -22
    },
    "rosterImg:eden": {
      "y": -22
    },
    "rosterImg:salem": {
      "y": -22
    },
    "rosterImg:ball": {
      "x": 28,
      "y": -43,
      "size": 112
    },
    "rosterImg:rowan": {
      "y": -22
    },
    "rosterImg:cael": {
      "y": -22
    },
    "rosterImg:saku": {
      "y": -22
    },
    "rosterImg:kakuma": {
      "y": -22
    },
    "box.learn": {
      "x": 10,
      "y": 10
    },
    "btn.learn": {
      "x": -10,
      "y": -10,
      "align": "center"
    },
    "btn.learned": {
      "x": 2,
      "y": 2
    },
    "box.learned": {
      "x": -10,
      "y": -10
    },
    "text.costLabel": {
      "x": -17,
      "y": -10
    },
    "img.costIcon": {
      "x": -14,
      "y": -8
    },
    "text.cost": {
      "x": -11,
      "y": -8
    },
    "box.lockIcon": {
      "size": 60
    },
    "img.lockIcon": {
      "size": 40
    },
    "text.lockHint": {
      "y": -16
    },
    "text.noSkill": {
      "y": 95
    },
    "text.skillDesc": {
      "y": 20
    },
    "text.skillEffect": {
      "x": 160,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillNote": {
      "y": -77,
      "font": 12
    },
    "text.skillEffect@colyn/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/a-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@red/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@avaren/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@theonie/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@amber/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@luther/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@eldrin/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@chris/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@taana/trait-1": {
      "x": 120,
      "y": -125,
      "w": 340,
      "h": 20,
      "font": 15
    },
    "text.skillEffect@colyn/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@colyn/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/a-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@red/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@avaren/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/a-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@theonie/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/a-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@amber/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/b-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/a-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/core-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/core-3": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@luther/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@eldrin/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@chris/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@chris/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@chris/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@chris/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@chris/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/trait-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/a-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/b-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/core-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/ult": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/aux-1": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "text.skillEffect@taana/aux-2": {
      "y": -60,
      "w": 340,
      "h": 20,
      "font": 15,
      "x": 0
    },
    "lookSlot:face": {
      "y": -12
    },
    "lookSlotName:face": {
      "y": -12
    },
    "lookSlot:hand": {
      "y": -15
    },
    "lookSlotName:hand": {
      "y": -15
    },
    "lookSlot:back": {
      "y": -12
    },
    "lookSlotName:back": {
      "y": -12
    },
    "text.gearTitle": {
      "x": 10
    },
    "text.lookTitle": {
      "x": 15,
      "y": -10
    },
    "btn.switchG": {
      "size": 35
    },
    "text.switchLabelG": {
      "x": 5,
      "y": -5
    },
    "lookSlot:skin": {
      "y": -7
    },
    "lookSlot:head": {
      "y": -7
    },
    "lookSlotName:head": {
      "y": -7
    },
    "lookSlotName:skin": {
      "y": -7
    },
    "lookSlotImg:skin": {
      "size": 32
    },
    "text.skillNote@other": {
      "y": -58,
      "font": 12,
      "x": 0
    },
    "text.skillNote@theonie/a-2": {
      "y": -35,
      "font": 12,
      "x": 0
    }
  },
  "texts": {
    "text.lockHint": "「{name}」需先解鎖\n「{req}」技能。",
    "text.lockHintAny": "「{name}」需先解鎖\n{reqs}其中一項技能。",
    "intro:red": "熱情可靠的小隊長。\n近距離迎敵，負荷會自行恢復。",
    "intro:avaren": "沉默而戒備的特殊個體。\n攻擊力強，格外依賴艾德林。",
    "intro:theonie": "自信的火焰天才。\n擅長遠程火力，需留意負荷累積。",
    "intro:amber": "認真守規矩的實習哨兵。\n雷擊能波及多個目標，命中較不穩定。",
    "intro:luther": "擁有怪力的哨兵。\n擅長近戰重擊，不善應付過度親近。",
    "intro:eldrin": "溫柔又愛操心的嚮導。\n持續疏導附近隊友，適合隨隊支援。",
    "intro:chris": "懶散又親近人的戰鬥嚮導。\n能隨隊疏導，總會留意路德。",
    "intro:tino": "感官敏銳的年輕哨兵。能察覺黑暗中的怪物，防禦與生命偏低。",
    "skillTag:a-2": "生存技能 Lv2",
    "skillTag:a-1": "生存技能 Lv1",
    "skillTag:b-1": "攻擊技能 Lv1",
    "skillTag:b-2": "攻擊技能 Lv2",
    "skillTag:core-1": "核心技能 Lv1",
    "skillTag:core-2": "核心技能 Lv2",
    "skillTag:core-3": "核心技能 Lv3"
  }
};
