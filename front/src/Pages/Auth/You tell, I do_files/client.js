import '/node_modules/vite/dist/client/env.mjs';

// set :host styles to make playwright detect the element as visible
const template = /*html*/ `
<style>
:host {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  --monospace: 'SFMono-Regular', Consolas,
  'Liberation Mono', Menlo, Courier, monospace;
  --red: #ff5555;
  --yellow: #e2aa53;
  --purple: #cfa4ff;
  --cyan: #2dd9da;
  --dim: #c9c9c9;

  --window-background: #181818;
  --window-color: #d8d8d8;
}

.backdrop {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  margin: 0;
  background: rgba(0, 0, 0, 0.66);
}

.window {
  font-family: var(--monospace);
  line-height: 1.5;
  width: 800px;
  color: var(--window-color);
  margin: 30px auto;
  padding: 25px 40px;
  position: relative;
  background: var(--window-background);
  border-radius: 6px 6px 8px 8px;
  box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
  overflow: hidden;
  border-top: 8px solid var(--red);
  direction: ltr;
  text-align: left;
}

pre {
  font-family: var(--monospace);
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow-x: scroll;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

.message {
  line-height: 1.3;
  font-weight: 600;
  white-space: pre-wrap;
}

.message-body {
  color: var(--red);
}

.plugin {
  color: var(--purple);
}

.file {
  color: var(--cyan);
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.frame {
  color: var(--yellow);
}

.stack {
  font-size: 13px;
  color: var(--dim);
}

.tip {
  font-size: 13px;
  color: #999;
  border-top: 1px dotted #999;
  padding-top: 13px;
}

code {
  font-size: 13px;
  font-family: var(--monospace);
  color: var(--yellow);
}

.file-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
<div class="backdrop" part="backdrop">
  <div class="window" part="window">
    <pre class="message" part="message"><span class="plugin"></span><span class="message-body"></span></pre>
    <pre class="file" part="file"></pre>
    <pre class="frame" part="frame"></pre>
    <pre class="stack" part="stack"></pre>
    <div class="tip" part="tip">
      Click outside or fix the code to dismiss.<br>
      You can also disable this overlay by setting
      <code>server.hmr.overlay</code> to <code>false</code> in <code>vite.config.js.</code>
    </div>
  </div>
</div>
`;
const fileRE = /(?:[a-zA-Z]:\\|\/).*?:\d+:\d+/g;
const codeframeRE = /^(?:>?\s+\d+\s+\|.*|\s+\|\s*\^.*)\r?\n/gm;
// Allow `ErrorOverlay` to extend `HTMLElement` even in environments where
// `HTMLElement` was not originally defined.
const { HTMLElement = class {
} } = globalThis;
class ErrorOverlay extends HTMLElement {
    constructor(err, links = true) {
        var _a;
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = template;
        codeframeRE.lastIndex = 0;
        const hasFrame = err.frame && codeframeRE.test(err.frame);
        const message = hasFrame
            ? err.message.replace(codeframeRE, '')
            : err.message;
        if (err.plugin) {
            this.text('.plugin', `[plugin:${err.plugin}] `);
        }
        this.text('.message-body', message.trim());
        const [file] = (((_a = err.loc) === null || _a === void 0 ? void 0 : _a.file) || err.id || 'unknown file').split(`?`);
        if (err.loc) {
            this.text('.file', `${file}:${err.loc.line}:${err.loc.column}`, links);
        }
        else if (err.id) {
            this.text('.file', file);
        }
        if (hasFrame) {
            this.text('.frame', err.frame.trim());
        }
        this.text('.stack', err.stack, links);
        this.root.querySelector('.window').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.addEventListener('click', () => {
            this.close();
        });
    }
    text(selector, text, linkFiles = false) {
        const el = this.root.querySelector(selector);
        if (!linkFiles) {
            el.textContent = text;
        }
        else {
            let curIndex = 0;
            let match;
            fileRE.lastIndex = 0;
            while ((match = fileRE.exec(text))) {
                const { 0: file, index } = match;
                if (index != null) {
                    const frag = text.slice(curIndex, index);
                    el.appendChild(document.createTextNode(frag));
                    const link = document.createElement('a');
                    link.textContent = file;
                    link.className = 'file-link';
                    link.onclick = () => {
                        fetch('/__open-in-editor?file=' + encodeURIComponent(file));
                    };
                    el.appendChild(link);
                    curIndex += frag.length + file.length;
                }
            }
        }
    }
    close() {
        var _a;
        (_a = this.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this);
    }
}
const overlayId = 'vite-error-overlay';
const { customElements } = globalThis; // Ensure `customElements` is defined before the next line.
if (customElements && !customElements.get(overlayId)) {
    customElements.define(overlayId, ErrorOverlay);
}

