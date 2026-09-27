//#region src/custom-cards.ts
function e(e) {
	window.customCards = window.customCards ?? [], !window.customCards.some((t) => t.type === e.type) && window.customCards.push(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var t = globalThis, n = t.ShadowRoot && (t.ShadyCSS === void 0 || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, r = Symbol(), i = /* @__PURE__ */ new WeakMap(), a = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== r) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (n && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = i.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && i.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, o = (e) => new a(typeof e == "string" ? e : e + "", void 0, r), s = (e, ...t) => new a(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, r), c = (e, r) => {
	if (n) e.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of r) {
		let r = document.createElement("style"), i = t.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, e.appendChild(r);
	}
}, l = n ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return o(t);
})(e) : e, { is: u, defineProperty: d, getOwnPropertyDescriptor: ee, getOwnPropertyNames: te, getOwnPropertySymbols: ne, getPrototypeOf: re } = Object, f = globalThis, p = f.trustedTypes, ie = p ? p.emptyScript : "", ae = f.reactiveElementPolyfillSupport, m = (e, t) => e, h = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ie : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, g = (e, t) => !u(e, t), oe = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var _ = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = oe) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && d(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = ee(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? oe;
	}
	static _$Ei() {
		if (this.hasOwnProperty(m("elementProperties"))) return;
		let e = re(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(m("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(m("properties"))) {
			let e = this.properties, t = [...te(e), ...ne(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(l(e));
		} else e !== void 0 && t.push(l(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return c(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? h : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? h : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? g)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
_.elementStyles = [], _.shadowRootOptions = { mode: "open" }, _[m("elementProperties")] = /* @__PURE__ */ new Map(), _[m("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: _ }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region ../../node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var v = globalThis, y = (e) => e, b = v.trustedTypes, x = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, S = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, w = "?" + C, se = `<${w}>`, T = document, E = () => T.createComment(""), D = (e) => e === null || typeof e != "object" && typeof e != "function", O = Array.isArray, ce = (e) => O(e) || typeof e?.[Symbol.iterator] == "function", k = "[ 	\n\f\r]", A = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, le = /-->/g, ue = />/g, j = RegExp(`>|${k}(?:([^\\s"'>=/]+)(${k}*=${k}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), M = /'/g, N = /"/g, P = /^(?:script|style|textarea|title)$/i, F = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), I = Symbol.for("lit-noChange"), L = Symbol.for("lit-nothing"), R = /* @__PURE__ */ new WeakMap(), z = T.createTreeWalker(T, 129);
function B(e, t) {
	if (!O(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return x === void 0 ? t : x.createHTML(t);
}
var de = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = A;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === A ? c[1] === "!--" ? o = le : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = j) : (P.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = j) : o = ue : o === j ? c[0] === ">" ? (o = i ?? A, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? j : c[3] === "\"" ? N : M) : o === N || o === M ? o = j : o === le || o === ue ? o = A : (o = j, i = void 0);
		let d = o === j && e[t + 1].startsWith("/>") ? " " : "";
		a += o === A ? n + se : l >= 0 ? (r.push(s), n.slice(0, l) + S + n.slice(l) + C + d) : n + C + (l === -2 ? t : d);
	}
	return [B(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, V = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = de(t, n);
		if (this.el = e.createElement(l, r), z.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = z.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(S)) {
					let t = u[o++], n = i.getAttribute(e).split(C), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? pe : r[1] === "?" ? me : r[1] === "@" ? he : W
					}), i.removeAttribute(e);
				} else e.startsWith(C) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (P.test(i.tagName)) {
					let e = i.textContent.split(C), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], E()), z.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], E());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === w) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(C, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += C.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = T.createElement("template");
		return n.innerHTML = e, n;
	}
};
function H(e, t, n = e, r) {
	if (t === I) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = D(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = H(e, i._$AS(e, t.values), i, r)), t;
}
var fe = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? T).importNode(t, !0);
		z.currentNode = r;
		let i = z.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new U(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ge(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = z.nextNode(), a++);
		}
		return z.currentNode = T, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, U = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = L, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = H(this, e, t), D(e) ? e === L || e == null || e === "" ? (this._$AH !== L && this._$AR(), this._$AH = L) : e !== this._$AH && e !== I && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ce(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== L && D(this._$AH) ? this._$AA.nextSibling.data = e : this.T(T.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = V.createElement(B(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = R.get(e.strings);
		return t === void 0 && R.set(e.strings, t = new V(e)), t;
	}
	k(t) {
		O(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(E()), this.O(E()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = y(e).nextSibling;
			y(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, W = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = L, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = L;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = H(this, e, t, 0), a = !D(e) || e !== this._$AH && e !== I, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = H(this, r[n + o], t, o), s === I && (s = this._$AH[o]), a ||= !D(s) || s !== this._$AH[o], s === L ? e = L : e !== L && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === L ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, pe = class extends W {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === L ? void 0 : e;
	}
}, me = class extends W {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== L);
	}
}, he = class extends W {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = H(this, e, t, 0) ?? L) === I) return;
		let n = this._$AH, r = e === L && n !== L || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== L && (n === L || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ge = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		H(this, e);
	}
}, _e = v.litHtmlPolyfillSupport;
_e?.(V, U), (v.litHtmlVersions ??= []).push("3.3.3");
var ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new U(t.insertBefore(E(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, G = globalThis, K = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return I;
	}
};
K._$litElement$ = !0, K.finalized = !0, G.litElementHydrateSupport?.({ LitElement: K });
var ye = G.litElementPolyfillSupport;
ye?.({ LitElement: K }), (G.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/freshness.ts
function q(e, t, n = Date.now()) {
	let r = e.freshnessPct;
	if (typeof r == "number" && Number.isFinite(r)) return J(100 - r);
	let i = Math.max(1, t) * 24 * 60 * 60 * 1e3;
	if (e.lastCompletedAt == null) return 100;
	let a = Date.parse(e.lastCompletedAt);
	return Number.isNaN(a) ? 100 : J(Math.max(0, n - a) / i * 100);
}
function J(e) {
	return Number.isFinite(e) ? Math.min(100, Math.max(0, e)) : 0;
}
function be(e) {
	let t = J(e);
	return t < 40 ? "var(--success-color, #4caf50)" : t < 75 ? "var(--warning-color, #ff9800)" : "var(--error-color, #db4437)";
}
function xe(e, t) {
	if (t === "chore") return [{
		key: "chores",
		label: "Chores",
		rows: [...e].sort((e, t) => e.title.localeCompare(t.title))
	}];
	let n = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = t.roomId ?? "__unassigned__", r = t.roomName?.trim() || "No room", i = n.get(e);
		i || (i = {
			key: e,
			label: r,
			rows: []
		}, n.set(e, i)), i.rows.push(t);
	}
	return [...n.values()].map((e) => ({
		...e,
		rows: e.rows.sort((e, t) => e.title.localeCompare(t.title))
	})).sort((e, t) => e.key === "__unassigned__" ? 1 : t.key === "__unassigned__" ? -1 : e.label.localeCompare(t.label));
}
//#endregion
//#region src/todo-helpers.ts
var Y = "todo.household_chores", Se = /^todo\.[a-z0-9_]+_chores$/;
function Ce(e, t) {
	let n = e.attributes?.friendly_name;
	return typeof n == "string" && n.trim() ? n.replace(/\s+chores$/i, "").trim() || n.trim() : t.replace(/^todo\./, "").replace(/_chores$/, "").split("_").filter(Boolean).map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
}
function X(e, t) {
	let n = e.entities?.[t]?.config_entry_id;
	return typeof n == "string" && n.length > 0 ? n : null;
}
function we(e, t, n) {
	if (typeof t == "string" && t.length > 0) return t;
	let r = n ?? Ee(e), i = /* @__PURE__ */ new Set();
	for (let t of r) {
		let n = X(e, t);
		n && i.add(n);
	}
	return i.size === 1 ? i.values().next().value ?? null : null;
}
function Te(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Ee(e)) {
		let r = X(e, n);
		r && t.add(r);
	}
	return t.size > 1;
}
function Ee(e) {
	let t = [];
	for (let n of Object.keys(e.states)) n !== Y && Se.test(n) && t.push(n);
	return t;
}
function De(e, t) {
	let n = typeof t?.configEntryId == "string" && t.configEntryId.length > 0 ? t.configEntryId : null, r = [];
	for (let [t, i] of Object.entries(e.states)) t !== Y && Se.test(t) && (n && X(e, t) !== n || r.push({
		entityId: t,
		label: Ce(i, t)
	}));
	return r.sort((e, t) => e.label.localeCompare(t.label));
}
async function Oe(e, t) {
	let n = [];
	if (typeof e.callWS == "function") {
		let r = await e.callWS({
			type: "todo/item/list",
			entity_id: t
		});
		n = Array.isArray(r?.items) ? r.items : [];
	} else {
		let r = e.states[t]?.attributes?.items;
		n = Array.isArray(r) ? r : [];
	}
	return n.filter((e) => typeof e.uid == "string" && e.uid.length > 0 && e.status !== "completed");
}
var ke = "chore_tracker";
//#endregion
//#region src/shared.ts
function Ae(e) {
	if (!e) return;
	let t = Date.parse(e);
	if (!Number.isFinite(t)) return e;
	try {
		return new Intl.DateTimeFormat(void 0, {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit"
		}).format(new Date(t));
	} catch {
		return e;
	}
}
async function je(e, t, n) {
	let r = { occurrence_id: t };
	n?.configEntryId && (r.config_entry_id = n.configEntryId), n?.completedForMemberId && (r.completed_for_member_id = n.completedForMemberId), await e.callService(ke, "complete", r);
}
async function Me(e, t) {
	if (typeof e.callWS != "function") return {
		rows: [],
		configEntryId: t ?? null
	};
	let n = { type: "chore_tracker/freshness" };
	t && (n.config_entry_id = t);
	let r = await e.callWS(n);
	return {
		rows: Array.isArray(r?.rows) ? r.rows : [],
		configEntryId: (typeof r?.config_entry_id == "string" ? r.config_entry_id : null) ?? t ?? null
	};
}
//#endregion
//#region src/types.ts
function Z(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !0
	}));
}
var Q = "\n  :host {\n    display: block;\n  }\n\n  ha-card {\n    display: block;\n    background: var(--ha-card-background, var(--card-background-color, #fff));\n    border-radius: var(--ha-card-border-radius, 12px);\n    box-shadow: var(--ha-card-box-shadow, none);\n    border: var(--ha-card-border-width, 1px) solid\n      var(--ha-card-border-color, var(--divider-color, #e0e0e0));\n    color: var(--primary-text-color, #212121);\n  }\n\n  .content {\n    padding: 12px 16px 16px;\n  }\n\n  h2 {\n    margin: 0 0 8px;\n    font-size: 1.05rem;\n    font-weight: 600;\n    color: var(--primary-text-color, #212121);\n  }\n\n  .muted {\n    margin: 0;\n    color: var(--secondary-text-color, #5c5c5c);\n    font-size: 0.9rem;\n    line-height: 1.4;\n  }\n\n  .error {\n    margin: 0;\n    color: var(--error-color, #db4437);\n    font-size: 0.9rem;\n  }\n", Ne = [{
	value: "room",
	label: "Room"
}, {
	value: "chore",
	label: "Chore"
}], Pe = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    label {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    input,
    select {
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }
  `;
	setConfig(e) {
		this._config = { ...e };
	}
	_update(e) {
		if (!this._config) return;
		let t = {
			...this._config,
			...e
		};
		this._config = t, Z(this, "config-changed", { config: t });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	_onGroupByChange(e) {
		let t = e.target;
		this._update({ group_by: t.value });
	}
	_onHorizonInput(e) {
		let t = e.target, n = Number.parseInt(t.value, 10);
		if (!Number.isFinite(n) || n < 1) {
			this._update({ horizon_days: 7 });
			return;
		}
		this._update({ horizon_days: n });
	}
	render() {
		if (!this._config) return L;
		let e = this._config.group_by ?? "room", t = this._config.horizon_days ?? 7;
		return F`
      <div class="row">
        <label for="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder="Freshness"
          @change=${this._onTitleInput}
        />
      </div>
      <div class="row">
        <label for="group_by">Group by</label>
        <select id="group_by" .value=${e} @change=${this._onGroupByChange}>
          ${Ne.map((t) => F`
              <option value=${t.value} ?selected=${t.value === e}>
                ${t.label}
              </option>
            `)}
        </select>
      </div>
      <div class="row">
        <label for="horizon_days">Horizon (days)</label>
        <input
          id="horizon_days"
          type="number"
          min="1"
          step="1"
          .value=${String(t)}
          @change=${this._onHorizonInput}
        />
      </div>
    `;
	}
};
customElements.get("chore-tracker-freshness-card-editor") || customElements.define("chore-tracker-freshness-card-editor", Pe);
//#endregion
//#region src/freshness-card.ts
var $ = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_rows: { state: !0 },
		_loading: { state: !0 },
		_error: { state: !0 },
		_busyId: { state: !0 },
		_resolvedEntryId: { state: !0 }
	};
	_lastTodoSignature;
	_fetchGeneration = 0;
	constructor() {
		super(), this._rows = [], this._loading = !1;
	}
	static styles = s`
    ${o(Q)}

    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    .header h2 {
      margin: 0;
    }

    .meta {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #5c5c5c);
      white-space: nowrap;
    }

    .group {
      margin-top: 12px;
    }

    .group:first-of-type {
      margin-top: 0;
    }

    .group-label {
      margin: 0 0 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--secondary-text-color, #5c5c5c);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    button.row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      min-height: 52px;
      padding: 10px 12px;
      border: 0;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
    }

    button.row:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -2px;
    }

    button.row.busy {
      opacity: 0.55;
      pointer-events: none;
    }

    .title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }

    .title {
      font-weight: 500;
      font-size: 0.95rem;
      line-height: 1.3;
    }

    .pct {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #5c5c5c);
      white-space: nowrap;
    }

    .bar {
      height: 8px;
      border-radius: 4px;
      background: var(--divider-color, #e0e0e0);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.2s ease;
    }

    .empty {
      margin: 0;
      padding: 16px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color, #5c5c5c);
      font-size: 0.9rem;
      line-height: 1.45;
      text-align: center;
    }

    @media (min-width: 768px) {
      .content {
        padding: 14px 18px 18px;
      }

      button.row {
        min-height: 48px;
        padding: 12px 14px;
      }

      .title {
        font-size: 1rem;
      }
    }
  `;
	static getConfigElement() {
		return document.createElement("chore-tracker-freshness-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:chore-tracker-freshness-card",
			title: "Freshness",
			group_by: "room",
			horizon_days: 7
		};
	}
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-freshness-card config");
		let t = e.group_by ?? "room";
		if (t !== "room" && t !== "chore") throw Error("chore-tracker-freshness-card group_by must be room or chore");
		let n = e.horizon_days ?? 7;
		if (!Number.isFinite(n) || n < 1) throw Error("chore-tracker-freshness-card horizon_days must be >= 1");
		this._config = {
			...e,
			group_by: t,
			horizon_days: n
		}, this._error = void 0;
	}
	_todoSignature() {
		return this.hass?.states ? Object.entries(this.hass.states).filter(([e]) => e.startsWith("todo.") && e.endsWith("_chores")).map(([e, t]) => `${e}:${t.state}`).sort().join("|") : "";
	}
	updated(e) {
		if (!this._config || !this.hass) return;
		let t = this._todoSignature(), n = e.has("hass");
		(e.has("_config") || n && t !== this._lastTodoSignature || n && this._rows.length === 0 && !this._loading) && (this._lastTodoSignature = t, this._load());
	}
	_horizon() {
		return this._config?.horizon_days ?? 7;
	}
	_groupBy() {
		return this._config?.group_by ?? "room";
	}
	async _load() {
		let e = this.hass;
		if (!e) return;
		let t = ++this._fetchGeneration;
		this._loading = !0, this._error = void 0;
		try {
			let n = await Me(e, this._config?.config_entry_id);
			if (t !== this._fetchGeneration) return;
			this._rows = n.rows, this._resolvedEntryId = n.configEntryId ?? void 0;
		} catch (e) {
			if (t !== this._fetchGeneration) return;
			this._error = e instanceof Error ? e.message : "Failed to load freshness", this._rows = [];
		} finally {
			t === this._fetchGeneration && (this._loading = !1);
		}
	}
	_beginBusy(e) {
		return this._busyId === void 0 && (this._busyId = e, !0);
	}
	async _complete(e) {
		let t = this.hass;
		if (t && this._beginBusy(e.occurrenceId)) {
			this._error = void 0;
			try {
				await je(t, e.occurrenceId, { configEntryId: this._config?.config_entry_id ?? this._resolvedEntryId }), await this._load();
			} catch (e) {
				this._error = e instanceof Error ? e.message : "Failed to complete";
			} finally {
				this._busyId = void 0;
			}
		}
	}
	render() {
		if (!this._config) return L;
		this.hass;
		let e = this._config.title ?? "Freshness", t = this._horizon(), n = this._groupBy(), r = xe(this._rows, n).map((e) => ({
			...e,
			rows: [...e.rows].sort((e, n) => {
				let r = q(e, t), i = q(n, t);
				return r === i ? e.title.localeCompare(n.title) : i - r;
			})
		})), i = !this._loading && this._rows.length === 0 && !this._error;
		return F`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${e}</h2>
            <span class="meta">${t}d horizon</span>
          </div>
          ${this._error ? F`<p class="error">${this._error}</p>` : L}
          ${this._loading && this._rows.length === 0 ? F`<p class="muted">Loading…</p>` : L}
          ${i ? F`<p class="empty">No chores to show freshness for.</p>` : L}
          ${r.map((e) => F`
              <div class="group">
                ${n === "room" ? F`<p class="group-label">${e.label}</p>` : L}
                <ul>
                  ${e.rows.map((e) => {
			let n = Math.round(q(e, t)), r = be(n);
			return F`
                      <li>
                        <button
                          type="button"
                          class="row ${this._busyId === e.occurrenceId ? "busy" : ""}"
                          @click=${() => void this._complete(e)}
                        >
                          <div class="title-row">
                            <span class="title">${e.title}</span>
                            <span class="pct">${n}%</span>
                          </div>
                          <div class="bar" aria-hidden="true">
                            <div
                              class="fill"
                              style="width: ${n}%; background: ${r}"
                            ></div>
                          </div>
                        </button>
                      </li>
                    `;
		})}
                </ul>
              </div>
            `)}
        </div>
      </ha-card>
    `;
	}
};
customElements.get("chore-tracker-freshness-card") || customElements.define("chore-tracker-freshness-card", $);
//#endregion
//#region src/kiosk-editor.ts
var Fe = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    label {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    input {
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }

    .hint {
      margin: 0;
      font-size: 0.8rem;
      color: var(--secondary-text-color, #5c5c5c);
      line-height: 1.4;
    }
  `;
	setConfig(e) {
		this._config = { ...e };
	}
	_update(e) {
		if (!this._config) return;
		let t = {
			...this._config,
			...e
		};
		this._config = t, Z(this, "config-changed", { config: t });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	render() {
		return this._config ? F`
      <div class="row">
        <label for="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder="Kiosk"
          @change=${this._onTitleInput}
        />
      </div>
      <p class="hint">
        Member chips are auto-discovered from todo.*_chores for this config entry
        (household list excluded). Set config_entry_id when more than one Chore Tracker
        entry is loaded. No PIN.
      </p>
    ` : L;
	}
};
customElements.get("chore-tracker-kiosk-card-editor") || customElements.define("chore-tracker-kiosk-card-editor", Fe);
//#endregion
//#region src/kiosk-card.ts
var Ie = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_members: { state: !0 },
		_selectedEntity: { state: !0 },
		_items: { state: !0 },
		_loading: { state: !0 },
		_error: { state: !0 },
		_busyUid: { state: !0 },
		_resolvedEntryId: { state: !0 }
	};
	_lastEntity;
	_lastState;
	_fetchGeneration = 0;
	constructor() {
		super(), this._members = [], this._items = [], this._loading = !1;
	}
	static styles = s`
    ${o(Q)}

    .header h2 {
      margin: 0 0 12px;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    button.chip {
      font: inherit;
      font-size: 0.95rem;
      font-weight: 500;
      min-height: 44px;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
      touch-action: manipulation;
    }

    button.chip.active {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    button.chip:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    button.big {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      width: 100%;
      min-height: 72px;
      padding: 16px 18px;
      border: 0;
      border-radius: 12px;
      background: var(--secondary-background-color, #f5f5f5);
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      touch-action: manipulation;
    }

    button.big:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -2px;
    }

    button.big.busy {
      opacity: 0.55;
      pointer-events: none;
    }

    .summary {
      font-weight: 600;
      font-size: 1.15rem;
      line-height: 1.3;
    }

    .due {
      font-size: 0.9rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    .empty {
      margin: 0;
      padding: 20px 14px;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color, #5c5c5c);
      font-size: 0.95rem;
      line-height: 1.45;
      text-align: center;
    }

    @media (min-width: 768px) {
      .content {
        padding: 16px 20px 20px;
      }

      button.big {
        min-height: 80px;
        padding: 18px 22px;
      }

      .summary {
        font-size: 1.25rem;
      }
    }
  `;
	static getConfigElement() {
		return document.createElement("chore-tracker-kiosk-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:chore-tracker-kiosk-card",
			title: "Kiosk"
		};
	}
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-kiosk-card config");
		this._config = { ...e }, this._error = void 0;
	}
	updated(e) {
		if (!this._config || !this.hass) return;
		(e.has("hass") || e.has("_config")) && this._syncMembers();
		let t = this._selectedEntity;
		if (!t) return;
		let n = this.hass.states[t]?.state, r = e.has("hass");
		(e.has("_selectedEntity") || r && (t !== this._lastEntity || n !== this._lastState)) && (this._lastEntity = t, this._lastState = n, this._loadItems());
	}
	_syncMembers() {
		if (!this.hass) return;
		let e = this._config?.config_entry_id;
		if (!e && Te(this.hass)) {
			this._resolvedEntryId = void 0, this._members = [], this._selectedEntity = void 0, this._items = [], this._error = "Multiple Chore Tracker entries; set config_entry_id on this card";
			return;
		}
		let t = we(this.hass, e);
		this._resolvedEntryId = t ?? void 0;
		let n = De(this.hass, { configEntryId: t });
		if (this._members = n, this._error?.startsWith("Multiple Chore Tracker entries") && (this._error = void 0), n.length === 0) {
			this._selectedEntity = void 0, this._items = [];
			return;
		}
		(!this._selectedEntity || !n.some((e) => e.entityId === this._selectedEntity)) && (this._selectedEntity = n[0]?.entityId);
	}
	async _loadItems() {
		let e = this._selectedEntity, t = this.hass;
		if (!e || !t) return;
		let n = ++this._fetchGeneration;
		this._loading = !0, this._error = void 0;
		try {
			let r = await Oe(t, e);
			if (n !== this._fetchGeneration) return;
			this._items = r;
		} catch (e) {
			if (n !== this._fetchGeneration) return;
			this._error = e instanceof Error ? e.message : "Failed to load chores", this._items = [];
		} finally {
			n === this._fetchGeneration && (this._loading = !1);
		}
	}
	_select(e) {
		e !== this._selectedEntity && (this._selectedEntity = e, this._items = [], this._lastEntity = e, this._lastState = this.hass?.states[e]?.state, this._loadItems());
	}
	_beginBusy(e) {
		return this._busyUid === void 0 && (this._busyUid = e, !0);
	}
	async _complete(e) {
		let t = this.hass;
		if (t && this._beginBusy(e)) {
			this._error = void 0;
			try {
				await je(t, e, { configEntryId: this._config?.config_entry_id ?? this._resolvedEntryId }), await this._loadItems();
			} catch (e) {
				this._error = e instanceof Error ? e.message : "Failed to complete";
			} finally {
				this._busyUid = void 0;
			}
		}
	}
	render() {
		if (!this._config) return L;
		this.hass;
		let e = this._config.title ?? "Kiosk", t = this._members.length === 0;
		return F`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${e}</h2>
          </div>
          ${this._error ? F`<p class="error">${this._error}</p>` : L}
          ${t ? F`<p class="empty">No member chore lists found.</p>` : F`
                  <div class="chips" role="tablist" aria-label="Members">
                    ${this._members.map((e) => F`
                        <button
                          type="button"
                          class="chip ${e.entityId === this._selectedEntity ? "active" : ""}"
                          role="tab"
                          aria-selected=${e.entityId === this._selectedEntity}
                          @click=${() => this._select(e.entityId)}
                        >
                          ${e.label}
                        </button>
                      `)}
                  </div>
                `}
          ${this._loading && this._items.length === 0 && !t ? F`<p class="muted">Loading…</p>` : L}
          ${!t && !this._loading && this._items.length === 0 && !this._error ? F`<p class="empty">Nothing due for this member.</p>` : L}
          ${this._items.length > 0 ? F`
                  <ul>
                    ${this._items.map((e) => {
			let t = e.uid, n = Ae(e.due);
			return F`
                        <li>
                          <button
                            type="button"
                            class="big ${this._busyUid === t ? "busy" : ""}"
                            @click=${() => void this._complete(t)}
                          >
                            <span class="summary">${e.summary ?? "Chore"}</span>
                            ${n ? F`<span class="due">${n}</span>` : L}
                          </button>
                        </li>
                      `;
		})}
                  </ul>
                ` : L}
        </div>
      </ha-card>
    `;
	}
};
customElements.get("chore-tracker-kiosk-card") || customElements.define("chore-tracker-kiosk-card", Ie);
//#endregion
//#region src/leaderboard-editor.ts
var Le = [
	{
		value: "week",
		label: "This week"
	},
	{
		value: "month",
		label: "This month"
	},
	{
		value: "all_time",
		label: "All time"
	}
], Re = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    label {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    input,
    select {
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }
  `;
	setConfig(e) {
		this._config = { ...e };
	}
	_update(e) {
		if (!this._config) return;
		let t = {
			...this._config,
			...e
		};
		this._config = t, Z(this, "config-changed", { config: t });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	_onPeriodChange(e) {
		let t = e.target.value;
		this._update({ period: t });
	}
	render() {
		if (!this._config) return L;
		let e = this._config.period ?? "week";
		return F`
      <div class="row">
        <label for="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder="Leaderboard"
          @change=${this._onTitleInput}
        />
      </div>
      <div class="row">
        <label for="period">Period</label>
        <select id="period" .value=${e} @change=${this._onPeriodChange}>
          ${Le.map((t) => F`
              <option value=${t.value} ?selected=${t.value === e}>
                ${t.label}
              </option>
            `)}
        </select>
      </div>
    `;
	}
};
customElements.get("chore-tracker-leaderboard-card-editor") || customElements.define("chore-tracker-leaderboard-card-editor", Re);
//#endregion
//#region src/leaderboard-card.ts
var ze = {
	week: "This week",
	month: "This month",
	all_time: "All time"
}, Be = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    ${o(Q)}

    .period {
      display: inline-block;
      margin: 0 0 12px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--secondary-text-color, #5c5c5c);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .empty {
      margin: 0;
      padding: 16px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color, #5c5c5c);
      font-size: 0.9rem;
      line-height: 1.45;
      text-align: center;
    }

    @media (min-width: 768px) {
      .content {
        padding: 14px 18px 18px;
      }

      .empty {
        padding: 20px 16px;
        font-size: 0.95rem;
      }
    }
  `;
	static getConfigElement() {
		return document.createElement("chore-tracker-leaderboard-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:chore-tracker-leaderboard-card",
			title: "Leaderboard",
			period: "week"
		};
	}
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-leaderboard-card config");
		let t = e.period ?? "week";
		if (t !== "week" && t !== "month" && t !== "all_time") throw Error("chore-tracker-leaderboard-card period must be week, month, or all_time");
		this._config = {
			...e,
			period: t
		};
	}
	_period() {
		return this._config?.period ?? "week";
	}
	render() {
		if (!this._config) return L;
		let e = this._config.title ?? "Leaderboard", t = this._period();
		return this.hass, F`
      <ha-card>
        <div class="content">
          <h2>${e}</h2>
          <span class="period">${ze[t]}</span>
          <p class="empty">
            Leaderboard needs household stats (issue #29). No rankings yet.
          </p>
        </div>
      </ha-card>
    `;
	}
	getCardSize() {
		return 2;
	}
};
customElements.get("chore-tracker-leaderboard-card") || customElements.define("chore-tracker-leaderboard-card", Be);
//#endregion
//#region src/member-list-editor.ts
var Ve = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    .row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    label {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    input {
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }
  `;
	setConfig(e) {
		this._config = { ...e };
	}
	_update(e) {
		if (!this._config) return;
		let t = {
			...this._config,
			...e
		};
		this._config = t, Z(this, "config-changed", { config: t });
	}
	_onEntityPicker(e) {
		let t = e.detail?.value;
		typeof t == "string" && this._update({ entity: t });
	}
	_onEntityInput(e) {
		let t = e.target;
		this._update({ entity: t.value.trim() });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	render() {
		return this._config ? F`
      <div class="row">
        <label for="entity">Todo entity</label>
        ${customElements.get("ha-entity-picker") === void 0 ? F`
                <input
                  id="entity"
                  type="text"
                  .value=${this._config.entity ?? ""}
                  placeholder="todo.member_chores"
                  @change=${this._onEntityInput}
                />
              ` : F`
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${this._config.entity}
                  .includeDomains=${["todo"]}
                  allow-custom-entity
                  @value-changed=${this._onEntityPicker}
                ></ha-entity-picker>
              `}
      </div>
      <div class="row">
        <label for="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder="Chores"
          @change=${this._onTitleInput}
        />
      </div>
    ` : L;
	}
};
customElements.get("chore-tracker-member-list-card-editor") || customElements.define("chore-tracker-member-list-card-editor", Ve);
//#endregion
//#region src/member-list-card.ts
var He = 500, Ue = "chore_tracker", We = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_items: { state: !0 },
		_loading: { state: !0 },
		_error: { state: !0 },
		_action: { state: !0 },
		_busyUid: { state: !0 },
		_assigneeId: { state: !0 }
	};
	_pressTimer;
	_longPressFired = !1;
	_lastEntity;
	_lastState;
	_fetchGeneration = 0;
	constructor() {
		super(), this._items = [], this._loading = !1, this._assigneeId = "";
	}
	static styles = s`
    ${o(Q)}

    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }

    .header h2 {
      margin: 0;
    }

    .count {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #5c5c5c);
      white-space: nowrap;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .item {
      display: flex;
      align-items: stretch;
      gap: 0;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      overflow: hidden;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }

    .item.busy {
      opacity: 0.55;
      pointer-events: none;
    }

    button.complete {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      min-height: 48px;
      padding: 10px 12px;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    button.complete:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: -2px;
    }

    .summary {
      font-weight: 500;
      font-size: 0.95rem;
      line-height: 1.3;
    }

    .due {
      font-size: 0.8rem;
      color: var(--secondary-text-color, #5c5c5c);
    }

    .panel {
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, #fff);
    }

    .panel-title {
      margin: 0 0 8px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .actions button,
    .panel .close {
      font: inherit;
      font-size: 0.85rem;
      padding: 8px 12px;
      min-height: 40px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--primary-text-color, #212121);
      cursor: pointer;
    }

    .actions button.primary {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, #fff);
    }

    .assign-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      align-items: center;
    }

    .assign-row input {
      flex: 1;
      min-width: 120px;
      font: inherit;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--divider-color, #c8c8c8);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
    }

    @media (min-width: 768px) {
      .content {
        padding: 14px 18px 18px;
      }

      button.complete {
        min-height: 44px;
        padding: 12px 14px;
      }

      .summary {
        font-size: 1rem;
      }
    }
  `;
	static getConfigElement() {
		return document.createElement("chore-tracker-member-list-card-editor");
	}
	static getStubConfig() {
		return {
			type: "custom:chore-tracker-member-list-card",
			entity: "todo.household_chores",
			title: "Chores"
		};
	}
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-member-list-card config");
		if (!e.entity || typeof e.entity != "string") throw Error("chore-tracker-member-list-card requires an entity");
		this._config = e, this._items = [], this._error = void 0, this._action = void 0;
	}
	updated(e) {
		if (!this._config || !this.hass) return;
		let t = this._config.entity, n = this.hass.states[t]?.state, r = e.has("hass");
		(e.has("_config") || r && (t !== this._lastEntity || n !== this._lastState)) && (this._lastEntity = t, this._lastState = n, this._loadItems());
	}
	async _loadItems() {
		let e = this._config?.entity, t = this.hass;
		if (!e || !t) return;
		let n = ++this._fetchGeneration;
		this._loading = !0, this._error = void 0;
		try {
			let r = [];
			if (typeof t.callWS == "function") {
				let n = await t.callWS({
					type: "todo/item/list",
					entity_id: e
				});
				r = Array.isArray(n?.items) ? n.items : [];
			} else {
				let n = t.states[e]?.attributes?.items;
				r = Array.isArray(n) ? n : [];
			}
			if (n !== this._fetchGeneration) return;
			this._items = r.filter((e) => typeof e.uid == "string" && e.uid.length > 0 && e.status !== "completed");
		} catch (e) {
			if (n !== this._fetchGeneration) return;
			this._error = e instanceof Error ? e.message : "Failed to load chores", this._items = [];
		} finally {
			n === this._fetchGeneration && (this._loading = !1);
		}
	}
	_clearPressTimer() {
		this._pressTimer !== void 0 && (clearTimeout(this._pressTimer), this._pressTimer = void 0);
	}
	disconnectedCallback() {
		this._clearPressTimer(), super.disconnectedCallback();
	}
	_onPointerDown(e, t) {
		this._longPressFired = !1, this._clearPressTimer(), this._pressTimer = setTimeout(() => {
			this._longPressFired = !0, this._action = {
				uid: e,
				summary: t
			}, this._assigneeId = "";
		}, He);
	}
	_onPointerUp() {
		this._clearPressTimer();
	}
	_onPointerCancel() {
		this._clearPressTimer();
	}
	_onClick(e) {
		if (this._longPressFired) {
			this._longPressFired = !1;
			return;
		}
		this._busyUid === void 0 && this._complete(e);
	}
	_beginBusy(e) {
		return this._busyUid === void 0 && (this._busyUid = e, !0);
	}
	async _complete(e) {
		this._beginBusy(e) && (await this._callService("complete", { occurrence_id: e }), this._action = void 0);
	}
	async _skip(e) {
		this._beginBusy(e) && (await this._callService("skip", { occurrence_id: e }), this._action = void 0);
	}
	async _snooze(e) {
		if (!this._beginBusy(e)) return;
		let t = new Date(Date.now() + 864e5).toISOString();
		await this._callService("snooze", {
			occurrence_id: e,
			snooze_until: t
		}), this._action = void 0;
	}
	async _assign(e) {
		let t = this._assigneeId.trim();
		t && this._beginBusy(e) && (await this._callService("assign", {
			occurrence_id: e,
			assignee_id: t
		}), this._action = void 0);
	}
	async _callService(e, t) {
		let n = this.hass;
		if (!n) {
			this._busyUid = void 0;
			return;
		}
		this._error = void 0;
		try {
			await n.callService(Ue, e, t), await this._loadItems();
		} catch (t) {
			this._error = t instanceof Error ? t.message : `Failed to ${e}`;
		} finally {
			this._busyUid = void 0;
		}
	}
	_formatDue(e) {
		if (!e) return;
		let t = Date.parse(e);
		return Number.isNaN(t) ? e : new Date(t).toLocaleString(void 0, {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit"
		});
	}
	_title() {
		let e = this._config?.title;
		if (e) return e;
		let t = this._config?.entity;
		return t && this.hass?.states[t]?.attributes?.friendly_name ? String(this.hass.states[t].attributes?.friendly_name) : "Chores";
	}
	render() {
		if (!this._config) return L;
		let e = this._config.entity, t = this.hass && !this.hass.states[e];
		return F`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${this._title()}</h2>
            ${!this._loading && !t ? F`<span class="count">${this._items.length}</span>` : L}
          </div>
          ${t ? F`<p class="error">Entity not found: ${e}</p>` : L}
          ${this._error ? F`<p class="error">${this._error}</p>` : L}
          ${this._loading && this._items.length === 0 ? F`<p class="muted">Loading…</p>` : L}
          ${!this._loading && !t && this._items.length === 0 ? F`<p class="muted">No chores due.</p>` : L}
          ${this._items.length > 0 ? F`
                  <ul>
                    ${this._items.map((e) => this._renderItem(e))}
                  </ul>
                ` : L}
          ${this._action ? this._renderActionPanel(this._action) : L}
        </div>
      </ha-card>
    `;
	}
	_renderItem(e) {
		let t = e.uid, n = e.summary?.trim() || "Untitled chore", r = this._formatDue(e.due);
		return F`
      <li class="item ${this._busyUid === t ? "busy" : ""}">
        <button
          type="button"
          class="complete"
          aria-label=${`Complete ${n}`}
          @pointerdown=${() => this._onPointerDown(t, n)}
          @pointerup=${() => this._onPointerUp()}
          @pointerleave=${() => this._onPointerCancel()}
          @pointercancel=${() => this._onPointerCancel()}
          @click=${() => this._onClick(t)}
          @contextmenu=${(e) => {
			e.preventDefault(), this._longPressFired = !0, this._clearPressTimer(), this._action = {
				uid: t,
				summary: n
			}, this._assigneeId = "";
		}}
        >
          <span class="summary">${n}</span>
          ${r ? F`<span class="due">${r}</span>` : L}
        </button>
      </li>
    `;
	}
	_renderActionPanel(e) {
		return F`
      <div class="panel" role="dialog" aria-label="More actions">
        <p class="panel-title">${e.summary}</p>
        <div class="actions">
          <button type="button" class="primary" @click=${() => void this._complete(e.uid)}>
            Complete
          </button>
          <button type="button" @click=${() => void this._skip(e.uid)}>Skip</button>
          <button type="button" @click=${() => void this._snooze(e.uid)}>
            Snooze 1 day
          </button>
          <button type="button" class="close" @click=${() => {
			this._action = void 0;
		}}>
            Close
          </button>
        </div>
        <div class="assign-row">
          <input
            type="text"
            placeholder="Assignee id (optional)"
            .value=${this._assigneeId}
            @input=${(e) => {
			this._assigneeId = e.target.value;
		}}
          />
          <button type="button" @click=${() => void this._assign(e.uid)}>Assign</button>
        </div>
      </div>
    `;
	}
	getCardSize() {
		let e = this._items.length;
		return Math.min(6, Math.max(2, 1 + Math.ceil(e / 2)));
	}
};
customElements.get("chore-tracker-member-list-card") || customElements.define("chore-tracker-member-list-card", We);
//#endregion
//#region src/stub-card.ts
var Ge = class extends K {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    ${o(Q)}
  `;
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-stub-card config");
		this._config = e;
	}
	render() {
		return F`
      <ha-card>
        <div class="content">
          <h2>${this._config?.title ?? "Chore Tracker"}</h2>
          <p class="muted">Card pipeline stub for smoke tests. Use the member list or leaderboard cards on dashboards.</p>
        </div>
      </ha-card>
    `;
	}
	getCardSize() {
		return 1;
	}
};
customElements.get("chore-tracker-stub-card") || customElements.define("chore-tracker-stub-card", Ge), e({
	type: "chore-tracker-stub-card",
	name: "Chore Tracker Stub",
	description: "Placeholder confirming the Lovelace card build pipeline.",
	preview: !1
}), e({
	type: "chore-tracker-member-list-card",
	name: "Chore Tracker Member List",
	description: "Tap to complete chores from a member or household todo list.",
	preview: !0
}), e({
	type: "chore-tracker-freshness-card",
	name: "Chore Tracker Freshness",
	description: "Tody-style freshness bars by room or chore; tap to complete.",
	preview: !0
}), e({
	type: "chore-tracker-kiosk-card",
	name: "Chore Tracker Kiosk",
	description: "Wall-tablet member switcher with large complete buttons.",
	preview: !0
}), e({
	type: "chore-tracker-leaderboard-card",
	name: "Chore Tracker Leaderboard",
	description: "Fairness / points shell. Rankings arrive with household stats.",
	preview: !0
});
//#endregion
export { $ as ChoreTrackerFreshnessCard, Ie as ChoreTrackerKioskCard, Be as ChoreTrackerLeaderboardCard, We as ChoreTrackerMemberListCard, Ge as ChoreTrackerStubCard, e as registerCustomCard };
