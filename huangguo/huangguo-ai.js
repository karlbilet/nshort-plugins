// @nshort {"id":"huangguo-ai","name":"黄果 AI","version":"1.0.0","hosts":[],"builtinSource":"huangguoai"}
// 使用 N果的黄果解析、会话和媒体通道；不发起脚本网络请求，不接触账号或播放密钥。
// 需要支持 builtinSource 的配套 App；这是独立实现，不是 REX 解密版。
(function () {
  function text(value, limit) {
    if (typeof value !== 'string' || !value.trim() || Array.from(value).length > limit) throw new Error('参数无效');
    return value.trim();
  }
  function request(action, args) { return { builtin: Object.assign({ action: action }, args) }; }
  globalThis.nshort = {
    catalog: async function (args = {}) {
      const page = args.page === undefined ? 1 : args.page;
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new Error('页码无效');
      const category = args.category || '';
      if (typeof category !== 'string' || category.length > 128) throw new Error('分类无效');
      return request('catalog', { page: page, category: category });
    },
    search: async function (args = {}) { return request('search', { query: text(args.query, 80) }); },
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
