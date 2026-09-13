const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'models');
const objPath = path.join(outDir, 'manga_room_reference.obj');
const mtlPath = path.join(outDir, 'manga_room_reference.mtl');
const daePath = path.join(outDir, 'manga_room_reference.dae');
const rbPath = path.join(outDir, 'manga_room_reference_sketchup.rb');
const guidePath = path.join(outDir, 'manga_room_reference_README.txt');

const materials = {
  wall: { kd: [0.82, 0.82, 0.80] },
  wallInset: { kd: [0.92, 0.91, 0.88] },
  floor: { kd: [0.88, 0.86, 0.82] },
  marbleVein: { kd: [0.68, 0.68, 0.66] },
  tileLine: { kd: [0.72, 0.72, 0.70] },
  wood: { kd: [0.36, 0.25, 0.17] },
  woodLight: { kd: [0.52, 0.38, 0.25] },
  woodDark: { kd: [0.20, 0.13, 0.08] },
  blueFabric: { kd: [0.08, 0.15, 0.25] },
  blueFabricLight: { kd: [0.16, 0.27, 0.42] },
  darkFabric: { kd: [0.09, 0.10, 0.12] },
  deskDark: { kd: [0.15, 0.13, 0.10] },
  glass: { kd: [0.58, 0.74, 0.80] },
  metal: { kd: [0.63, 0.64, 0.62] },
  chrome: { kd: [0.82, 0.85, 0.86] },
  white: { kd: [0.95, 0.94, 0.90] },
  paper: { kd: [0.98, 0.96, 0.86] },
  grey: { kd: [0.36, 0.36, 0.36] },
  lightGrey: { kd: [0.62, 0.62, 0.60] },
  mirror: { kd: [0.68, 0.82, 0.88] },
  green: { kd: [0.12, 0.35, 0.15] },
  olive: { kd: [0.22, 0.28, 0.14] },
  red: { kd: [0.64, 0.08, 0.06] },
  orange: { kd: [0.78, 0.44, 0.16] },
  bookBlue: { kd: [0.12, 0.24, 0.50] },
  bookCream: { kd: [0.88, 0.78, 0.56] },
  black: { kd: [0.03, 0.03, 0.035] },
};

const verts = [];
const faces = [];
const lines = [];

function v(x, y, z) {
  verts.push([x, y, z]);
  return verts.length;
}

function face(mat, ids, name) {
  faces.push({ mat, ids, name });
}

function line(mat, a, b, name) {
  lines.push({ mat, a, b, name });
}

function box(name, mat, x1, y1, z1, x2, y2, z2) {
  const ids = [
    v(x1, y1, z1), v(x2, y1, z1), v(x2, y2, z1), v(x1, y2, z1),
    v(x1, y1, z2), v(x2, y1, z2), v(x2, y2, z2), v(x1, y2, z2),
  ];
  face(mat, [ids[0], ids[1], ids[2], ids[3]], name);
  face(mat, [ids[4], ids[7], ids[6], ids[5]], name);
  face(mat, [ids[0], ids[4], ids[5], ids[1]], name);
  face(mat, [ids[1], ids[5], ids[6], ids[2]], name);
  face(mat, [ids[2], ids[6], ids[7], ids[3]], name);
  face(mat, [ids[3], ids[7], ids[4], ids[0]], name);
  return ids;
}

function slab(name, mat, x1, y1, x2, y2, h = 0.035) {
  return box(name, mat, x1, y1, 0, x2, y2, h);
}

function cylinder(name, mat, cx, cy, radius, z1, z2, segments = 18) {
  const bottom = [];
  const top = [];
  for (let i = 0; i < segments; i += 1) {
    const a = (Math.PI * 2 * i) / segments;
    bottom.push(v(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, z1));
    top.push(v(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, z2));
  }
  face(mat, bottom.slice().reverse(), name);
  face(mat, top, name);
  for (let i = 0; i < segments; i += 1) {
    const j = (i + 1) % segments;
    face(mat, [bottom[i], bottom[j], top[j], top[i]], name);
  }
}

