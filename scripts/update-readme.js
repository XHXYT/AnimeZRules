const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const readmePath = path.join(root, 'README.md');
const sourcesDir = path.join(root, 'sources');

const START = '<!-- sources-table:start -->';
const END = '<!-- sources-table:end -->';

const ORDER = [
  'key_fqdmdm', 'key_acgfta', 'key_agedmvideo', 'key_cycani', 'key_tvtfun',
  'key_xifan', 'key_girigirilove',
  'key_7sefun', 'key_moonci', 'key_akianime', 'key_mgnacg', 'key_mutefun',
  'key_baimao', 'key_dm84', 'key_mxdm', 'key_dalvdm', 'key_ezdmw',
  'key_sorani', 'key_milimili'
];

const NOTES = {
  key_fqdmdm: 'www.fqdm.cc，模板站经典结构',
  key_acgfta: 'www.acgfta.com',
  key_agedmvideo: 'www.agedm.io',
  key_cycani: 'www.cycani.org，接口源示例（播放需账号登录）',
  key_tvtfun: 'www.tvtfun.net，播放可能需手动辅助（应用内自动尝试两次后弹出）',
  key_xifan: 'next.xifanacg.com（接口 api.xifanacg.com），Supabase PostgREST 接口源（选集内嵌详情接口）',
  key_girigirilove: 'ani.girigirilove.com，MacCMS 模板站（播放地址 base64 + URL 解码，搜索需输入图片验证码）',
  key_7sefun: 'www.7sefun.top，播放地址需 WebView JS 解析',
  key_moonci: 'www.moonci.com',
  key_akianime: 'www.akianime.cc',
  key_mgnacg: 'www.mgnacg.com，搜索需图片验证码，播放地址需 WebView JS 解析',
  key_mutefun: 'www.2kdm.com，验证码图片由站点 JS 注入，播放地址需 WebView JS 解析',
  key_baimao: 'www.baimaodm.com',
  key_dm84: 'dmbus.cc，播放地址需 WebView JS 解析',
  key_mxdm: 'www.dcc3.com，域名经常更换',
  key_dalvdm: 'www.sbdl.cc，搜索需图片验证码，播放地址 2 步提取（POST 请求指令 + 内联 AES 解密 + 条件代理）',
  key_ezdmw: 'm.ezdmw.org（移动站）',
  key_sorani: 'api.sorani.cc，REST 接口源（业务码 code:200）',
  key_milimili: 'milimili.moe，Connect-RPC 接口源（播放需账号登录：cookie 会话 + GetEpisode 接口取直链）'
};

function typeLabel(pc, source) {
  let label = pc.sourceType === 'json' ? 'JSON' : 'HTML';
  const posts = [pc.search && pc.search.videos, pc.homepage && pc.homepage.banner,
    ...((pc.homepage && pc.homepage.category && pc.homepage.category.cards) || []),
    pc.detail].filter(v => v && v.method === 'POST');
  if (posts.length > 0) label += ' + POST';
  if (pc.videoUrl && pc.videoUrl.iframeSelector) label += ' + WebView';
  if (pc.videoUrl && pc.videoUrl.steps) label += ' + steps';
  if (pc.search && pc.search.captcha) label += ' + 搜索验证码';
  if (source.login) label += ' + 登录';
  return label;
}

const entries = new Map();
for (const f of fs.readdirSync(sourcesDir).filter(x => x.endsWith('.json')).sort()) {
  const c = JSON.parse(fs.readFileSync(path.join(sourcesDir, f), 'utf8'));
  for (const s of (c.sources || [])) {
    if (entries.has(s.key)) throw new Error('duplicate key: ' + s.key + ' in ' + f);
    entries.set(s.key, { file: f, source: s });
  }
}

const ordered = ORDER.filter(k => entries.has(k));
for (const k of [...entries.keys()].sort()) {
  if (!ordered.includes(k)) ordered.push(k);
}

const rows = ordered.map(k => {
  const { file, source } = entries.get(k);
  const pc = source.parserConfig || {};
  const host = (source.baseUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const note = NOTES[k] || host;
  return `| ${source.name} | ${typeLabel(pc, source)} | ${note} | [${file}](sources/${file}) |`;
});

const table = ['| 规则 | 类型 | 说明 | 文件 |', '|------|------|------|------|', ...rows].join('\n');
const readme = fs.readFileSync(readmePath, 'utf8');
const si = readme.indexOf(START);
const ei = readme.indexOf(END);
if (si < 0 || ei < 0) throw new Error('markers not found in README.md');
const next = readme.slice(0, si) + START + '\n' + table + '\n' + END + readme.slice(ei + END.length);
fs.writeFileSync(readmePath, next);
console.log('README source table updated: ' + rows.length + ' sources (' + (entries.size - ORDER.length > 0 ? (entries.size - ORDER.filter(k => entries.has(k)).length) + ' auto-appended' : 'no new files') + ')');