console.debug('[vite] connecting...');
const importMetaUrl = new URL(import.meta.url);
// use server configuration, then fallback to inference
const serverHost = "localhost:5173/";
const socketProtocol = null || (location.protocol === 'https:' ? 'wss' : 'ws');
const hmrPort = null;
const socketHost = `${null || importMetaUrl.hostname}:${hmrPort || importMetaUrl.port}${"/"}`;
const directSocketHost = "localhost:5173/";
const base = "/" || '/';
const messageBuffer = [];
let socket;
try {
    let fallback;
    // only use fallback when port is inferred to prevent confusion
    if (!hmrPort) {
        fallback = () => {
            // fallback to connecting directly to the hmr server
            // for servers which does not support proxying websocket
            socket = setupWebSocket(socketProtocol, directSocketHost, () => {
                const currentScriptHostURL = new URL(import.meta.url);
                const currentScriptHost = currentScriptHostURL.host +
                    currentScriptHostURL.pathname.replace(/@vite\/client$/, '');
                console.error('[vite] failed to connect to websocket.\n' +
                    'your current setup:\n' +
                    `  (browser) ${currentScriptHost} <--[HTTP]--> ${serverHost} (server)\n` +
                    `  (browser) ${socketHost} <--[WebSocket (failing)]--> ${directSocketHost} (server)\n` +
                    'Check out your Vite / network configuration and https://vitejs.dev/config/server-options.html#server-hmr .');
            });
            socket.addEventListener('open', () => {
                console.info('[vite] Direct websocket connection fallback. Check out https://vitejs.dev/config/server-options.html#server-hmr to remove the previous connection error.');
            }, { once: true });
        };
    }
    socket = setupWebSocket(socketProtocol, socketHost, fallback);
}
catch (error) {
    console.error(`[vite] failed to connect to websocket (${error}). `);
}
function setupWebSocket(protocol, hostAndPath, onCloseWithoutOpen) {
    const socket = new WebSocket(`${protocol}://${hostAndPath}`, 'vite-hmr');
    let isOpened = false;
    socket.addEventListener('open', () => {
        isOpened = true;
    }, { once: true });
    // Listen for messages
    socket.addEventListener('message', async ({ data }) => {
        handleMessage(JSON.parse(data));
    });
    // ping server
    socket.addEventListener('close', async ({ wasClean }) => {
        if (wasClean)
            return;
        if (!isOpened && onCloseWithoutOpen) {
            onCloseWithoutOpen();
            return;
        }
        console.log(`[vite] server connection lost. polling for restart...`);
        await waitForSuccessfulPing(protocol, hostAndPath);
        location.reload();
    });
    return socket;
}
function warnFailedFetch(err, path) {
    if (!err.message.match('fetch')) {
        console.error(err);
    }
    console.error(`[hmr] Failed to reload ${path}. ` +
        `This could be due to syntax errors or importing non-existent ` +
        `modules. (see errors above)`);
}
function cleanUrl(pathname) {
    const url = new URL(pathname, location.toString());
    url.searchParams.delete('direct');
    return url.pathname + url.search;
}
let isFirstUpdate = true;
const outdatedLinkTags = new WeakSet();
async function handleMessage(payload) {
    switch (payload.type) {
        case 'connected':
            console.debug(`[vite] connected.`);
            sendMessageBuffer();
            // proxy(nginx, docker) hmr ws maybe caused timeout,
            // so send ping package let ws keep alive.
            setInterval(() => {
                if (socket.readyState === socket.OPEN) {
                    socket.send('{"type":"ping"}');
                }
            }, 30000);
            break;
        case 'update':
            notifyListeners('vite:beforeUpdate', payload);
            // if this is the first update and there's already an error overlay, it
            // means the page opened with existing server compile error and the whole
            // module script failed to load (since one of the nested imports is 500).
            // in this case a normal update won't work and a full reload is needed.
            if (isFirstUpdate && hasErrorOverlay()) {
                window.location.reload();
                return;
            }
            else {
                clearErrorOverlay();
                isFirstUpdate = false;
            }
            await Promise.all(payload.updates.map(async (update) => {
                if (update.type === 'js-update') {
                    return queueUpdate(fetchUpdate(update));
                }
                // css-update
                // this is only sent when a css file referenced with <link> is updated
                const { path, timestamp } = update;
                const searchUrl = cleanUrl(path);
                // can't use querySelector with `[href*=]` here since the link may be
                // using relative paths so we need to use link.href to grab the full
                // URL for the include check.
                const el = Array.from(document.querySelectorAll('link')).find((e) => !outdatedLinkTags.has(e) && cleanUrl(e.href).includes(searchUrl));
                if (!el) {
                    return;
                }
                const newPath = `${base}${searchUrl.slice(1)}${searchUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
                // rather than swapping the href on the existing tag, we will
                // create a new link tag. Once the new stylesheet has loaded we
                // will remove the existing link tag. This removes a Flash Of
                // Unstyled Content that can occur when swapping out the tag href
                // directly, as the new stylesheet has not yet been loaded.
                return new Promise((resolve) => {
                    const newLinkTag = el.cloneNode();
                    newLinkTag.href = new URL(newPath, el.href).href;
                    const removeOldEl = () => {
                        el.remove();
                        console.debug(`[vite] css hot updated: ${searchUrl}`);
                        resolve();
                    };
                    newLinkTag.addEventListener('load', removeOldEl);
                    newLinkTag.addEventListener('error', removeOldEl);
                    outdatedLinkTags.add(el);
                    el.after(newLinkTag);
                });
            }));
            notifyListeners('vite:afterUpdate', payload);
            break;
        case 'custom': {
            notifyListeners(payload.event, payload.data);
            break;
        }
        case 'full-reload':
            notifyListeners('vite:beforeFullReload', payload);
            if (payload.path && payload.path.endsWith('.html')) {
                // if html file is edited, only reload the page if the browser is
                // currently on that page.
                const pagePath = decodeURI(location.pathname);
                const payloadPath = base + payload.path.slice(1);
                if (pagePath === payloadPath ||
                    payload.path === '/index.html' ||
                    (pagePath.endsWith('/') && pagePath + 'index.html' === payloadPath)) {
                    location.reload();
                }
                return;
            }
            else {
                location.reload();
            }
            break;
        case 'prune':
            notifyListeners('vite:beforePrune', payload);
            // After an HMR update, some modules are no longer imported on the page
            // but they may have left behind side effects that need to be cleaned up
            // (.e.g style injections)
            // TODO Trigger their dispose callbacks.
            payload.paths.forEach((path) => {
                const fn = pruneMap.get(path);
                if (fn) {
                    fn(dataMap.get(path));
                }
            });
            break;
        case 'error': {
            notifyListeners('vite:error', payload);
            const err = payload.err;
            if (enableOverlay) {
                createErrorOverlay(err);
            }
            else {
                console.error(`[vite] Internal Server Error\n${err.message}\n${err.stack}`);
            }
            break;
        }
        default: {
            const check = payload;
            return check;
        }
    }
}
function notifyListeners(event, data) {
    const cbs = customListenersMap.get(event);
    if (cbs) {
        cbs.forEach((cb) => cb(data));
    }
}
const enableOverlay = true;
function createErrorOverlay(err) {
    if (!enableOverlay)
        return;
    clearErrorOverlay();
    document.body.appendChild(new ErrorOverlay(err));
}
function clearErrorOverlay() {
    document
        .querySelectorAll(overlayId)
        .forEach((n) => n.close());
}
function hasErrorOverlay() {
    return document.querySelectorAll(overlayId).length;
}
let pending = false;
let queued = [];
/**
 * buffer multiple hot updates triggered by the same src change
 * so that they are invoked in the same order they were sent.
 * (otherwise the order may be inconsistent because of the http request round trip)
 */
async function queueUpdate(p) {
    queued.push(p);
    if (!pending) {
        pending = true;
        await Promise.resolve();
        pending = false;
        const loading = [...queued];
        queued = [];
        (await Promise.all(loading)).forEach((fn) => fn && fn());
    }
}
async function waitForSuccessfulPing(socketProtocol, hostAndPath, ms = 1000) {
    const pingHostProtocol = socketProtocol === 'wss' ? 'https' : 'http';
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // A fetch on a websocket URL will return a successful promise with status 400,
            // but will reject a networking error.
            // When running on middleware mode, it returns status 426, and an cors error happens if mode is not no-cors
            await fetch(`${pingHostProtocol}://${hostAndPath}`, {
                mode: 'no-cors'
            });
            break;
        }
        catch (e) {
            // wait ms before attempting to ping again
            await new Promise((resolve) => setTimeout(resolve, ms));
        }
    }
}
const sheetsMap = new Map();
function updateStyle(id, content) {
    let style = sheetsMap.get(id);
    {
        if (style && !(style instanceof HTMLStyleElement)) {
            removeStyle(id);
            style = undefined;
        }
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('type', 'text/css');
            style.setAttribute('data-vite-dev-id', id);
            style.textContent = content;
            document.head.appendChild(style);
        }
        else {
            style.textContent = content;
        }
    }
    sheetsMap.set(id, style);
}
function removeStyle(id) {
    const style = sheetsMap.get(id);
    if (style) {
        if (style instanceof CSSStyleSheet) {
            // @ts-expect-error: using experimental API
            document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== style);
        }
        else {
            document.head.removeChild(style);
        }
        sheetsMap.delete(id);
    }
}
async function fetchUpdate({ path, acceptedPath, timestamp, explicitImportRequired }) {
    const mod = hotModulesMap.get(path);
    if (!mod) {
        // In a code-splitting project,
        // it is common that the hot-updating module is not loaded yet.
        // https://github.com/vitejs/vite/issues/721
        return;
    }
    const moduleMap = new Map();
    const isSelfUpdate = path === acceptedPath;
    // determine the qualified callbacks before we re-import the modules
    const qualifiedCallbacks = mod.callbacks.filter(({ deps }) => deps.includes(acceptedPath));
    if (isSelfUpdate || qualifiedCallbacks.length > 0) {
        const dep = acceptedPath;
        const disposer = disposeMap.get(dep);
        if (disposer)
            await disposer(dataMap.get(dep));
        const [path, query] = dep.split(`?`);
        try {
            const newMod = await import(
            /* @vite-ignore */
            base +
                path.slice(1) +
                `?${explicitImportRequired ? 'import&' : ''}t=${timestamp}${query ? `&${query}` : ''}`);
            moduleMap.set(dep, newMod);
        }
        catch (e) {
            warnFailedFetch(e, dep);
        }
    }
    return () => {
        for (const { deps, fn } of qualifiedCallbacks) {
            fn(deps.map((dep) => moduleMap.get(dep)));
        }
        const loggedPath = isSelfUpdate ? path : `${acceptedPath} via ${path}`;
        console.debug(`[vite] hot updated: ${loggedPath}`);
    };
}
function sendMessageBuffer() {
    if (socket.readyState === 1) {
        messageBuffer.forEach((msg) => socket.send(msg));
        messageBuffer.length = 0;
    }
}
const hotModulesMap = new Map();
const disposeMap = new Map();
const pruneMap = new Map();
const dataMap = new Map();
const customListenersMap = new Map();
const ctxToListenersMap = new Map();
function createHotContext(ownerPath) {
    if (!dataMap.has(ownerPath)) {
        dataMap.set(ownerPath, {});
    }
    // when a file is hot updated, a new context is created
    // clear its stale callbacks
    const mod = hotModulesMap.get(ownerPath);
    if (mod) {
        mod.callbacks = [];
    }
    // clear stale custom event listeners
    const staleListeners = ctxToListenersMap.get(ownerPath);
    if (staleListeners) {
        for (const [event, staleFns] of staleListeners) {
            const listeners = customListenersMap.get(event);
            if (listeners) {
                customListenersMap.set(event, listeners.filter((l) => !staleFns.includes(l)));
            }
        }
    }
    const newListeners = new Map();
    ctxToListenersMap.set(ownerPath, newListeners);
    function acceptDeps(deps, callback = () => { }) {
        const mod = hotModulesMap.get(ownerPath) || {
            id: ownerPath,
            callbacks: []
        };
        mod.callbacks.push({
            deps,
            fn: callback
        });
        hotModulesMap.set(ownerPath, mod);
    }
    const hot = {
        get data() {
            return dataMap.get(ownerPath);
        },
        accept(deps, callback) {
            if (typeof deps === 'function' || !deps) {
                // self-accept: hot.accept(() => {})
                acceptDeps([ownerPath], ([mod]) => deps && deps(mod));
            }
            else if (typeof deps === 'string') {
                // explicit deps
                acceptDeps([deps], ([mod]) => callback && callback(mod));
            }
            else if (Array.isArray(deps)) {
                acceptDeps(deps, callback);
            }
            else {
                throw new Error(`invalid hot.accept() usage.`);
            }
        },
        // export names (first arg) are irrelevant on the client side, they're
        // extracted in the server for propagation
        acceptExports(_, callback) {
            acceptDeps([ownerPath], callback && (([mod]) => callback(mod)));
        },
        dispose(cb) {
            disposeMap.set(ownerPath, cb);
        },
        // @ts-expect-error untyped
        prune(cb) {
            pruneMap.set(ownerPath, cb);
        },
        // TODO
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        decline() { },
        // tell the server to re-perform hmr propagation from this module as root
        invalidate() {
            notifyListeners('vite:invalidate', { path: ownerPath });
            this.send('vite:invalidate', { path: ownerPath });
        },
        // custom events
        on(event, cb) {
            const addToMap = (map) => {
                const existing = map.get(event) || [];
                existing.push(cb);
                map.set(event, existing);
            };
            addToMap(customListenersMap);
            addToMap(newListeners);
        },
        send(event, data) {
            messageBuffer.push(JSON.stringify({ type: 'custom', event, data }));
            sendMessageBuffer();
        }
    };
    return hot;
}
/**
 * urls here are dynamic import() urls that couldn't be statically analyzed
 */