function arc(name, mat, cx, cy, radius, a1, a2, z = 0.04, segments = 20) {
  let prev = null;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const a = a1 + (a2 - a1) * t;
    const cur = v(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, z);
    if (prev) line(mat, prev, cur, name);
    prev = cur;
  }
}

function rod(name, mat, x1, y1, z1, x2, y2, z2, thickness = 0.035) {
  box(name, mat, x1 - thickness, y1 - thickness, z1 - thickness, x2 + thickness, y2 + thickness, z2 + thickness);
}

function frontPanel(name, mat, x1, y, z1, x2, z2, depth = 0.025) {
  box(name, mat, x1, y - depth, z1, x2, y, z2);
}

function topDetail(name, mat, x1, y1, x2, y2, z, h = 0.018) {
  box(name, mat, x1, y1, z, x2, y2, z + h);
}

// Overall scale: 1 unit ~= 1 meter. Main room left, bathroom right.
slab('main_room_floor_marble_tiles', 'floor', 0, 0, 7.7, 5.8);
slab('bathroom_floor_grey_tiles', 'grey', 8.15, 0.15, 10.3, 5.75);

// Outer and partition walls, with deliberate gaps where doors/windows sit.
box('top_outer_wall_left', 'wall', -0.25, 5.8, 0, 4.95, 6.05, 2.65);
box('top_outer_wall_right', 'wall', 5.55, 5.8, 0, 10.55, 6.05, 2.65);
box('left_outer_wall', 'wall', -0.25, -0.25, 0, 0, 6.05, 2.65);
box('bottom_outer_wall_left', 'wall', -0.25, -0.25, 0, 2.35, 0, 2.65);
box('bottom_outer_wall_mid', 'wall', 3.35, -0.25, 0, 7.75, 0, 2.65);
box('bottom_outer_wall_right', 'wall', 8.0, -0.25, 0, 10.55, 0, 2.65);
box('right_outer_wall', 'wall', 10.3, -0.25, 0, 10.55, 6.05, 2.65);
box('bathroom_partition', 'wall', 7.75, -0.25, 0, 8.0, 6.05, 2.65);
box('bath_sink_partition', 'wall', 8.0, 2.25, 0, 9.2, 2.42, 2.15);
box('shower_partition_low', 'wall', 8.0, 3.55, 0, 9.35, 3.72, 2.15);
box('main_wall_inner_panel_top', 'wallInset', 0.05, 5.765, 0.25, 7.7, 5.79, 2.25);
box('main_wall_inner_panel_left', 'wallInset', 0.01, 0.15, 0.25, 0.04, 5.6, 2.25);
box('bath_wall_inner_panel_right', 'wallInset', 10.26, 0.2, 0.25, 10.29, 5.7, 2.25);
box('bath_wall_inner_panel_top', 'wallInset', 8.05, 5.76, 0.25, 10.25, 5.79, 2.25);
box('main_baseboard_top', 'woodDark', 0.02, 5.72, 0.05, 7.7, 5.79, 0.18);
box('main_baseboard_left', 'woodDark', 0.01, 0.1, 0.05, 0.08, 5.72, 0.18);
box('bottom_baseboard', 'woodDark', 0.1, 0.01, 0.05, 7.65, 0.08, 0.18);
box('bath_baseboard_right', 'lightGrey', 10.22, 0.2, 0.04, 10.29, 5.7, 0.16);

// Window and curtains along the top side.
box('long_high_window_glass', 'glass', 1.15, 5.78, 1.55, 5.45, 5.83, 2.25);
for (let x = 1.25; x <= 5.1; x += 0.95) {
  box('window_frame_mullion', 'metal', x, 5.72, 1.45, x + 0.05, 5.9, 2.35);
}
box('window_lower_frame', 'chrome', 1.1, 5.70, 1.47, 5.55, 5.92, 1.55);
box('window_upper_frame', 'chrome', 1.1, 5.70, 2.25, 5.55, 5.92, 2.34);
box('curtain_rod', 'chrome', 0.95, 5.58, 2.5, 5.9, 5.68, 2.56);
box('left_curtain_fold_1', 'blueFabric', 1.05, 5.62, 1.2, 1.45, 5.9, 2.55);
box('left_curtain_fold_2', 'blueFabric', 1.45, 5.62, 1.2, 1.85, 5.9, 2.55);
box('right_curtain_fold_1', 'blueFabric', 4.95, 5.62, 1.2, 5.35, 5.9, 2.55);
box('right_curtain_fold_2', 'blueFabric', 5.35, 5.62, 1.2, 5.75, 5.9, 2.55);
for (let i = 0; i < 5; i += 1) {
  const x = 1.08 + i * 0.16;
  box('left_curtain_pleat_shadow', 'blueFabricLight', x, 5.58, 1.22, x + 0.035, 5.61, 2.48);
  box('right_curtain_pleat_shadow', 'blueFabricLight', 5.0 + i * 0.16, 5.58, 1.22, 5.035 + i * 0.16, 5.61, 2.48);
}

