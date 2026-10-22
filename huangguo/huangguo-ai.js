// @nshort {"id":"huangguo-ai","name":"黄果 AI","version":"1.0.0","hosts":[],"builtinSource":"huangguoai"}
// 使用 N果的黄果解析、会话和媒体通道；不发起脚本网络请求，不接触账号或播放密钥。
// 需要支持 builtinSource 的配套 App；这是独立实现，不是 REX 解密版。
(function () {
  function text(value, limit) {
    if (typeof value !== 'string' || !value.trim() || Array.from(value).length > limit) throw new Error('参数无效');
    return value.trim();
  }
  function request(action, args) { return { builtin: Object.assign({ action: action }, args) }; }
  const modules = { all: '', 'ai-duanju': 'ai-duanju', 'ai-manju': 'ai-manju', 'ai-huanlian': 'ai-huanlian', 'ai-mogai': 'ai-mogai' };
  function categoryOf(args) {
    if (typeof args.module === 'string' && args.module) {
      if (!Object.prototype.hasOwnProperty.call(modules, args.module)) throw new Error('分类无效');
      return modules[args.module];
    }
    return args.category || '';
  }
  globalThis.nshort = {
    describe: async function () {
      return {
        title: '黄果 AI',
        modules: [
          { id: 'all', title: '全部', params: [{ name: 'page', title: '页码', type: 'page' }] },
          { id: 'ai-duanju', title: 'AI短剧', params: [{ name: 'page', title: '页码', type: 'page' }] },
          { id: 'ai-manju', title: 'AI漫剧', params: [{ name: 'page', title: '页码', type: 'page' }] },
          { id: 'ai-huanlian', title: 'AI换脸', params: [{ name: 'page', title: '页码', type: 'page' }] },
          { id: 'ai-mogai', title: 'AI魔改', params: [{ name: 'page', title: '页码', type: 'page' }] }
        ],
        search: { title: '搜索', params: [{ name: 'keyword', title: '关键词', type: 'input' }] }
      };
    },
    catalog: async function (args = {}) {
      const page = args.page === undefined ? 1 : args.page;
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new Error('页码无效');
      const category = categoryOf(args);
      if (typeof category !== 'string' || category.length > 128) throw new Error('分类无效');
      return request('catalog', { page: page, category: category });
    },
    search: async function (args = {}) { return request('search', { query: text(args.keyword || args.query, 80) }); },
    detail: async function (args = {}) { return request('detail', { id: text(args.id, 60) }); },
    play: async function (args = {}) {
      const quality = args.quality || 1080;
      if (!Number.isInteger(quality) || quality < 1 || quality > 16384) throw new Error('清晰度无效');
      return request('play', { id: text(args.id, 60), episodeId: text(args.episodeId || (args.episode && args.episode.id), 120), quality: quality });
    },
    seriesSeasons: async function () { return { items: [] }; },
    danmaku: async function (args = {}) {
      const start = Math.max(0, Math.floor(Number(args.startMs) || 0));
      return { episodeId: String(args.episodeId || ''), startMs: start, nextMs: start + 60000, items: [] };
    }
  };
})();
