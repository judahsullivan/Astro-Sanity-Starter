import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_CCRKAYUI.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const path = toPath(params);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://example.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@sanity/astro/dist/studio/studio-route.astro",{"propagation":"none","containsHead":true}],["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/pages/blog/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/pages/rss.xml.js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@js",{"propagation":"in-tree","containsHead":false}],["/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-manifest":"manifest_BcKASa34.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_BkR_XoPb.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_D5O0G-mM.mjs","\u0000@astro-page:node_modules/@sanity/astro/dist/studio/studio-route@_@astro":"chunks/studio-route_6v5vRfwO.mjs","\u0000@astro-page:src/pages/about@_@astro":"chunks/about_B-Ha-Vw-.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"chunks/index_C4phokNY.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"chunks/_.._EZ_6r3oX.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"chunks/rss_DEpiFgpI.mjs","\u0000@astro-page:src/pages/index@_@astro":"chunks/index_5L7gjbd8.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/first-post.md?astroContentCollectionEntry=true":"chunks/first-post_CDAqeNsc.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/markdown-style-guide.md?astroContentCollectionEntry=true":"chunks/markdown-style-guide_DFGMPT6K.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/second-post.md?astroContentCollectionEntry=true":"chunks/second-post_1dC9amnd.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/third-post.md?astroContentCollectionEntry=true":"chunks/third-post_BzM8BdOU.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/using-mdx.mdx?astroContentCollectionEntry=true":"chunks/using-mdx_B2KC03Z1.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/first-post.md?astroPropagatedAssets":"chunks/first-post_DTDWlnna.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/markdown-style-guide.md?astroPropagatedAssets":"chunks/markdown-style-guide_FgreY56Y.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/second-post.md?astroPropagatedAssets":"chunks/second-post_Bd5yZ3wf.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/third-post.md?astroPropagatedAssets":"chunks/third-post_MUQRUZbm.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/using-mdx.mdx?astroPropagatedAssets":"chunks/using-mdx_Djwiv99b.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/first-post.md":"chunks/first-post_UDRD8weL.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/markdown-style-guide.md":"chunks/markdown-style-guide_C_DPmcKO.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/second-post.md":"chunks/second-post_nrmms2wf.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/third-post.md":"chunks/third-post_CVvjb3PU.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/src/content/blog/using-mdx.mdx":"chunks/using-mdx_Bt2IsOED.mjs","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@sanity/vision/lib/_chunks-es/resources.js":"_astro/resources.Cr6jn9YT.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/resources3.js":"_astro/resources3.CIfZNUt5.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/resources.js":"_astro/resources.uMxoJGMs.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/index2.js":"_astro/index2.Bj7xDT-X.js","@astrojs/react/client.js":"_astro/client.P0qTK53Z.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/index.js":"_astro/index.BPXzG9tp.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/resources2.js":"_astro/resources2.CswQ4McV.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@sanity/client/dist/_chunks-es/stegaEncodeSourceMap.js":"_astro/stegaEncodeSourceMap.itAzrMpp.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@sanity/astro/dist/studio/studio-component":"_astro/studio-component.4oWyhpK2.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/sanity/lib/_chunks-es/index3.js":"_astro/index3.BKhYz6zT.js","/home/judahsullivan/Projects/Astro/personal/astro-sanity-starter/node_modules/@sanity/vision/lib/_chunks-es/SanityVision.js":"_astro/SanityVision.BJj9Ctbv.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/blog-placeholder-1.jpg","/blog-placeholder-2.jpg","/blog-placeholder-3.jpg","/blog-placeholder-4.jpg","/blog-placeholder-5.jpg","/blog-placeholder-about.jpg","/favicon.svg","/_astro/SanityVision.BJj9Ctbv.js","/_astro/browser.yf0abzTL.js","/_astro/client.B2cv0V2j.js","/_astro/client.P0qTK53Z.js","/_astro/index.BPXzG9tp.js","/_astro/index2.Bj7xDT-X.js","/_astro/index3.BKhYz6zT.js","/_astro/resources.Cr6jn9YT.js","/_astro/resources.uMxoJGMs.js","/_astro/resources2.CswQ4McV.js","/_astro/resources3.CIfZNUt5.js","/_astro/stegaEncodeSourceMap.itAzrMpp.js","/_astro/studio-component.4oWyhpK2.js","/_astro/studio-component.CjXfYA8x.js","/fonts/atkinson-bold.woff","/fonts/atkinson-regular.woff","/about/index.html","/blog/index.html","/rss.xml","/index.html"],"buildFormat":"directory"});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