// Doors and swing arcs.
box('main_room_door_leaf', 'wood', 2.35, -0.18, 0, 3.35, 0.02, 2.15);
arc('main_room_door_swing_arc', 'black', 2.35, 0, 1.0, 0, Math.PI / 2, 0.06);
box('bathroom_door_leaf', 'wood', 9.6, -0.18, 0, 10.3, 0.02, 2.15);
arc('bathroom_door_swing_arc', 'black', 9.6, 0, 0.75, Math.PI / 2, Math.PI, 0.06);

// Bed and bedside area.
box('bed_base', 'wood', 0.7, 3.95, 0.18, 4.35, 5.15, 0.55);
box('blue_mattress', 'blueFabric', 0.8, 4.05, 0.55, 4.25, 5.05, 0.8);
box('white_pillow', 'white', 0.82, 4.15, 0.8, 1.45, 5.0, 0.98);
box('blue_blanket_fold', 'blueFabric', 1.25, 4.0, 0.82, 4.15, 5.08, 1.02);
box('bed_headboard', 'woodDark', 0.58, 3.9, 0.25, 0.75, 5.18, 1.12);
box('bed_footboard', 'woodDark', 4.28, 3.9, 0.18, 4.42, 5.18, 0.9);
topDetail('pillow_soft_top', 'paper', 0.88, 4.22, 1.4, 4.94, 0.98, 0.035);
for (let i = 0; i < 5; i += 1) {
  topDetail('blanket_fold_line', 'blueFabricLight', 1.35 + i * 0.48, 4.04, 1.39 + i * 0.48, 5.04, 1.025, 0.012);
}
topDetail('blanket_turned_edge', 'blueFabricLight', 1.22, 4.02, 1.38, 5.07, 1.04, 0.018);
box('nightstand', 'wood', 0.55, 3.25, 0, 1.25, 3.9, 0.72);
frontPanel('nightstand_drawer_front', 'woodLight', 0.6, 3.24, 0.42, 1.2, 0.66);
box('nightstand_drawer_handle', 'chrome', 0.84, 3.20, 0.52, 1.0, 3.24, 0.56);
cylinder('round_lamp_shade', 'white', 0.75, 3.65, 0.16, 0.72, 1.08);
rod('lamp_stem', 'chrome', 0.75, 3.65, 0.62, 0.75, 3.65, 0.98, 0.018);
box('small_phone_block', 'black', 0.82, 3.33, 0.73, 1.08, 3.5, 0.8);
box('red_retro_phone', 'red', 0.58, 3.35, 0.73, 0.82, 3.58, 0.9);
box('phone_receiver', 'red', 0.58, 3.58, 0.9, 0.86, 3.7, 0.99);