function injectQuery(url, queryToInject) {
    // skip urls that won't be handled by vite
    if (!url.startsWith('.') && !url.startsWith('/')) {
        return url;
    }
    // can't use pathname from URL since it may be relative like ../
    const pathname = url.replace(/#.*$/, '').replace(/\?.*$/, '');
    const { search, hash } = new URL(url, 'http://vitejs.dev');
    return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash || ''}`;
}

export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };
                                   

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50Lm1qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaWVudC9vdmVybGF5LnRzIiwiLi4vLi4vc3JjL2NsaWVudC9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFcnJvclBheWxvYWQgfSBmcm9tICd0eXBlcy9obXJQYXlsb2FkJ1xuXG4vLyBzZXQgOmhvc3Qgc3R5bGVzIHRvIG1ha2UgcGxheXdyaWdodCBkZXRlY3QgdGhlIGVsZW1lbnQgYXMgdmlzaWJsZVxuY29uc3QgdGVtcGxhdGUgPSAvKmh0bWwqLyBgXG48c3R5bGU+XG46aG9zdCB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICB6LWluZGV4OiA5OTk5OTtcbiAgLS1tb25vc3BhY2U6ICdTRk1vbm8tUmVndWxhcicsIENvbnNvbGFzLFxuICAnTGliZXJhdGlvbiBNb25vJywgTWVubG8sIENvdXJpZXIsIG1vbm9zcGFjZTtcbiAgLS1yZWQ6ICNmZjU1NTU7XG4gIC0teWVsbG93OiAjZTJhYTUzO1xuICAtLXB1cnBsZTogI2NmYTRmZjtcbiAgLS1jeWFuOiAjMmRkOWRhO1xuICAtLWRpbTogI2M5YzljOTtcblxuICAtLXdpbmRvdy1iYWNrZ3JvdW5kOiAjMTgxODE4O1xuICAtLXdpbmRvdy1jb2xvcjogI2Q4ZDhkODtcbn1cblxuLmJhY2tkcm9wIHtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiA5OTk5OTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBvdmVyZmxvdy15OiBzY3JvbGw7XG4gIG1hcmdpbjogMDtcbiAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjY2KTtcbn1cblxuLndpbmRvdyB7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vc3BhY2UpO1xuICBsaW5lLWhlaWdodDogMS41O1xuICB3aWR0aDogODAwcHg7XG4gIGNvbG9yOiB2YXIoLS13aW5kb3ctY29sb3IpO1xuICBtYXJnaW46IDMwcHggYXV0bztcbiAgcGFkZGluZzogMjVweCA0MHB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpbmRvdy1iYWNrZ3JvdW5kKTtcbiAgYm9yZGVyLXJhZGl1czogNnB4IDZweCA4cHggOHB4O1xuICBib3gtc2hhZG93OiAwIDE5cHggMzhweCByZ2JhKDAsMCwwLDAuMzApLCAwIDE1cHggMTJweCByZ2JhKDAsMCwwLDAuMjIpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBib3JkZXItdG9wOiA4cHggc29saWQgdmFyKC0tcmVkKTtcbiAgZGlyZWN0aW9uOiBsdHI7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG59XG5cbnByZSB7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1tb25vc3BhY2UpO1xuICBmb250LXNpemU6IDE2cHg7XG4gIG1hcmdpbi10b3A6IDA7XG4gIG1hcmdpbi1ib3R0b206IDFlbTtcbiAgb3ZlcmZsb3cteDogc2Nyb2xsO1xuICBzY3JvbGxiYXItd2lkdGg6IG5vbmU7XG59XG5cbnByZTo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICBkaXNwbGF5OiBub25lO1xufVxuXG4ubWVzc2FnZSB7XG4gIGxpbmUtaGVpZ2h0OiAxLjM7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcbn1cblxuLm1lc3NhZ2UtYm9keSB7XG4gIGNvbG9yOiB2YXIoLS1yZWQpO1xufVxuXG4ucGx1Z2luIHtcbiAgY29sb3I6IHZhcigtLXB1cnBsZSk7XG59XG5cbi5maWxlIHtcbiAgY29sb3I6IHZhcigtLWN5YW4pO1xuICBtYXJnaW4tYm90dG9tOiAwO1xuICB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7XG4gIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcbn1cblxuLmZyYW1lIHtcbiAgY29sb3I6IHZhcigtLXllbGxvdyk7XG59XG5cbi5zdGFjayB7XG4gIGZvbnQtc2l6ZTogMTNweDtcbiAgY29sb3I6IHZhcigtLWRpbSk7XG59XG5cbi50aXAge1xuICBmb250LXNpemU6IDEzcHg7XG4gIGNvbG9yOiAjOTk5O1xuICBib3JkZXItdG9wOiAxcHggZG90dGVkICM5OTk7XG4gIHBhZGRpbmctdG9wOiAxM3B4O1xufVxuXG5jb2RlIHtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBmb250LWZhbWlseTogdmFyKC0tbW9ub3NwYWNlKTtcbiAgY29sb3I6IHZhcigtLXllbGxvdyk7XG59XG5cbi5maWxlLWxpbmsge1xuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuPC9zdHlsZT5cbjxkaXYgY2xhc3M9XCJiYWNrZHJvcFwiIHBhcnQ9XCJiYWNrZHJvcFwiPlxuICA8ZGl2IGNsYXNzPVwid2luZG93XCIgcGFydD1cIndpbmRvd1wiPlxuICAgIDxwcmUgY2xhc3M9XCJtZXNzYWdlXCIgcGFydD1cIm1lc3NhZ2VcIj48c3BhbiBjbGFzcz1cInBsdWdpblwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cIm1lc3NhZ2UtYm9keVwiPjwvc3Bhbj48L3ByZT5cbiAgICA8cHJlIGNsYXNzPVwiZmlsZVwiIHBhcnQ9XCJmaWxlXCI+PC9wcmU+XG4gICAgPHByZSBjbGFzcz1cImZyYW1lXCIgcGFydD1cImZyYW1lXCI+PC9wcmU+XG4gICAgPHByZSBjbGFzcz1cInN0YWNrXCIgcGFydD1cInN0YWNrXCI+PC9wcmU+XG4gICAgPGRpdiBjbGFzcz1cInRpcFwiIHBhcnQ9XCJ0aXBcIj5cbiAgICAgIENsaWNrIG91dHNpZGUgb3IgZml4IHRoZSBjb2RlIHRvIGRpc21pc3MuPGJyPlxuICAgICAgWW91IGNhbiBhbHNvIGRpc2FibGUgdGhpcyBvdmVybGF5IGJ5IHNldHRpbmdcbiAgICAgIDxjb2RlPnNlcnZlci5obXIub3ZlcmxheTwvY29kZT4gdG8gPGNvZGU+ZmFsc2U8L2NvZGU+IGluIDxjb2RlPnZpdGUuY29uZmlnLmpzLjwvY29kZT5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG48L2Rpdj5cbmBcblxuY29uc3QgZmlsZVJFID0gLyg/OlthLXpBLVpdOlxcXFx8XFwvKS4qPzpcXGQrOlxcZCsvZ1xuY29uc3QgY29kZWZyYW1lUkUgPSAvXig/Oj4/XFxzK1xcZCtcXHMrXFx8Lip8XFxzK1xcfFxccypcXF4uKilcXHI/XFxuL2dtXG5cbi8vIEFsbG93IGBFcnJvck92ZXJsYXlgIHRvIGV4dGVuZCBgSFRNTEVsZW1lbnRgIGV2ZW4gaW4gZW52aXJvbm1lbnRzIHdoZXJlXG4vLyBgSFRNTEVsZW1lbnRgIHdhcyBub3Qgb3JpZ2luYWxseSBkZWZpbmVkLlxuY29uc3QgeyBIVE1MRWxlbWVudCA9IGNsYXNzIHt9IGFzIHR5cGVvZiBnbG9iYWxUaGlzLkhUTUxFbGVtZW50IH0gPSBnbG9iYWxUaGlzXG5leHBvcnQgY2xhc3MgRXJyb3JPdmVybGF5IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICByb290OiBTaGFkb3dSb290XG5cbiAgY29uc3RydWN0b3IoZXJyOiBFcnJvclBheWxvYWRbJ2VyciddLCBsaW5rcyA9IHRydWUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5yb290ID0gdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiAnb3BlbicgfSlcbiAgICB0aGlzLnJvb3QuaW5uZXJIVE1MID0gdGVtcGxhdGVcblxuICAgIGNvZGVmcmFtZVJFLmxhc3RJbmRleCA9IDBcbiAgICBjb25zdCBoYXNGcmFtZSA9IGVyci5mcmFtZSAmJiBjb2RlZnJhbWVSRS50ZXN0KGVyci5mcmFtZSlcbiAgICBjb25zdCBtZXNzYWdlID0gaGFzRnJhbWVcbiAgICAgID8gZXJyLm1lc3NhZ2UucmVwbGFjZShjb2RlZnJhbWVSRSwgJycpXG4gICAgICA6IGVyci5tZXNzYWdlXG4gICAgaWYgKGVyci5wbHVnaW4pIHtcbiAgICAgIHRoaXMudGV4dCgnLnBsdWdpbicsIGBbcGx1Z2luOiR7ZXJyLnBsdWdpbn1dIGApXG4gICAgfVxuICAgIHRoaXMudGV4dCgnLm1lc3NhZ2UtYm9keScsIG1lc3NhZ2UudHJpbSgpKVxuXG4gICAgY29uc3QgW2ZpbGVdID0gKGVyci5sb2M/LmZpbGUgfHwgZXJyLmlkIHx8ICd1bmtub3duIGZpbGUnKS5zcGxpdChgP2ApXG4gICAgaWYgKGVyci5sb2MpIHtcbiAgICAgIHRoaXMudGV4dCgnLmZpbGUnLCBgJHtmaWxlfToke2Vyci5sb2MubGluZX06JHtlcnIubG9jLmNvbHVtbn1gLCBsaW5rcylcbiAgICB9IGVsc2UgaWYgKGVyci5pZCkge1xuICAgICAgdGhpcy50ZXh0KCcuZmlsZScsIGZpbGUpXG4gICAgfVxuXG4gICAgaWYgKGhhc0ZyYW1lKSB7XG4gICAgICB0aGlzLnRleHQoJy5mcmFtZScsIGVyci5mcmFtZSEudHJpbSgpKVxuICAgIH1cbiAgICB0aGlzLnRleHQoJy5zdGFjaycsIGVyci5zdGFjaywgbGlua3MpXG5cbiAgICB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcignLndpbmRvdycpIS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5jbG9zZSgpXG4gICAgfSlcbiAgfVxuXG4gIHRleHQoc2VsZWN0b3I6IHN0cmluZywgdGV4dDogc3RyaW5nLCBsaW5rRmlsZXMgPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIVxuICAgIGlmICghbGlua0ZpbGVzKSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IHRleHRcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGN1ckluZGV4ID0gMFxuICAgICAgbGV0IG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsXG4gICAgICBmaWxlUkUubGFzdEluZGV4ID0gMFxuICAgICAgd2hpbGUgKChtYXRjaCA9IGZpbGVSRS5leGVjKHRleHQpKSkge1xuICAgICAgICBjb25zdCB7IDA6IGZpbGUsIGluZGV4IH0gPSBtYXRjaFxuICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnN0IGZyYWcgPSB0ZXh0LnNsaWNlKGN1ckluZGV4LCBpbmRleClcbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShmcmFnKSlcbiAgICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICAgICAgbGluay50ZXh0Q29udGVudCA9IGZpbGVcbiAgICAgICAgICBsaW5rLmNsYXNzTmFtZSA9ICdmaWxlLWxpbmsnXG4gICAgICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgZmV0Y2goJy9fX29wZW4taW4tZWRpdG9yP2ZpbGU9JyArIGVuY29kZVVSSUNvbXBvbmVudChmaWxlKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQobGluaylcbiAgICAgICAgICBjdXJJbmRleCArPSBmcmFnLmxlbmd0aCArIGZpbGUubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnBhcmVudE5vZGU/LnJlbW92ZUNoaWxkKHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IG92ZXJsYXlJZCA9ICd2aXRlLWVycm9yLW92ZXJsYXknXG5jb25zdCB7IGN1c3RvbUVsZW1lbnRzIH0gPSBnbG9iYWxUaGlzIC8vIEVuc3VyZSBgY3VzdG9tRWxlbWVudHNgIGlzIGRlZmluZWQgYmVmb3JlIHRoZSBuZXh0IGxpbmUuXG5pZiAoY3VzdG9tRWxlbWVudHMgJiYgIWN1c3RvbUVsZW1lbnRzLmdldChvdmVybGF5SWQpKSB7XG4gIGN1c3RvbUVsZW1lbnRzLmRlZmluZShvdmVybGF5SWQsIEVycm9yT3ZlcmxheSlcbn1cbiIsImltcG9ydCB0eXBlIHsgRXJyb3JQYXlsb2FkLCBITVJQYXlsb2FkLCBVcGRhdGUgfSBmcm9tICd0eXBlcy9obXJQYXlsb2FkJ1xuaW1wb3J0IHR5cGUgeyBNb2R1bGVOYW1lc3BhY2UsIFZpdGVIb3RDb250ZXh0IH0gZnJvbSAndHlwZXMvaG90J1xuaW1wb3J0IHR5cGUgeyBJbmZlckN1c3RvbUV2ZW50UGF5bG9hZCB9IGZyb20gJ3R5cGVzL2N1c3RvbUV2ZW50J1xuaW1wb3J0IHsgRXJyb3JPdmVybGF5LCBvdmVybGF5SWQgfSBmcm9tICcuL292ZXJsYXknXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm9kZS9uby1taXNzaW5nLWltcG9ydFxuaW1wb3J0ICdAdml0ZS9lbnYnXG5cbi8vIGluamVjdGVkIGJ5IHRoZSBobXIgcGx1Z2luIHdoZW4gc2VydmVkXG5kZWNsYXJlIGNvbnN0IF9fQkFTRV9fOiBzdHJpbmdcbmRlY2xhcmUgY29uc3QgX19TRVJWRVJfSE9TVF9fOiBzdHJpbmdcbmRlY2xhcmUgY29uc3QgX19ITVJfUFJPVE9DT0xfXzogc3RyaW5nIHwgbnVsbFxuZGVjbGFyZSBjb25zdCBfX0hNUl9IT1NUTkFNRV9fOiBzdHJpbmcgfCBudWxsXG5kZWNsYXJlIGNvbnN0IF9fSE1SX1BPUlRfXzogbnVtYmVyIHwgbnVsbFxuZGVjbGFyZSBjb25zdCBfX0hNUl9ESVJFQ1RfVEFSR0VUX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9CQVNFX186IHN0cmluZ1xuZGVjbGFyZSBjb25zdCBfX0hNUl9USU1FT1VUX186IG51bWJlclxuZGVjbGFyZSBjb25zdCBfX0hNUl9FTkFCTEVfT1ZFUkxBWV9fOiBib29sZWFuXG5cbmNvbnNvbGUuZGVidWcoJ1t2aXRlXSBjb25uZWN0aW5nLi4uJylcblxuY29uc3QgaW1wb3J0TWV0YVVybCA9IG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKVxuXG4vLyB1c2Ugc2VydmVyIGNvbmZpZ3VyYXRpb24sIHRoZW4gZmFsbGJhY2sgdG8gaW5mZXJlbmNlXG5jb25zdCBzZXJ2ZXJIb3N0ID0gX19TRVJWRVJfSE9TVF9fXG5jb25zdCBzb2NrZXRQcm90b2NvbCA9XG4gIF9fSE1SX1BST1RPQ09MX18gfHwgKGxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyA/ICd3c3MnIDogJ3dzJylcbmNvbnN0IGhtclBvcnQgPSBfX0hNUl9QT1JUX19cbmNvbnN0IHNvY2tldEhvc3QgPSBgJHtfX0hNUl9IT1NUTkFNRV9fIHx8IGltcG9ydE1ldGFVcmwuaG9zdG5hbWV9OiR7XG4gIGhtclBvcnQgfHwgaW1wb3J0TWV0YVVybC5wb3J0XG59JHtfX0hNUl9CQVNFX199YFxuY29uc3QgZGlyZWN0U29ja2V0SG9zdCA9IF9fSE1SX0RJUkVDVF9UQVJHRVRfX1xuY29uc3QgYmFzZSA9IF9fQkFTRV9fIHx8ICcvJ1xuY29uc3QgbWVzc2FnZUJ1ZmZlcjogc3RyaW5nW10gPSBbXVxuXG5sZXQgc29ja2V0OiBXZWJTb2NrZXRcbnRyeSB7XG4gIGxldCBmYWxsYmFjazogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkXG4gIC8vIG9ubHkgdXNlIGZhbGxiYWNrIHdoZW4gcG9ydCBpcyBpbmZlcnJlZCB0byBwcmV2ZW50IGNvbmZ1c2lvblxuICBpZiAoIWhtclBvcnQpIHtcbiAgICBmYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIC8vIGZhbGxiYWNrIHRvIGNvbm5lY3RpbmcgZGlyZWN0bHkgdG8gdGhlIGhtciBzZXJ2ZXJcbiAgICAgIC8vIGZvciBzZXJ2ZXJzIHdoaWNoIGRvZXMgbm90IHN1cHBvcnQgcHJveHlpbmcgd2Vic29ja2V0XG4gICAgICBzb2NrZXQgPSBzZXR1cFdlYlNvY2tldChzb2NrZXRQcm90b2NvbCwgZGlyZWN0U29ja2V0SG9zdCwgKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50U2NyaXB0SG9zdFVSTCA9IG5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgICBjb25zdCBjdXJyZW50U2NyaXB0SG9zdCA9XG4gICAgICAgICAgY3VycmVudFNjcmlwdEhvc3RVUkwuaG9zdCArXG4gICAgICAgICAgY3VycmVudFNjcmlwdEhvc3RVUkwucGF0aG5hbWUucmVwbGFjZSgvQHZpdGVcXC9jbGllbnQkLywgJycpXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgJ1t2aXRlXSBmYWlsZWQgdG8gY29ubmVjdCB0byB3ZWJzb2NrZXQuXFxuJyArXG4gICAgICAgICAgICAneW91ciBjdXJyZW50IHNldHVwOlxcbicgK1xuICAgICAgICAgICAgYCAgKGJyb3dzZXIpICR7Y3VycmVudFNjcmlwdEhvc3R9IDwtLVtIVFRQXS0tPiAke3NlcnZlckhvc3R9IChzZXJ2ZXIpXFxuYCArXG4gICAgICAgICAgICBgICAoYnJvd3NlcikgJHtzb2NrZXRIb3N0fSA8LS1bV2ViU29ja2V0IChmYWlsaW5nKV0tLT4gJHtkaXJlY3RTb2NrZXRIb3N0fSAoc2VydmVyKVxcbmAgK1xuICAgICAgICAgICAgJ0NoZWNrIG91dCB5b3VyIFZpdGUgLyBuZXR3b3JrIGNvbmZpZ3VyYXRpb24gYW5kIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvc2VydmVyLW9wdGlvbnMuaHRtbCNzZXJ2ZXItaG1yIC4nXG4gICAgICAgIClcbiAgICAgIH0pXG4gICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ29wZW4nLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgJ1t2aXRlXSBEaXJlY3Qgd2Vic29ja2V0IGNvbm5lY3Rpb24gZmFsbGJhY2suIENoZWNrIG91dCBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL3NlcnZlci1vcHRpb25zLmh0bWwjc2VydmVyLWhtciB0byByZW1vdmUgdGhlIHByZXZpb3VzIGNvbm5lY3Rpb24gZXJyb3IuJ1xuICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgeyBvbmNlOiB0cnVlIH1cbiAgICAgIClcbiAgICB9XG4gIH1cblxuICBzb2NrZXQgPSBzZXR1cFdlYlNvY2tldChzb2NrZXRQcm90b2NvbCwgc29ja2V0SG9zdCwgZmFsbGJhY2spXG59IGNhdGNoIChlcnJvcikge1xuICBjb25zb2xlLmVycm9yKGBbdml0ZV0gZmFpbGVkIHRvIGNvbm5lY3QgdG8gd2Vic29ja2V0ICgke2Vycm9yfSkuIGApXG59XG5cbmZ1bmN0aW9uIHNldHVwV2ViU29ja2V0KFxuICBwcm90b2NvbDogc3RyaW5nLFxuICBob3N0QW5kUGF0aDogc3RyaW5nLFxuICBvbkNsb3NlV2l0aG91dE9wZW4/OiAoKSA9PiB2b2lkXG4pIHtcbiAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgJHtwcm90b2NvbH06Ly8ke2hvc3RBbmRQYXRofWAsICd2aXRlLWhtcicpXG4gIGxldCBpc09wZW5lZCA9IGZhbHNlXG5cbiAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgJ29wZW4nLFxuICAgICgpID0+IHtcbiAgICAgIGlzT3BlbmVkID0gdHJ1ZVxuICAgIH0sXG4gICAgeyBvbmNlOiB0cnVlIH1cbiAgKVxuXG4gIC8vIExpc3RlbiBmb3IgbWVzc2FnZXNcbiAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBhc3luYyAoeyBkYXRhIH0pID0+IHtcbiAgICBoYW5kbGVNZXNzYWdlKEpTT04ucGFyc2UoZGF0YSkpXG4gIH0pXG5cbiAgLy8gcGluZyBzZXJ2ZXJcbiAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgYXN5bmMgKHsgd2FzQ2xlYW4gfSkgPT4ge1xuICAgIGlmICh3YXNDbGVhbikgcmV0dXJuXG5cbiAgICBpZiAoIWlzT3BlbmVkICYmIG9uQ2xvc2VXaXRob3V0T3Blbikge1xuICAgICAgb25DbG9zZVdpdGhvdXRPcGVuKClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGBbdml0ZV0gc2VydmVyIGNvbm5lY3Rpb24gbG9zdC4gcG9sbGluZyBmb3IgcmVzdGFydC4uLmApXG4gICAgYXdhaXQgd2FpdEZvclN1Y2Nlc3NmdWxQaW5nKHByb3RvY29sLCBob3N0QW5kUGF0aClcbiAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICB9KVxuXG4gIHJldHVybiBzb2NrZXRcbn1cblxuZnVuY3Rpb24gd2FybkZhaWxlZEZldGNoKGVycjogRXJyb3IsIHBhdGg6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gIGlmICghZXJyLm1lc3NhZ2UubWF0Y2goJ2ZldGNoJykpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycilcbiAgfVxuICBjb25zb2xlLmVycm9yKFxuICAgIGBbaG1yXSBGYWlsZWQgdG8gcmVsb2FkICR7cGF0aH0uIGAgK1xuICAgICAgYFRoaXMgY291bGQgYmUgZHVlIHRvIHN5bnRheCBlcnJvcnMgb3IgaW1wb3J0aW5nIG5vbi1leGlzdGVudCBgICtcbiAgICAgIGBtb2R1bGVzLiAoc2VlIGVycm9ycyBhYm92ZSlgXG4gIClcbn1cblxuZnVuY3Rpb24gY2xlYW5VcmwocGF0aG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwocGF0aG5hbWUsIGxvY2F0aW9uLnRvU3RyaW5nKCkpXG4gIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKCdkaXJlY3QnKVxuICByZXR1cm4gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaFxufVxuXG5sZXQgaXNGaXJzdFVwZGF0ZSA9IHRydWVcbmNvbnN0IG91dGRhdGVkTGlua1RhZ3MgPSBuZXcgV2Vha1NldDxIVE1MTGlua0VsZW1lbnQ+KClcblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShwYXlsb2FkOiBITVJQYXlsb2FkKSB7XG4gIHN3aXRjaCAocGF5bG9hZC50eXBlKSB7XG4gICAgY2FzZSAnY29ubmVjdGVkJzpcbiAgICAgIGNvbnNvbGUuZGVidWcoYFt2aXRlXSBjb25uZWN0ZWQuYClcbiAgICAgIHNlbmRNZXNzYWdlQnVmZmVyKClcbiAgICAgIC8vIHByb3h5KG5naW54LCBkb2NrZXIpIGhtciB3cyBtYXliZSBjYXVzZWQgdGltZW91dCxcbiAgICAgIC8vIHNvIHNlbmQgcGluZyBwYWNrYWdlIGxldCB3cyBrZWVwIGFsaXZlLlxuICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAoc29ja2V0LnJlYWR5U3RhdGUgPT09IHNvY2tldC5PUEVOKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3tcInR5cGVcIjpcInBpbmdcIn0nKVxuICAgICAgICB9XG4gICAgICB9LCBfX0hNUl9USU1FT1VUX18pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YmVmb3JlVXBkYXRlJywgcGF5bG9hZClcbiAgICAgIC8vIGlmIHRoaXMgaXMgdGhlIGZpcnN0IHVwZGF0ZSBhbmQgdGhlcmUncyBhbHJlYWR5IGFuIGVycm9yIG92ZXJsYXksIGl0XG4gICAgICAvLyBtZWFucyB0aGUgcGFnZSBvcGVuZWQgd2l0aCBleGlzdGluZyBzZXJ2ZXIgY29tcGlsZSBlcnJvciBhbmQgdGhlIHdob2xlXG4gICAgICAvLyBtb2R1bGUgc2NyaXB0IGZhaWxlZCB0byBsb2FkIChzaW5jZSBvbmUgb2YgdGhlIG5lc3RlZCBpbXBvcnRzIGlzIDUwMCkuXG4gICAgICAvLyBpbiB0aGlzIGNhc2UgYSBub3JtYWwgdXBkYXRlIHdvbid0IHdvcmsgYW5kIGEgZnVsbCByZWxvYWQgaXMgbmVlZGVkLlxuICAgICAgaWYgKGlzRmlyc3RVcGRhdGUgJiYgaGFzRXJyb3JPdmVybGF5KCkpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJFcnJvck92ZXJsYXkoKVxuICAgICAgICBpc0ZpcnN0VXBkYXRlID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBwYXlsb2FkLnVwZGF0ZXMubWFwKGFzeW5jICh1cGRhdGUpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICBpZiAodXBkYXRlLnR5cGUgPT09ICdqcy11cGRhdGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gcXVldWVVcGRhdGUoZmV0Y2hVcGRhdGUodXBkYXRlKSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjc3MtdXBkYXRlXG4gICAgICAgICAgLy8gdGhpcyBpcyBvbmx5IHNlbnQgd2hlbiBhIGNzcyBmaWxlIHJlZmVyZW5jZWQgd2l0aCA8bGluaz4gaXMgdXBkYXRlZFxuICAgICAgICAgIGNvbnN0IHsgcGF0aCwgdGltZXN0YW1wIH0gPSB1cGRhdGVcbiAgICAgICAgICBjb25zdCBzZWFyY2hVcmwgPSBjbGVhblVybChwYXRoKVxuICAgICAgICAgIC8vIGNhbid0IHVzZSBxdWVyeVNlbGVjdG9yIHdpdGggYFtocmVmKj1dYCBoZXJlIHNpbmNlIHRoZSBsaW5rIG1heSBiZVxuICAgICAgICAgIC8vIHVzaW5nIHJlbGF0aXZlIHBhdGhzIHNvIHdlIG5lZWQgdG8gdXNlIGxpbmsuaHJlZiB0byBncmFiIHRoZSBmdWxsXG4gICAgICAgICAgLy8gVVJMIGZvciB0aGUgaW5jbHVkZSBjaGVjay5cbiAgICAgICAgICBjb25zdCBlbCA9IEFycmF5LmZyb20oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxMaW5rRWxlbWVudD4oJ2xpbmsnKVxuICAgICAgICAgICkuZmluZChcbiAgICAgICAgICAgIChlKSA9PlxuICAgICAgICAgICAgICAhb3V0ZGF0ZWRMaW5rVGFncy5oYXMoZSkgJiYgY2xlYW5VcmwoZS5ocmVmKS5pbmNsdWRlcyhzZWFyY2hVcmwpXG4gICAgICAgICAgKVxuXG4gICAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgbmV3UGF0aCA9IGAke2Jhc2V9JHtzZWFyY2hVcmwuc2xpY2UoMSl9JHtcbiAgICAgICAgICAgIHNlYXJjaFVybC5pbmNsdWRlcygnPycpID8gJyYnIDogJz8nXG4gICAgICAgICAgfXQ9JHt0aW1lc3RhbXB9YFxuXG4gICAgICAgICAgLy8gcmF0aGVyIHRoYW4gc3dhcHBpbmcgdGhlIGhyZWYgb24gdGhlIGV4aXN0aW5nIHRhZywgd2Ugd2lsbFxuICAgICAgICAgIC8vIGNyZWF0ZSBhIG5ldyBsaW5rIHRhZy4gT25jZSB0aGUgbmV3IHN0eWxlc2hlZXQgaGFzIGxvYWRlZCB3ZVxuICAgICAgICAgIC8vIHdpbGwgcmVtb3ZlIHRoZSBleGlzdGluZyBsaW5rIHRhZy4gVGhpcyByZW1vdmVzIGEgRmxhc2ggT2ZcbiAgICAgICAgICAvLyBVbnN0eWxlZCBDb250ZW50IHRoYXQgY2FuIG9jY3VyIHdoZW4gc3dhcHBpbmcgb3V0IHRoZSB0YWcgaHJlZlxuICAgICAgICAgIC8vIGRpcmVjdGx5LCBhcyB0aGUgbmV3IHN0eWxlc2hlZXQgaGFzIG5vdCB5ZXQgYmVlbiBsb2FkZWQuXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdMaW5rVGFnID0gZWwuY2xvbmVOb2RlKCkgYXMgSFRNTExpbmtFbGVtZW50XG4gICAgICAgICAgICBuZXdMaW5rVGFnLmhyZWYgPSBuZXcgVVJMKG5ld1BhdGgsIGVsLmhyZWYpLmhyZWZcbiAgICAgICAgICAgIGNvbnN0IHJlbW92ZU9sZEVsID0gKCkgPT4ge1xuICAgICAgICAgICAgICBlbC5yZW1vdmUoKVxuICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBbdml0ZV0gY3NzIGhvdCB1cGRhdGVkOiAke3NlYXJjaFVybH1gKVxuICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld0xpbmtUYWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlbW92ZU9sZEVsKVxuICAgICAgICAgICAgbmV3TGlua1RhZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlbW92ZU9sZEVsKVxuICAgICAgICAgICAgb3V0ZGF0ZWRMaW5rVGFncy5hZGQoZWwpXG4gICAgICAgICAgICBlbC5hZnRlcihuZXdMaW5rVGFnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6YWZ0ZXJVcGRhdGUnLCBwYXlsb2FkKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdjdXN0b20nOiB7XG4gICAgICBub3RpZnlMaXN0ZW5lcnMocGF5bG9hZC5ldmVudCwgcGF5bG9hZC5kYXRhKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgY2FzZSAnZnVsbC1yZWxvYWQnOlxuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmJlZm9yZUZ1bGxSZWxvYWQnLCBwYXlsb2FkKVxuICAgICAgaWYgKHBheWxvYWQucGF0aCAmJiBwYXlsb2FkLnBhdGguZW5kc1dpdGgoJy5odG1sJykpIHtcbiAgICAgICAgLy8gaWYgaHRtbCBmaWxlIGlzIGVkaXRlZCwgb25seSByZWxvYWQgdGhlIHBhZ2UgaWYgdGhlIGJyb3dzZXIgaXNcbiAgICAgICAgLy8gY3VycmVudGx5IG9uIHRoYXQgcGFnZS5cbiAgICAgICAgY29uc3QgcGFnZVBhdGggPSBkZWNvZGVVUkkobG9jYXRpb24ucGF0aG5hbWUpXG4gICAgICAgIGNvbnN0IHBheWxvYWRQYXRoID0gYmFzZSArIHBheWxvYWQucGF0aC5zbGljZSgxKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgcGFnZVBhdGggPT09IHBheWxvYWRQYXRoIHx8XG4gICAgICAgICAgcGF5bG9hZC5wYXRoID09PSAnL2luZGV4Lmh0bWwnIHx8XG4gICAgICAgICAgKHBhZ2VQYXRoLmVuZHNXaXRoKCcvJykgJiYgcGFnZVBhdGggKyAnaW5kZXguaHRtbCcgPT09IHBheWxvYWRQYXRoKVxuICAgICAgICApIHtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncHJ1bmUnOlxuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmJlZm9yZVBydW5lJywgcGF5bG9hZClcbiAgICAgIC8vIEFmdGVyIGFuIEhNUiB1cGRhdGUsIHNvbWUgbW9kdWxlcyBhcmUgbm8gbG9uZ2VyIGltcG9ydGVkIG9uIHRoZSBwYWdlXG4gICAgICAvLyBidXQgdGhleSBtYXkgaGF2ZSBsZWZ0IGJlaGluZCBzaWRlIGVmZmVjdHMgdGhhdCBuZWVkIHRvIGJlIGNsZWFuZWQgdXBcbiAgICAgIC8vICguZS5nIHN0eWxlIGluamVjdGlvbnMpXG4gICAgICAvLyBUT0RPIFRyaWdnZXIgdGhlaXIgZGlzcG9zZSBjYWxsYmFja3MuXG4gICAgICBwYXlsb2FkLnBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcbiAgICAgICAgY29uc3QgZm4gPSBwcnVuZU1hcC5nZXQocGF0aClcbiAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgZm4oZGF0YU1hcC5nZXQocGF0aCkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Vycm9yJzoge1xuICAgICAgbm90aWZ5TGlzdGVuZXJzKCd2aXRlOmVycm9yJywgcGF5bG9hZClcbiAgICAgIGNvbnN0IGVyciA9IHBheWxvYWQuZXJyXG4gICAgICBpZiAoZW5hYmxlT3ZlcmxheSkge1xuICAgICAgICBjcmVhdGVFcnJvck92ZXJsYXkoZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgW3ZpdGVdIEludGVybmFsIFNlcnZlciBFcnJvclxcbiR7ZXJyLm1lc3NhZ2V9XFxuJHtlcnIuc3RhY2t9YFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBicmVha1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICBjb25zdCBjaGVjazogbmV2ZXIgPSBwYXlsb2FkXG4gICAgICByZXR1cm4gY2hlY2tcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aWZ5TGlzdGVuZXJzPFQgZXh0ZW5kcyBzdHJpbmc+KFxuICBldmVudDogVCxcbiAgZGF0YTogSW5mZXJDdXN0b21FdmVudFBheWxvYWQ8VD5cbik6IHZvaWRcbmZ1bmN0aW9uIG5vdGlmeUxpc3RlbmVycyhldmVudDogc3RyaW5nLCBkYXRhOiBhbnkpOiB2b2lkIHtcbiAgY29uc3QgY2JzID0gY3VzdG9tTGlzdGVuZXJzTWFwLmdldChldmVudClcbiAgaWYgKGNicykge1xuICAgIGNicy5mb3JFYWNoKChjYikgPT4gY2IoZGF0YSkpXG4gIH1cbn1cblxuY29uc3QgZW5hYmxlT3ZlcmxheSA9IF9fSE1SX0VOQUJMRV9PVkVSTEFZX19cblxuZnVuY3Rpb24gY3JlYXRlRXJyb3JPdmVybGF5KGVycjogRXJyb3JQYXlsb2FkWydlcnInXSkge1xuICBpZiAoIWVuYWJsZU92ZXJsYXkpIHJldHVyblxuICBjbGVhckVycm9yT3ZlcmxheSgpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobmV3IEVycm9yT3ZlcmxheShlcnIpKVxufVxuXG5mdW5jdGlvbiBjbGVhckVycm9yT3ZlcmxheSgpIHtcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvckFsbChvdmVybGF5SWQpXG4gICAgLmZvckVhY2goKG4pID0+IChuIGFzIEVycm9yT3ZlcmxheSkuY2xvc2UoKSlcbn1cblxuZnVuY3Rpb24gaGFzRXJyb3JPdmVybGF5KCkge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChvdmVybGF5SWQpLmxlbmd0aFxufVxuXG5sZXQgcGVuZGluZyA9IGZhbHNlXG5sZXQgcXVldWVkOiBQcm9taXNlPCgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZD5bXSA9IFtdXG5cbi8qKlxuICogYnVmZmVyIG11bHRpcGxlIGhvdCB1cGRhdGVzIHRyaWdnZXJlZCBieSB0aGUgc2FtZSBzcmMgY2hhbmdlXG4gKiBzbyB0aGF0IHRoZXkgYXJlIGludm9rZWQgaW4gdGhlIHNhbWUgb3JkZXIgdGhleSB3ZXJlIHNlbnQuXG4gKiAob3RoZXJ3aXNlIHRoZSBvcmRlciBtYXkgYmUgaW5jb25zaXN0ZW50IGJlY2F1c2Ugb2YgdGhlIGh0dHAgcmVxdWVzdCByb3VuZCB0cmlwKVxuICovXG5hc3luYyBmdW5jdGlvbiBxdWV1ZVVwZGF0ZShwOiBQcm9taXNlPCgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZD4pIHtcbiAgcXVldWVkLnB1c2gocClcbiAgaWYgKCFwZW5kaW5nKSB7XG4gICAgcGVuZGluZyA9IHRydWVcbiAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoKVxuICAgIHBlbmRpbmcgPSBmYWxzZVxuICAgIGNvbnN0IGxvYWRpbmcgPSBbLi4ucXVldWVkXVxuICAgIHF1ZXVlZCA9IFtdXG4gICAgOyhhd2FpdCBQcm9taXNlLmFsbChsb2FkaW5nKSkuZm9yRWFjaCgoZm4pID0+IGZuICYmIGZuKCkpXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gd2FpdEZvclN1Y2Nlc3NmdWxQaW5nKFxuICBzb2NrZXRQcm90b2NvbDogc3RyaW5nLFxuICBob3N0QW5kUGF0aDogc3RyaW5nLFxuICBtcyA9IDEwMDBcbikge1xuICBjb25zdCBwaW5nSG9zdFByb3RvY29sID0gc29ja2V0UHJvdG9jb2wgPT09ICd3c3MnID8gJ2h0dHBzJyA6ICdodHRwJ1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgLy8gQSBmZXRjaCBvbiBhIHdlYnNvY2tldCBVUkwgd2lsbCByZXR1cm4gYSBzdWNjZXNzZnVsIHByb21pc2Ugd2l0aCBzdGF0dXMgNDAwLFxuICAgICAgLy8gYnV0IHdpbGwgcmVqZWN0IGEgbmV0d29ya2luZyBlcnJvci5cbiAgICAgIC8vIFdoZW4gcnVubmluZyBvbiBtaWRkbGV3YXJlIG1vZGUsIGl0IHJldHVybnMgc3RhdHVzIDQyNiwgYW5kIGFuIGNvcnMgZXJyb3IgaGFwcGVucyBpZiBtb2RlIGlzIG5vdCBuby1jb3JzXG4gICAgICBhd2FpdCBmZXRjaChgJHtwaW5nSG9zdFByb3RvY29sfTovLyR7aG9zdEFuZFBhdGh9YCwge1xuICAgICAgICBtb2RlOiAnbm8tY29ycydcbiAgICAgIH0pXG4gICAgICBicmVha1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIHdhaXQgbXMgYmVmb3JlIGF0dGVtcHRpbmcgdG8gcGluZyBhZ2FpblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKVxuICAgIH1cbiAgfVxufVxuXG4vLyBodHRwczovL3dpY2cuZ2l0aHViLmlvL2NvbnN0cnVjdC1zdHlsZXNoZWV0c1xuY29uc3Qgc3VwcG9ydHNDb25zdHJ1Y3RlZFNoZWV0ID0gKCgpID0+IHtcbiAgLy8gVE9ETzogcmUtZW5hYmxlIHRoaXMgdHJ5IGJsb2NrIG9uY2UgQ2hyb21lIGZpeGVzIHRoZSBwZXJmb3JtYW5jZSBvZlxuICAvLyBydWxlIGluc2VydGlvbiBpbiByZWFsbHkgYmlnIHN0eWxlc2hlZXRzXG4gIC8vIHRyeSB7XG4gIC8vICAgbmV3IENTU1N0eWxlU2hlZXQoKVxuICAvLyAgIHJldHVybiB0cnVlXG4gIC8vIH0gY2F0Y2ggKGUpIHt9XG4gIHJldHVybiBmYWxzZVxufSkoKVxuXG5jb25zdCBzaGVldHNNYXAgPSBuZXcgTWFwPFxuICBzdHJpbmcsXG4gIEhUTUxTdHlsZUVsZW1lbnQgfCBDU1NTdHlsZVNoZWV0IHwgdW5kZWZpbmVkXG4+KClcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVN0eWxlKGlkOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZyk6IHZvaWQge1xuICBsZXQgc3R5bGUgPSBzaGVldHNNYXAuZ2V0KGlkKVxuICBpZiAoc3VwcG9ydHNDb25zdHJ1Y3RlZFNoZWV0ICYmICFjb250ZW50LmluY2x1ZGVzKCdAaW1wb3J0JykpIHtcbiAgICBpZiAoc3R5bGUgJiYgIShzdHlsZSBpbnN0YW5jZW9mIENTU1N0eWxlU2hlZXQpKSB7XG4gICAgICByZW1vdmVTdHlsZShpZClcbiAgICAgIHN0eWxlID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgc3R5bGUgPSBuZXcgQ1NTU3R5bGVTaGVldCgpXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yOiB1c2luZyBleHBlcmltZW50YWwgQVBJXG4gICAgICBzdHlsZS5yZXBsYWNlU3luYyhjb250ZW50KVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvcjogdXNpbmcgZXhwZXJpbWVudGFsIEFQSVxuICAgICAgZG9jdW1lbnQuYWRvcHRlZFN0eWxlU2hlZXRzID0gWy4uLmRvY3VtZW50LmFkb3B0ZWRTdHlsZVNoZWV0cywgc3R5bGVdXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHVzaW5nIGV4cGVyaW1lbnRhbCBBUElcbiAgICAgIHN0eWxlLnJlcGxhY2VTeW5jKGNvbnRlbnQpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChzdHlsZSAmJiAhKHN0eWxlIGluc3RhbmNlb2YgSFRNTFN0eWxlRWxlbWVudCkpIHtcbiAgICAgIHJlbW92ZVN0eWxlKGlkKVxuICAgICAgc3R5bGUgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgIHN0eWxlLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpXG4gICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtdml0ZS1kZXYtaWQnLCBpZClcbiAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gY29udGVudFxuICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSlcbiAgICB9IGVsc2Uge1xuICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSBjb250ZW50XG4gICAgfVxuICB9XG4gIHNoZWV0c01hcC5zZXQoaWQsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3R5bGUoaWQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBzdHlsZSA9IHNoZWV0c01hcC5nZXQoaWQpXG4gIGlmIChzdHlsZSkge1xuICAgIGlmIChzdHlsZSBpbnN0YW5jZW9mIENTU1N0eWxlU2hlZXQpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3I6IHVzaW5nIGV4cGVyaW1lbnRhbCBBUElcbiAgICAgIGRvY3VtZW50LmFkb3B0ZWRTdHlsZVNoZWV0cyA9IGRvY3VtZW50LmFkb3B0ZWRTdHlsZVNoZWV0cy5maWx0ZXIoXG4gICAgICAgIChzOiBDU1NTdHlsZVNoZWV0KSA9PiBzICE9PSBzdHlsZVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHN0eWxlKVxuICAgIH1cbiAgICBzaGVldHNNYXAuZGVsZXRlKGlkKVxuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZldGNoVXBkYXRlKHtcbiAgcGF0aCxcbiAgYWNjZXB0ZWRQYXRoLFxuICB0aW1lc3RhbXAsXG4gIGV4cGxpY2l0SW1wb3J0UmVxdWlyZWRcbn06IFVwZGF0ZSkge1xuICBjb25zdCBtb2QgPSBob3RNb2R1bGVzTWFwLmdldChwYXRoKVxuICBpZiAoIW1vZCkge1xuICAgIC8vIEluIGEgY29kZS1zcGxpdHRpbmcgcHJvamVjdCxcbiAgICAvLyBpdCBpcyBjb21tb24gdGhhdCB0aGUgaG90LXVwZGF0aW5nIG1vZHVsZSBpcyBub3QgbG9hZGVkIHlldC5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZWpzL3ZpdGUvaXNzdWVzLzcyMVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgbW9kdWxlTWFwID0gbmV3IE1hcDxzdHJpbmcsIE1vZHVsZU5hbWVzcGFjZT4oKVxuICBjb25zdCBpc1NlbGZVcGRhdGUgPSBwYXRoID09PSBhY2NlcHRlZFBhdGhcblxuICAvLyBkZXRlcm1pbmUgdGhlIHF1YWxpZmllZCBjYWxsYmFja3MgYmVmb3JlIHdlIHJlLWltcG9ydCB0aGUgbW9kdWxlc1xuICBjb25zdCBxdWFsaWZpZWRDYWxsYmFja3MgPSBtb2QuY2FsbGJhY2tzLmZpbHRlcigoeyBkZXBzIH0pID0+XG4gICAgZGVwcy5pbmNsdWRlcyhhY2NlcHRlZFBhdGgpXG4gIClcblxuICBpZiAoaXNTZWxmVXBkYXRlIHx8IHF1YWxpZmllZENhbGxiYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZGVwID0gYWNjZXB0ZWRQYXRoXG4gICAgY29uc3QgZGlzcG9zZXIgPSBkaXNwb3NlTWFwLmdldChkZXApXG4gICAgaWYgKGRpc3Bvc2VyKSBhd2FpdCBkaXNwb3NlcihkYXRhTWFwLmdldChkZXApKVxuICAgIGNvbnN0IFtwYXRoLCBxdWVyeV0gPSBkZXAuc3BsaXQoYD9gKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXdNb2Q6IE1vZHVsZU5hbWVzcGFjZSA9IGF3YWl0IGltcG9ydChcbiAgICAgICAgLyogQHZpdGUtaWdub3JlICovXG4gICAgICAgIGJhc2UgK1xuICAgICAgICAgIHBhdGguc2xpY2UoMSkgK1xuICAgICAgICAgIGA/JHtleHBsaWNpdEltcG9ydFJlcXVpcmVkID8gJ2ltcG9ydCYnIDogJyd9dD0ke3RpbWVzdGFtcH0ke1xuICAgICAgICAgICAgcXVlcnkgPyBgJiR7cXVlcnl9YCA6ICcnXG4gICAgICAgICAgfWBcbiAgICAgIClcbiAgICAgIG1vZHVsZU1hcC5zZXQoZGVwLCBuZXdNb2QpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybkZhaWxlZEZldGNoKGUsIGRlcClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgeyBkZXBzLCBmbiB9IG9mIHF1YWxpZmllZENhbGxiYWNrcykge1xuICAgICAgZm4oZGVwcy5tYXAoKGRlcCkgPT4gbW9kdWxlTWFwLmdldChkZXApKSlcbiAgICB9XG4gICAgY29uc3QgbG9nZ2VkUGF0aCA9IGlzU2VsZlVwZGF0ZSA/IHBhdGggOiBgJHthY2NlcHRlZFBhdGh9IHZpYSAke3BhdGh9YFxuICAgIGNvbnNvbGUuZGVidWcoYFt2aXRlXSBob3QgdXBkYXRlZDogJHtsb2dnZWRQYXRofWApXG4gIH1cbn1cblxuZnVuY3Rpb24gc2VuZE1lc3NhZ2VCdWZmZXIoKSB7XG4gIGlmIChzb2NrZXQucmVhZHlTdGF0ZSA9PT0gMSkge1xuICAgIG1lc3NhZ2VCdWZmZXIuZm9yRWFjaCgobXNnKSA9PiBzb2NrZXQuc2VuZChtc2cpKVxuICAgIG1lc3NhZ2VCdWZmZXIubGVuZ3RoID0gMFxuICB9XG59XG5cbmludGVyZmFjZSBIb3RNb2R1bGUge1xuICBpZDogc3RyaW5nXG4gIGNhbGxiYWNrczogSG90Q2FsbGJhY2tbXVxufVxuXG5pbnRlcmZhY2UgSG90Q2FsbGJhY2sge1xuICAvLyB0aGUgZGVwZW5kZW5jaWVzIG11c3QgYmUgZmV0Y2hhYmxlIHBhdGhzXG4gIGRlcHM6IHN0cmluZ1tdXG4gIGZuOiAobW9kdWxlczogQXJyYXk8TW9kdWxlTmFtZXNwYWNlIHwgdW5kZWZpbmVkPikgPT4gdm9pZFxufVxuXG50eXBlIEN1c3RvbUxpc3RlbmVyc01hcCA9IE1hcDxzdHJpbmcsICgoZGF0YTogYW55KSA9PiB2b2lkKVtdPlxuXG5jb25zdCBob3RNb2R1bGVzTWFwID0gbmV3IE1hcDxzdHJpbmcsIEhvdE1vZHVsZT4oKVxuY29uc3QgZGlzcG9zZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCAoZGF0YTogYW55KSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPj4oKVxuY29uc3QgcHJ1bmVNYXAgPSBuZXcgTWFwPHN0cmluZywgKGRhdGE6IGFueSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD4+KClcbmNvbnN0IGRhdGFNYXAgPSBuZXcgTWFwPHN0cmluZywgYW55PigpXG5jb25zdCBjdXN0b21MaXN0ZW5lcnNNYXA6IEN1c3RvbUxpc3RlbmVyc01hcCA9IG5ldyBNYXAoKVxuY29uc3QgY3R4VG9MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwPHN0cmluZywgQ3VzdG9tTGlzdGVuZXJzTWFwPigpXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVIb3RDb250ZXh0KG93bmVyUGF0aDogc3RyaW5nKTogVml0ZUhvdENvbnRleHQge1xuICBpZiAoIWRhdGFNYXAuaGFzKG93bmVyUGF0aCkpIHtcbiAgICBkYXRhTWFwLnNldChvd25lclBhdGgsIHt9KVxuICB9XG5cbiAgLy8gd2hlbiBhIGZpbGUgaXMgaG90IHVwZGF0ZWQsIGEgbmV3IGNvbnRleHQgaXMgY3JlYXRlZFxuICAvLyBjbGVhciBpdHMgc3RhbGUgY2FsbGJhY2tzXG4gIGNvbnN0IG1vZCA9IGhvdE1vZHVsZXNNYXAuZ2V0KG93bmVyUGF0aClcbiAgaWYgKG1vZCkge1xuICAgIG1vZC5jYWxsYmFja3MgPSBbXVxuICB9XG5cbiAgLy8gY2xlYXIgc3RhbGUgY3VzdG9tIGV2ZW50IGxpc3RlbmVyc1xuICBjb25zdCBzdGFsZUxpc3RlbmVycyA9IGN0eFRvTGlzdGVuZXJzTWFwLmdldChvd25lclBhdGgpXG4gIGlmIChzdGFsZUxpc3RlbmVycykge1xuICAgIGZvciAoY29uc3QgW2V2ZW50LCBzdGFsZUZuc10gb2Ygc3RhbGVMaXN0ZW5lcnMpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IGN1c3RvbUxpc3RlbmVyc01hcC5nZXQoZXZlbnQpXG4gICAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIGN1c3RvbUxpc3RlbmVyc01hcC5zZXQoXG4gICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgbGlzdGVuZXJzLmZpbHRlcigobCkgPT4gIXN0YWxlRm5zLmluY2x1ZGVzKGwpKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbmV3TGlzdGVuZXJzOiBDdXN0b21MaXN0ZW5lcnNNYXAgPSBuZXcgTWFwKClcbiAgY3R4VG9MaXN0ZW5lcnNNYXAuc2V0KG93bmVyUGF0aCwgbmV3TGlzdGVuZXJzKVxuXG4gIGZ1bmN0aW9uIGFjY2VwdERlcHMoZGVwczogc3RyaW5nW10sIGNhbGxiYWNrOiBIb3RDYWxsYmFja1snZm4nXSA9ICgpID0+IHt9KSB7XG4gICAgY29uc3QgbW9kOiBIb3RNb2R1bGUgPSBob3RNb2R1bGVzTWFwLmdldChvd25lclBhdGgpIHx8IHtcbiAgICAgIGlkOiBvd25lclBhdGgsXG4gICAgICBjYWxsYmFja3M6IFtdXG4gICAgfVxuICAgIG1vZC5jYWxsYmFja3MucHVzaCh7XG4gICAgICBkZXBzLFxuICAgICAgZm46IGNhbGxiYWNrXG4gICAgfSlcbiAgICBob3RNb2R1bGVzTWFwLnNldChvd25lclBhdGgsIG1vZClcbiAgfVxuXG4gIGNvbnN0IGhvdDogVml0ZUhvdENvbnRleHQgPSB7XG4gICAgZ2V0IGRhdGEoKSB7XG4gICAgICByZXR1cm4gZGF0YU1hcC5nZXQob3duZXJQYXRoKVxuICAgIH0sXG5cbiAgICBhY2NlcHQoZGVwcz86IGFueSwgY2FsbGJhY2s/OiBhbnkpIHtcbiAgICAgIGlmICh0eXBlb2YgZGVwcyA9PT0gJ2Z1bmN0aW9uJyB8fCAhZGVwcykge1xuICAgICAgICAvLyBzZWxmLWFjY2VwdDogaG90LmFjY2VwdCgoKSA9PiB7fSlcbiAgICAgICAgYWNjZXB0RGVwcyhbb3duZXJQYXRoXSwgKFttb2RdKSA9PiBkZXBzICYmIGRlcHMobW9kKSlcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlcHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIGV4cGxpY2l0IGRlcHNcbiAgICAgICAgYWNjZXB0RGVwcyhbZGVwc10sIChbbW9kXSkgPT4gY2FsbGJhY2sgJiYgY2FsbGJhY2sobW9kKSlcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkZXBzKSkge1xuICAgICAgICBhY2NlcHREZXBzKGRlcHMsIGNhbGxiYWNrKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGhvdC5hY2NlcHQoKSB1c2FnZS5gKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBleHBvcnQgbmFtZXMgKGZpcnN0IGFyZykgYXJlIGlycmVsZXZhbnQgb24gdGhlIGNsaWVudCBzaWRlLCB0aGV5J3JlXG4gICAgLy8gZXh0cmFjdGVkIGluIHRoZSBzZXJ2ZXIgZm9yIHByb3BhZ2F0aW9uXG4gICAgYWNjZXB0RXhwb3J0cyhfOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSwgY2FsbGJhY2s/OiBhbnkpIHtcbiAgICAgIGFjY2VwdERlcHMoW293bmVyUGF0aF0sIGNhbGxiYWNrICYmICgoW21vZF0pID0+IGNhbGxiYWNrKG1vZCkpKVxuICAgIH0sXG5cbiAgICBkaXNwb3NlKGNiKSB7XG4gICAgICBkaXNwb3NlTWFwLnNldChvd25lclBhdGgsIGNiKVxuICAgIH0sXG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHVudHlwZWRcbiAgICBwcnVuZShjYjogKGRhdGE6IGFueSkgPT4gdm9pZCkge1xuICAgICAgcHJ1bmVNYXAuc2V0KG93bmVyUGF0aCwgY2IpXG4gICAgfSxcblxuICAgIC8vIFRPRE9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG4gICAgZGVjbGluZSgpIHt9LFxuXG4gICAgLy8gdGVsbCB0aGUgc2VydmVyIHRvIHJlLXBlcmZvcm0gaG1yIHByb3BhZ2F0aW9uIGZyb20gdGhpcyBtb2R1bGUgYXMgcm9vdFxuICAgIGludmFsaWRhdGUoKSB7XG4gICAgICBub3RpZnlMaXN0ZW5lcnMoJ3ZpdGU6aW52YWxpZGF0ZScsIHsgcGF0aDogb3duZXJQYXRoIH0pXG4gICAgICB0aGlzLnNlbmQoJ3ZpdGU6aW52YWxpZGF0ZScsIHsgcGF0aDogb3duZXJQYXRoIH0pXG4gICAgfSxcblxuICAgIC8vIGN1c3RvbSBldmVudHNcbiAgICBvbihldmVudCwgY2IpIHtcbiAgICAgIGNvbnN0IGFkZFRvTWFwID0gKG1hcDogTWFwPHN0cmluZywgYW55W10+KSA9PiB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gbWFwLmdldChldmVudCkgfHwgW11cbiAgICAgICAgZXhpc3RpbmcucHVzaChjYilcbiAgICAgICAgbWFwLnNldChldmVudCwgZXhpc3RpbmcpXG4gICAgICB9XG4gICAgICBhZGRUb01hcChjdXN0b21MaXN0ZW5lcnNNYXApXG4gICAgICBhZGRUb01hcChuZXdMaXN0ZW5lcnMpXG4gICAgfSxcblxuICAgIHNlbmQoZXZlbnQsIGRhdGEpIHtcbiAgICAgIG1lc3NhZ2VCdWZmZXIucHVzaChKU09OLnN0cmluZ2lmeSh7IHR5cGU6ICdjdXN0b20nLCBldmVudCwgZGF0YSB9KSlcbiAgICAgIHNlbmRNZXNzYWdlQnVmZmVyKClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaG90XG59XG5cbi8qKlxuICogdXJscyBoZXJlIGFyZSBkeW5hbWljIGltcG9ydCgpIHVybHMgdGhhdCBjb3VsZG4ndCBiZSBzdGF0aWNhbGx5IGFuYWx5emVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RRdWVyeSh1cmw6IHN0cmluZywgcXVlcnlUb0luamVjdDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gc2tpcCB1cmxzIHRoYXQgd29uJ3QgYmUgaGFuZGxlZCBieSB2aXRlXG4gIGlmICghdXJsLnN0YXJ0c1dpdGgoJy4nKSAmJiAhdXJsLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgIHJldHVybiB1cmxcbiAgfVxuXG4gIC8vIGNhbid0IHVzZSBwYXRobmFtZSBmcm9tIFVSTCBzaW5jZSBpdCBtYXkgYmUgcmVsYXRpdmUgbGlrZSAuLi9cbiAgY29uc3QgcGF0aG5hbWUgPSB1cmwucmVwbGFjZSgvIy4qJC8sICcnKS5yZXBsYWNlKC9cXD8uKiQvLCAnJylcbiAgY29uc3QgeyBzZWFyY2gsIGhhc2ggfSA9IG5ldyBVUkwodXJsLCAnaHR0cDovL3ZpdGVqcy5kZXYnKVxuXG4gIHJldHVybiBgJHtwYXRobmFtZX0/JHtxdWVyeVRvSW5qZWN0fSR7c2VhcmNoID8gYCZgICsgc2VhcmNoLnNsaWNlKDEpIDogJyd9JHtcbiAgICBoYXNoIHx8ICcnXG4gIH1gXG59XG5cbmV4cG9ydCB7IEVycm9yT3ZlcmxheSB9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtB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