/* 可以查看的海報、告示（js/posters.js）
   素材 id → title＝視窗標題、text＝說明文字（\n＝換行）。
   走到海報前面按空白鍵 查看，會跳出放大的海報圖和這段文字。
   想讓別的素材也能看，照格式加一行就好（素材 id 在地圖編輯器的素材資訊裡看得到）。 */
const POSTERS = {
  tile_new_decor_poster: { title: '宣導海報', text: '「尊重彼此，拒絕騷擾。」\n應變中心到處都貼著這張海報——聽說是溫特部隊長親自印、親自一張一張貼上去的。' },
  tile_eoc_distance_poster: { title: '安全距離海報', text: '「請與他人保持 1.5 公尺安全距離。」\n精神鏈結很敏感，靠太近容易互相影響。' },
  tile_eoc_no_entry_poster: { title: '禁止進入', text: '「哨兵與狗不得進入。」\n……球球好像從來沒把這張海報放在眼裡。' },
  tile_hq_poster: { title: '小海報', text: '一張小小的宣傳海報，角落有人用原子筆畫了一個笑臉。' },
  tile_station_hall_lightbox: { title: '大廳告示燈箱', text: '台北車站大廳的告示燈箱。燈管有點接觸不良，一閃一閃的。' },
  tile_mrt_info_board_map: { title: '路線圖', text: '捷運路線圖。有幾站的名字被人用麥克筆塗掉了。' },
  tile_mrt_info_board_notice: { title: '公告', text: '「本站因不明原因暫停營運，造成不便，敬請見諒。」' },
  tile_mrt_poster_moon_lake: { title: '月之湖', text: '旅遊宣傳海報。照片裡的湖面平靜得有點不真實。' },
  tile_mrt_poster_moonlight: { title: '月光', text: '旅遊宣傳海報。「在月光下，和重要的人一起。」' },
  tile_hq_corkboard: { title: '軟木公告欄', text: '公告欄上釘滿了值班表和便條紙，最上面那張寫著「記得補杏仁水」。' },
};