// Desk wall, chair, and accessories.
box('long_work_desk', 'wood', 0.35, 0.6, 0, 1.3, 3.2, 0.75);
box('desk_front_drawer_stack', 'woodLight', 0.36, 0.62, 0.08, 1.31, 1.25, 0.67);
for (let i = 0; i < 3; i += 1) {
  frontPanel('desk_drawer_face', 'woodLight', 0.4, 0.6, 0.15 + i * 0.18, 1.22, 0.28 + i * 0.18);
  box('desk_drawer_handle', 'chrome', 0.72, 0.56, 0.2 + i * 0.18, 0.9, 0.6, 0.24 + i * 0.18);
}
box('desk_pad', 'deskDark', 0.47, 1.35, 0.76, 1.18, 2.15, 0.79);
box('laptop', 'grey', 0.58, 1.52, 0.79, 1.03, 1.92, 0.86);
box('laptop_screen', 'black', 0.58, 1.9, 0.86, 1.03, 1.97, 1.28);
topDetail('open_notebook_page', 'paper', 0.52, 2.28, 1.08, 2.76, 0.76, 0.018);
topDetail('book_blue_cover', 'bookBlue', 0.56, 2.82, 1.08, 3.08, 0.77, 0.08);
topDetail('book_cream_cover', 'bookCream', 0.58, 3.02, 1.1, 3.18, 0.86, 0.06);
box('wall_picture_frame_1', 'woodDark', 0.02, 1.02, 0.95, 0.08, 1.72, 1.62);
box('wall_picture_paper_1', 'paper', 0.08, 1.08, 1.0, 0.1, 1.66, 1.56);
box('wall_picture_frame_2', 'woodDark', 0.02, 1.86, 0.95, 0.08, 2.56, 1.62);
box('wall_picture_paper_2', 'paper', 0.08, 1.92, 1.0, 0.1, 2.5, 1.56);
cylinder('desk_lamp_base', 'black', 0.55, 0.95, 0.12, 0.75, 0.82);
box('desk_lamp_arm', 'black', 0.52, 0.92, 0.8, 0.62, 1.6, 1.4);
box('desk_lamp_head', 'black', 0.45, 1.48, 1.33, 0.75, 1.7, 1.5);
box('office_chair_seat', 'black', 1.35, 1.55, 0.35, 1.95, 2.15, 0.58);
box('office_chair_back', 'black', 1.82, 1.5, 0.58, 2.05, 2.2, 1.35);
cylinder('chair_pedestal', 'metal', 1.65, 1.85, 0.08, 0, 0.35);
for (let i = 0; i < 5; i += 1) {
  const a = (Math.PI * 2 * i) / 5;
  rod('chair_wheel_leg', 'metal', 1.65, 1.85, 0.08, 1.65 + Math.cos(a) * 0.45, 1.85 + Math.sin(a) * 0.45, 0.08, 0.025);
  cylinder('chair_caster', 'black', 1.65 + Math.cos(a) * 0.48, 1.85 + Math.sin(a) * 0.48, 0.055, 0, 0.08, 10);
}

// Rugs.
slab('large_blue_grey_rug', 'darkFabric', 1.05, 2.45, 3.95, 3.22, 0.045);
slab('bath_blue_floor_mat', 'blueFabric', 9.05, 0.85, 9.7, 1.55, 0.045);

// Closet and clothing area.
box('large_wardrobe_body', 'wood', 5.9, 3.95, 0, 7.45, 5.65, 2.25);
box('wardrobe_left_door', 'wood', 5.95, 3.88, 0.1, 6.65, 3.96, 2.1);
box('wardrobe_right_door', 'wood', 6.7, 3.88, 0.1, 7.4, 3.96, 2.1);
for (let i = 0; i < 3; i += 1) {
  frontPanel('wardrobe_lower_drawer', 'woodLight', 7.08, 3.88, 0.22 + i * 0.24, 7.38, 0.38 + i * 0.24);
  box('wardrobe_drawer_handle', 'chrome', 7.18, 3.84, 0.29 + i * 0.24, 7.3, 3.88, 0.33 + i * 0.24);
}
box('wardrobe_left_handle', 'chrome', 6.43, 3.82, 0.92, 6.5, 3.88, 1.35);
box('wardrobe_right_handle', 'chrome', 6.82, 3.82, 0.92, 6.89, 3.88, 1.35);
box('upper_cabinet_left_door', 'woodLight', 6.0, 3.88, 1.72, 6.68, 3.96, 2.18);
box('upper_cabinet_right_door', 'woodLight', 6.72, 3.88, 1.72, 7.4, 3.96, 2.18);
box('open_closet_shadow', 'black', 7.05, 4.05, 0.15, 7.42, 5.2, 1.9);
box('hanging_uniform', 'green', 7.12, 4.25, 0.25, 7.34, 4.85, 1.55);
box('uniform_gold_buttons', 'orange', 7.09, 4.18, 0.75, 7.13, 4.22, 1.3);
box('hanging_pants_shadow', 'black', 7.28, 4.25, 0.18, 7.38, 4.82, 1.3);
rod('closet_hanger_bar', 'chrome', 7.08, 4.15, 1.55, 7.4, 5.05, 1.55, 0.018);
box('overhead_cabinet', 'wood', 5.9, 5.2, 0, 7.45, 5.65, 2.55);
box('green_backpack', 'green', 5.2, 3.95, 0, 5.75, 4.55, 0.9);
box('backpack_front_pocket', 'olive', 5.29, 3.9, 0.18, 5.66, 4.03, 0.58);
box('backpack_top_flap', 'olive', 5.25, 3.98, 0.74, 5.72, 4.28, 0.98);
rod('backpack_strap_left', 'black', 5.24, 4.1, 0.2, 5.24, 4.48, 0.7, 0.018);
rod('backpack_strap_right', 'black', 5.7, 4.1, 0.2, 5.7, 4.48, 0.7, 0.018);
box('shoe_bench', 'wood', 6.95, 1.55, 0, 7.6, 2.7, 0.42);
box('black_cushion_on_bench', 'black', 6.92, 1.58, 0.42, 7.62, 2.72, 0.62);
for (let i = 0; i < 4; i += 1) {
  box('shoe_pair', 'black', 7.02, 1.65 + i * 0.25, 0.02, 7.25, 1.82 + i * 0.25, 0.15);
  box('shoe_highlight', 'lightGrey', 7.08, 1.7 + i * 0.25, 0.15, 7.16, 1.78 + i * 0.25, 0.18);
}

// Bathroom fixtures.
box('shower_glass_panel', 'glass', 8.0, 3.65, 0.15, 9.35, 3.75, 1.85);
box('shower_glass_door', 'glass', 9.28, 3.65, 0.15, 9.38, 5.2, 1.85);
rod('shower_door_handle', 'chrome', 9.42, 4.1, 0.75, 9.42, 4.75, 1.15, 0.022);
box('shower_floor_pan', 'grey', 8.15, 3.78, 0.02, 9.35, 5.5, 0.08);
cylinder('shower_column', 'metal', 8.45, 4.85, 0.04, 0.1, 1.85);
cylinder('shower_head', 'metal', 8.48, 5.05, 0.12, 1.75, 1.85);
rod('shower_mixer_bar', 'chrome', 8.25, 4.72, 0.88, 8.65, 4.72, 0.88, 0.022);
box('shower_wall_tile_accent', 'lightGrey', 8.08, 4.0, 0.7, 8.12, 5.5, 1.6);
box('sink_counter', 'white', 8.25, 2.4, 0.45, 9.1, 3.18, 0.85);
box('sink_basin', 'white', 8.45, 2.62, 0.85, 8.95, 3.0, 0.98);
cylinder('faucet', 'metal', 8.72, 3.03, 0.04, 0.98, 1.25);
box('sink_cabinet_front', 'woodLight', 8.28, 2.38, 0.08, 9.07, 2.42, 0.62);
box('sink_cabinet_handle', 'chrome', 8.55, 2.34, 0.34, 8.82, 2.38, 0.39);
box('bathroom_mirror', 'mirror', 8.28, 2.3, 1.05, 9.1, 2.36, 1.9);
box('mirror_frame', 'chrome', 8.22, 2.28, 1.0, 9.16, 2.38, 1.96);
box('towel_bar', 'chrome', 8.05, 2.55, 0.95, 8.12, 3.12, 1.0);
box('hanging_towel', 'blueFabricLight', 8.04, 2.72, 0.45, 8.14, 3.0, 0.92);
box('soap_bottle', 'green', 8.28, 2.42, 0.88, 8.38, 2.54, 1.15);
box('toothbrush_cup', 'white', 8.98, 2.42, 0.88, 9.08, 2.54, 1.08);
box('toilet_tank', 'white', 9.18, 4.45, 0.45, 9.78, 4.78, 1.0);
cylinder('toilet_bowl', 'white', 9.48, 4.12, 0.28, 0.2, 0.58);
box('toilet_seat_lid', 'paper', 9.24, 3.92, 0.58, 9.72, 4.35, 0.64);
box('toilet_flush_button', 'chrome', 9.42, 4.43, 1.01, 9.54, 4.5, 1.05);
box('toilet_paper_holder', 'white', 10.04, 4.12, 0.65, 10.18, 4.4, 0.9);
rod('toilet_paper_pin', 'chrome', 10.0, 4.26, 0.78, 10.2, 4.26, 0.78, 0.018);

// Plants as simple drawing references.
cylinder('plant_pot_bed_corner', 'wood', 0.55, 5.35, 0.2, 0, 0.28);
for (let i = 0; i < 8; i += 1) {
  const a = (Math.PI * 2 * i) / 8;
  box('plant_leaf_cluster', 'green', 0.5 + Math.cos(a) * 0.14, 5.3 + Math.sin(a) * 0.14, 0.28, 0.62 + Math.cos(a) * 0.2, 5.42 + Math.sin(a) * 0.2, 0.55);
  box('plant_leaf_tip', 'olive', 0.54 + Math.cos(a) * 0.22, 5.34 + Math.sin(a) * 0.22, 0.45, 0.6 + Math.cos(a) * 0.32, 5.4 + Math.sin(a) * 0.32, 0.65);
}
cylinder('small_desk_plant_pot', 'wood', 0.8, 0.72, 0.14, 0.75, 0.95);
box('small_desk_plant_leaves', 'green', 0.68, 0.6, 0.95, 0.92, 0.84, 1.15);

// Marble vein and surface color details are modeled as thin strips so they survive DAE import.
const veins = [
  [0.3, 0.8, 2.6, 1.15], [1.4, 4.9, 3.1, 3.5], [2.2, 0.4, 4.7, 1.7],
  [3.8, 5.5, 5.9, 3.8], [4.4, 2.2, 6.9, 2.9], [5.2, 0.8, 7.45, 0.35],
  [0.7, 2.0, 2.0, 2.8], [3.1, 3.2, 4.4, 4.2], [5.9, 5.1, 7.3, 4.5],
];
for (const [x1, y1, x2, y2] of veins) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  topDetail('marble_vein_soft_strip', 'marbleVein', minX, minY, maxX, maxY, 0.041, 0.006);
}

// Floor tile guide lines.
for (let x = 0; x <= 7.7; x += 1) {
  line('tileLine', v(x, 0, 0.038), v(x, 5.8, 0.038), 'main_floor_tile_grid');
}
for (let y = 0; y <= 5.8; y += 1) {
  line('tileLine', v(0, y, 0.038), v(7.7, y, 0.038), 'main_floor_tile_grid');
}
for (let x = 8.15; x <= 10.3; x += 0.7) {
  line('tileLine', v(x, 0.15, 0.04), v(x, 5.75, 0.04), 'bath_floor_tile_grid');
}
for (let y = 0.15; y <= 5.75; y += 0.7) {
  line('tileLine', v(8.15, y, 0.04), v(10.3, y, 0.04), 'bath_floor_tile_grid');
}

function writeMtl() {
  const chunks = [];
  for (const [name, mat] of Object.entries(materials)) {
    chunks.push(`newmtl ${name}`);
    chunks.push(`Kd ${mat.kd.join(' ')}`);
    chunks.push('Ka 0.15 0.15 0.15');
    chunks.push('Ks 0.05 0.05 0.05');
    chunks.push('Ns 20');
    if (name === 'glass') {
      chunks.push('d 0.45');
      chunks.push('Tr 0.55');
    }
    chunks.push('');
  }
  fs.writeFileSync(mtlPath, chunks.join('\n'), 'utf8');
}

function writeObj() {
  const chunks = [
    '# Manga room reference model generated from a top-down image.',
    '# Units are approximate meters.',
    'mtllib manga_room_reference.mtl',
    '',
  ];
  for (const p of verts) chunks.push(`v ${p[0].toFixed(4)} ${p[1].toFixed(4)} ${p[2].toFixed(4)}`);
  chunks.push('');
  let currentMat = '';
  for (const f of faces) {
    if (f.mat !== currentMat) {
      chunks.push(`usemtl ${f.mat}`);
      currentMat = f.mat;
    }
    chunks.push(`o ${f.name}`);
    chunks.push(`f ${f.ids.join(' ')}`);
  }
  chunks.push('');
  currentMat = '';
  for (const l of lines) {
    if (l.mat !== currentMat) {
      chunks.push(`usemtl ${l.mat}`);
      currentMat = l.mat;
    }
    chunks.push(`o ${l.name}`);
    chunks.push(`l ${l.a} ${l.b}`);
  }
  fs.writeFileSync(objPath, chunks.join('\n'), 'utf8');
}

function writeDae() {
  const meshPositions = verts.flat().map((n) => Number(n.toFixed(4)));
  const trianglesByMaterial = new Map();
  for (const f of faces) {
    const tri = [];
    for (let i = 1; i < f.ids.length - 1; i += 1) {
      tri.push(f.ids[0] - 1, f.ids[i] - 1, f.ids[i + 1] - 1);
    }
    if (!trianglesByMaterial.has(f.mat)) trianglesByMaterial.set(f.mat, []);
    trianglesByMaterial.get(f.mat).push(...tri);
  }

  const effects = Object.entries(materials).map(([name, mat]) => {
    const [r, g, b] = mat.kd;
    const alpha = name === 'glass' ? 0.45 : 1;
    return `
      <effect id="${name}-effect">
        <profile_COMMON>
          <technique sid="common">
            <phong>
              <diffuse><color>${r} ${g} ${b} ${alpha}</color></diffuse>
              <transparency><float>${alpha}</float></transparency>
            </phong>
          </technique>
        </profile_COMMON>
      </effect>`;
  }).join('\n');

  const mats = Object.keys(materials).map((name) => `
      <material id="${name}" name="${name}">
        <instance_effect url="#${name}-effect"/>
      </material>`).join('\n');

  const tris = [...trianglesByMaterial.entries()].map(([name, ids]) => `
          <triangles material="${name}-symbol" count="${ids.length / 3}">
            <input semantic="VERTEX" source="#room-vertices" offset="0"/>
            <p>${ids.join(' ')}</p>
          </triangles>`).join('\n');

  const bindMats = Object.keys(materials).map((name) => `
              <instance_material symbol="${name}-symbol" target="#${name}"/>`).join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1">
  <asset>
    <unit name="meter" meter="1"/>
    <up_axis>Z_UP</up_axis>
  </asset>
  <library_effects>${effects}
  </library_effects>
  <library_materials>${mats}
  </library_materials>
  <library_geometries>
    <geometry id="manga-room-reference" name="manga_room_reference">
      <mesh>
        <source id="room-positions">
          <float_array id="room-positions-array" count="${meshPositions.length}">${meshPositions.join(' ')}</float_array>
          <technique_common>
            <accessor source="#room-positions-array" count="${verts.length}" stride="3">
              <param name="X" type="float"/>
              <param name="Y" type="float"/>
              <param name="Z" type="float"/>
            </accessor>
          </technique_common>
        </source>
        <vertices id="room-vertices">
          <input semantic="POSITION" source="#room-positions"/>
        </vertices>${tris}
      </mesh>
    </geometry>
  </library_geometries>
  <library_visual_scenes>
    <visual_scene id="Scene" name="Scene">
      <node id="manga_room_reference" name="manga_room_reference">
        <instance_geometry url="#manga-room-reference">
          <bind_material>
            <technique_common>${bindMats}
            </technique_common>
          </bind_material>
        </instance_geometry>
      </node>
    </visual_scene>
  </library_visual_scenes>
  <scene>
    <instance_visual_scene url="#Scene"/>
  </scene>
</COLLADA>
`;
  fs.writeFileSync(daePath, xml, 'utf8');
}

function writeSketchupRuby() {
  const materialData = {};
  for (const [name, mat] of Object.entries(materials)) {
    materialData[name] = {
      color: mat.kd.map((n) => Math.round(n * 255)),
      alpha: name === 'glass' || name === 'mirror' ? 0.48 : 1.0,
    };
  }
  const faceData = faces.map((f) => ({
    material: f.mat,
    name: f.name,
    indices: f.ids.map((id) => id - 1),
  }));
  const lineData = lines.map((l) => ({
    material: l.mat,
    name: l.name,
    a: l.a - 1,
    b: l.b - 1,
  }));
  const rb = `# Manga room reference for SketchUp
# Generated from tools/generate_manga_room_model.js
# Usage in SketchUp:
# 1. Open Window > Ruby Console.
# 2. Paste:
#    load '${rbPath.replace(/\\/g, '/')}'

model = Sketchup.active_model
model.start_operation('Create Manga Room Reference', true)

materials_data = ${JSON.stringify(materialData, null, 2)}
vertices = ${JSON.stringify(verts.map((p) => p.map((n) => Number(n.toFixed(4)))), null, 2)}
faces_data = ${JSON.stringify(faceData, null, 2)}
lines_data = ${JSON.stringify(lineData, null, 2)}

materials = {}
materials_data.each do |name, data|
  mat = model.materials[name] || model.materials.add(name)
  color = data['color']
  mat.color = Sketchup::Color.new(color[0], color[1], color[2])
  mat.alpha = data['alpha']
  materials[name] = mat
end

room_group = model.active_entities.add_group
room_group.name = 'manga_room_reference_colored'
entities = room_group.entities

faces_data.each do |data|
  points = data['indices'].map do |i|
    v = vertices[i]
    Geom::Point3d.new(v[0].m, v[1].m, v[2].m)
  end
  face = entities.add_face(points)
  next unless face
  mat = materials[data['material']]
  face.material = mat
  face.back_material = mat
  face.reverse! if face.normal.z < 0 && data['name'].include?('floor')
end

lines_data.each do |data|
  a = vertices[data['a']]
  b = vertices[data['b']]
  edge = entities.add_line(
    Geom::Point3d.new(a[0].m, a[1].m, a[2].m),
    Geom::Point3d.new(b[0].m, b[1].m, b[2].m)
  )
  edge.material = materials[data['material']] if edge && materials[data['material']]
end

room_group.entities.grep(Sketchup::Face).each do |face|
  face.edges.each { |edge| edge.soft = false; edge.smooth = false }
end

model.active_view.zoom(room_group)
model.commit_operation
`;
  fs.writeFileSync(rbPath, rb, 'utf8');
}

function writeGuide() {
  const text = [
    'manga_room_reference',
    '',
    'This is a colored, refined 3D blockout based on the supplied top-down room reference.',
    'It is intended for comic background perspective, not exact construction documentation.',
    '',
    'Recommended import order for SketchUp:',
    '1. For the most reliable colors, run manga_room_reference_sketchup.rb inside SketchUp.',
    '2. If you prefer importing a file, try manga_room_reference.dae.',
    '3. If your SketchUp setup imports OBJ better, import manga_room_reference.obj with manga_room_reference.mtl in the same folder.',
    '',
    'Included scene elements:',
    '- Main bedroom/study space',
    '- Bathroom partition and fixtures',
    '- Bed, desk, chair, wardrobe, bench, rugs, doors, window, curtains, plants',
    '- Colored material groups for wood, fabric, metal, glass, bathroom tile, marble floor, and small props',
    '- Extra drawing-reference details: cabinet panels, handles, bedding folds, books, phone, lamps, mirror, towels, fixtures, shoes, backpack details',
    '- Floor tile guide lines, subtle marble markings, and door swing arcs',
    '',
    'Scale: 1 model unit is approximately 1 meter.',
    'You can freely edit/delete parts in SketchUp after import.',
    '',
    'SketchUp Ruby Console command:',
    `load '${rbPath.replace(/\\/g, '/')}'`,
    '',
  ].join('\n');
  fs.writeFileSync(guidePath, text, 'utf8');
}

fs.mkdirSync(outDir, { recursive: true });
writeMtl();
writeObj();
writeDae();
writeSketchupRuby();
writeGuide();

console.log(`Wrote ${objPath}`);
console.log(`Wrote ${mtlPath}`);
console.log(`Wrote ${daePath}`);
console.log(`Wrote ${rbPath}`);
console.log(`Wrote ${guidePath}`);
