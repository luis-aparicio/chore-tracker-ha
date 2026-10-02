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
var v = globalThis, y = (e) => e, b = v.trustedTypes, se = b ? b.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, x = "$lit$", S = `lit$${Math.random().toFixed(9).slice(2)}$`, C = "?" + S, ce = `<${C}>`, w = document, T = () => w.createComment(""), E = (e) => e === null || typeof e != "object" && typeof e != "function", D = Array.isArray, le = (e) => D(e) || typeof e?.[Symbol.iterator] == "function", O = "[ 	\n\f\r]", k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, A = /-->/g, j = />/g, M = RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), N = /'/g, P = /"/g, F = /^(?:script|style|textarea|title)$/i, I = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), L = Symbol.for("lit-noChange"), R = Symbol.for("lit-nothing"), ue = /* @__PURE__ */ new WeakMap(), z = w.createTreeWalker(w, 129);
function de(e, t) {
	if (!D(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return se === void 0 ? t : se.createHTML(t);
}
var fe = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = k;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === k ? c[1] === "!--" ? o = A : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = M) : (F.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = M) : o = j : o === M ? c[0] === ">" ? (o = i ?? k, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? M : c[3] === "\"" ? P : N) : o === P || o === N ? o = M : o === A || o === j ? o = k : (o = M, i = void 0);
		let d = o === M && e[t + 1].startsWith("/>") ? " " : "";
		a += o === k ? n + ce : l >= 0 ? (r.push(s), n.slice(0, l) + x + n.slice(l) + S + d) : n + S + (l === -2 ? t : d);
	}
	return [de(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, B = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = fe(t, n);
		if (this.el = e.createElement(l, r), z.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = z.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(x)) {
					let t = u[o++], n = i.getAttribute(e).split(S), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? me : r[1] === "?" ? he : r[1] === "@" ? ge : U
					}), i.removeAttribute(e);
				} else e.startsWith(S) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (F.test(i.tagName)) {
					let e = i.textContent.split(S), t = e.length - 1;
					if (t > 0) {
						i.textContent = b ? b.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], T()), z.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], T());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === C) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(S, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += S.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = w.createElement("template");
		return n.innerHTML = e, n;
	}
};
function V(e, t, n = e, r) {
	if (t === L) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = E(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = V(e, i._$AS(e, t.values), i, r)), t;
}
var pe = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? w).importNode(t, !0);
		z.currentNode = r;
		let i = z.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new H(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new _e(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = z.nextNode(), a++);
		}
		return z.currentNode = w, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, H = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = R, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = V(this, e, t), E(e) ? e === R || e == null || e === "" ? (this._$AH !== R && this._$AR(), this._$AH = R) : e !== this._$AH && e !== L && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? le(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== R && E(this._$AH) ? this._$AA.nextSibling.data = e : this.T(w.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = B.createElement(de(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new pe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = ue.get(e.strings);
		return t === void 0 && ue.set(e.strings, t = new B(e)), t;
	}
	k(t) {
		D(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(T()), this.O(T()), this, this.options)) : r = n[i], r._$AI(a), i++;
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
}, U = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = R, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = R;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = V(this, e, t, 0), a = !E(e) || e !== this._$AH && e !== L, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = V(this, r[n + o], t, o), s === L && (s = this._$AH[o]), a ||= !E(s) || s !== this._$AH[o], s === R ? e = R : e !== R && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === R ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, me = class extends U {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === R ? void 0 : e;
	}
}, he = class extends U {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== R);
	}
}, ge = class extends U {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = V(this, e, t, 0) ?? R) === L) return;
		let n = this._$AH, r = e === R && n !== R || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== R && (n === R || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, _e = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		V(this, e);
	}
}, ve = v.litHtmlPolyfillSupport;
ve?.(B, H), (v.litHtmlVersions ??= []).push("3.3.3");
var ye = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new H(t.insertBefore(T(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, W = globalThis, G = class extends _ {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ye(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return L;
	}
};
G._$litElement$ = !0, G.finalized = !0, W.litElementHydrateSupport?.({ LitElement: G });
var be = W.litElementPolyfillSupport;
be?.({ LitElement: G }), (W.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/freshness.ts
function K(e, t, n = Date.now()) {
	let r = e.freshnessPct;
	if (typeof r == "number" && Number.isFinite(r)) return q(100 - r);
	let i = Math.max(1, t) * 24 * 60 * 60 * 1e3;
	if (e.lastCompletedAt == null) return 100;
	let a = Date.parse(e.lastCompletedAt);
	return Number.isNaN(a) ? 100 : q(Math.max(0, n - a) / i * 100);
}
function q(e) {
	return Number.isFinite(e) ? Math.min(100, Math.max(0, e)) : 0;
}
function xe(e) {
	let t = q(e);
	return t < 40 ? "var(--success-color, #4caf50)" : t < 75 ? "var(--warning-color, #ff9800)" : "var(--error-color, #db4437)";
}
function Se(e, t) {
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
var Ce = /^todo\.[a-z0-9_]+_chores(?:_\d+)?$/;
function we(e) {
	let t = e?.attributes?.member_id;
	return typeof t == "string" && t.length > 0 ? t : void 0;
}
function Te(e) {
	let t = [];
	for (let [n, r] of Object.entries(e.states)) {
		if (!n.startsWith("todo.")) continue;
		let i = e.entities?.[n]?.platform;
		(i ? i === "chore_tracker" : Ce.test(n)) && t.push(`${n}=${r.state}`);
	}
	return t.sort().join("|");
}
var J = "chore_tracker";
//#endregion
//#region src/shared.ts
async function Y(e, t, n) {
	let r = { occurrence_id: t };
	n?.configEntryId && (r.config_entry_id = n.configEntryId), n?.completedForMemberId && (r.completed_for_member_id = n.completedForMemberId), await e.callService(J, "complete", r);
}
async function Ee(e, t) {
	if (typeof e.callWS != "function") throw Error("Home Assistant WebSocket API is unavailable");
	let n = { type: "chore_tracker/kiosk_list" };
	t && (n.config_entry_id = t);
	let r;
	try {
		r = await e.callWS(n);
	} catch (e) {
		throw e?.code === "unknown_command" ? Error("Update the Chore Tracker integration to use this card version") : e;
	}
	return {
		members: Array.isArray(r?.members) ? r.members : [],
		rows: Array.isArray(r?.rows) ? r.rows : [],
		points: r?.points === !0,
		timezone: typeof r?.timezone == "string" ? r.timezone : "UTC",
		config_entry_id: typeof r?.config_entry_id == "string" ? r.config_entry_id : null
	};
}
async function De(e, t) {
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
function X(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !0
	}));
}
var Z = "\n  :host {\n    display: block;\n  }\n\n  ha-card {\n    display: block;\n    background: var(--ha-card-background, var(--card-background-color, #fff));\n    border-radius: var(--ha-card-border-radius, 12px);\n    box-shadow: var(--ha-card-box-shadow, none);\n    border: var(--ha-card-border-width, 1px) solid\n      var(--ha-card-border-color, var(--divider-color, #e0e0e0));\n    color: var(--primary-text-color, #212121);\n  }\n\n  .content {\n    padding: 12px 16px 16px;\n  }\n\n  h2 {\n    margin: 0 0 8px;\n    font-size: 1.05rem;\n    font-weight: 600;\n    color: var(--primary-text-color, #212121);\n  }\n\n  .muted {\n    margin: 0;\n    color: var(--secondary-text-color, #5c5c5c);\n    font-size: 0.9rem;\n    line-height: 1.4;\n  }\n\n  .error {\n    margin: 0;\n    color: var(--error-color, #db4437);\n    font-size: 0.9rem;\n  }\n";
function Q(e, t) {
	if (e instanceof Error && e.message) return e.message;
	let n = e?.message;
	return typeof n == "string" && n ? n : t;
}
//#endregion
//#region src/parseHorizonDays.ts
var Oe = /^-?\d+$/, ke = /^-?\d*[.,]\d+$/;
function Ae(e) {
	let t = e.trim();
	if (t === "") return {
		ok: !1,
		message: "Enter a number"
	};
	if (ke.test(t) || !Oe.test(t)) return {
		ok: !1,
		message: "Enter a whole number"
	};
	let n = Number(t);
	return Number.isSafeInteger(n) ? n < 1 ? {
		ok: !1,
		message: "Must be at least 1"
	} : {
		ok: !0,
		value: n
	} : {
		ok: !1,
		message: "Enter a whole number"
	};
}
//#endregion
//#region src/freshness-editor.ts
var je = [{
	value: "room",
	label: "Room"
}, {
	value: "chore",
	label: "Chore"
}], Me = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_horizonDraft: { state: !0 },
		_horizonError: { state: !0 },
		_horizonTouched: { state: !0 }
	};
	constructor() {
		super(), this._horizonDraft = "7", this._horizonError = void 0, this._horizonTouched = !1;
	}
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

    input[aria-invalid='true'] {
      border-color: var(--error-color, #db4437);
    }

    .error {
      font-size: 0.8rem;
      color: var(--error-color, #db4437);
    }
  `;
	setConfig(e) {
		this._config = { ...e };
		let t = e.horizon_days ?? 7;
		this._horizonDraft = String(t), this._horizonError = void 0, this._horizonTouched = !1;
	}
	_update(e) {
		if (!this._config) return;
		let t = {
			...this._config,
			...e
		};
		this._config = t, X(this, "config-changed", { config: t });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	_onReadOnlyChange(e) {
		let t = e.target;
		this._update({ read_only: t.checked || void 0 });
	}
	_onGroupByChange(e) {
		let t = e.target;
		this._update({ group_by: t.value });
	}
	_onHorizonInput(e) {
		let t = e.target.value;
		this._horizonDraft = t, this._horizonTouched = !0;
		let n = Ae(t);
		if (n.ok) {
			this._horizonError = void 0, this._update({ horizon_days: n.value });
			return;
		}
		this._horizonError = n.message;
	}
	_onHorizonBlur() {
		this._horizonTouched = !0;
		let e = Ae(this._horizonDraft);
		e.ok || (this._horizonError = e.message);
	}
	render() {
		if (!this._config) return R;
		let e = this._config.group_by ?? "room", t = this._horizonTouched && this._horizonError !== void 0;
		return I`
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
          ${je.map((t) => I`
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
          .value=${this._horizonDraft}
          aria-invalid=${t ? "true" : "false"}
          @input=${this._onHorizonInput}
          @blur=${this._onHorizonBlur}
        />
        ${t ? I`<span class="error">${this._horizonError}</span>` : R}
      </div>
      <div class="row">
        <label>
          <input
            id="read_only"
            type="checkbox"
            .checked=${this._config.read_only === !0}
            @change=${this._onReadOnlyChange}
          />
          Display only (tapping a bar does not complete the chore)
        </label>
      </div>
    `;
	}
};
customElements.get("chore-tracker-freshness-card-editor") || customElements.define("chore-tracker-freshness-card-editor", Me);
//#endregion
//#region src/freshness-card.ts
var Ne = class extends G {
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
    ${o(Z)}

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

    button.row,
    div.row {
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

    div.row {
      cursor: default;
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
			let n = await De(e, this._config?.config_entry_id);
			if (t !== this._fetchGeneration) return;
			this._rows = n.rows, this._resolvedEntryId = n.configEntryId ?? void 0;
		} catch (e) {
			if (t !== this._fetchGeneration) return;
			this._error = Q(e, "Failed to load freshness"), this._rows = [];
		} finally {
			t === this._fetchGeneration && (this._loading = !1);
		}
	}
	_beginBusy(e) {
		return this._busyId === void 0 && (this._busyId = e, !0);
	}
	async _complete(e) {
		let t = this.hass;
		if (t && this._config?.read_only !== !0 && this._beginBusy(e.occurrenceId)) {
			this._error = void 0;
			try {
				await Y(t, e.occurrenceId, { configEntryId: this._config?.config_entry_id ?? this._resolvedEntryId }), await this._load();
			} catch (e) {
				this._error = Q(e, "Failed to complete");
			} finally {
				this._busyId = void 0;
			}
		}
	}
	render() {
		if (!this._config) return R;
		this.hass;
		let e = this._config.title ?? "Freshness", t = this._horizon(), n = this._config.read_only === !0, r = this._groupBy(), i = Se(this._rows, r).map((e) => ({
			...e,
			rows: [...e.rows].sort((e, n) => {
				let r = K(e, t), i = K(n, t);
				return r === i ? e.title.localeCompare(n.title) : i - r;
			})
		})), a = !this._loading && this._rows.length === 0 && !this._error;
		return I`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${e}</h2>
            <span class="meta">${t}d horizon</span>
          </div>
          ${this._error ? I`<p class="error">${this._error}</p>` : R}
          ${this._loading && this._rows.length === 0 ? I`<p class="muted">Loading…</p>` : R}
          ${a ? I`<p class="empty">No chores to show freshness for.</p>` : R}
          ${i.map((e) => I`
              <div class="group">
                ${r === "room" ? I`<p class="group-label">${e.label}</p>` : R}
                <ul>
                  ${e.rows.map((e) => {
			let r = Math.round(K(e, t)), i = xe(r), a = I`
                      <div class="title-row">
                            <span class="title">${e.title}</span>
                            <span class="pct">${r}%</span>
                          </div>
                          <div class="bar" aria-hidden="true">
                            <div
                              class="fill"
                              style="width: ${r}%; background: ${i}"
                            ></div>
                          </div>
                    `;
			return I`
                      <li>
                        ${n ? I`<div class="row">${a}</div>` : I`
                                <button
                                  type="button"
                                  class="row ${this._busyId === e.occurrenceId ? "busy" : ""}"
                                  @click=${() => void this._complete(e)}
                                >
                                  ${a}
                                </button>
                              `}
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
customElements.get("chore-tracker-freshness-card") || customElements.define("chore-tracker-freshness-card", Ne);
//#endregion
//#region src/kiosk-format.ts
function Pe(e, t) {
	let n = (t) => new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(e), r;
	try {
		r = n(t);
	} catch {
		r = n("UTC");
	}
	let i = (e) => r.find((t) => t.type === e)?.value ?? "00";
	return {
		year: Number(i("year")),
		month: Number(i("month")),
		day: Number(i("day")),
		time: `${i("hour")}:${i("minute")}`
	};
}
function Fe(e) {
	return Math.round(Date.UTC(e.year, e.month - 1, e.day) / 864e5);
}
function Ie(e, t, n = /* @__PURE__ */ new Date()) {
	let r = Pe(e, t), i = Pe(n, t), a = Fe(r) - Fe(i);
	if (a < 0) {
		let e = -a;
		return e === 1 ? `Yesterday ${r.time}` : `${e} days overdue · ${r.time}`;
	}
	return a === 0 ? `Today ${r.time}` : a === 1 ? `Tomorrow ${r.time}` : `${new Date(Date.UTC(r.year, r.month - 1, r.day, 12)).toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		timeZone: "UTC"
	})} ${r.time}`;
}
function Le(e) {
	let t = e.trim().split(/\s+/).filter((e) => e.length > 0);
	return t.length === 0 ? "?" : t.length === 1 ? (t[0] ?? "").slice(0, 2).toUpperCase() : `${t[0]?.[0] ?? ""}${t[t.length - 1]?.[0] ?? ""}`.toUpperCase();
}
function Re(e) {
	let t = e.replace("#", "");
	if (t.length !== 6) return "#ffffff";
	let n = Number.parseInt(t.slice(0, 2), 16), r = Number.parseInt(t.slice(2, 4), 16), i = Number.parseInt(t.slice(4, 6), 16);
	return (.299 * n + .587 * r + .114 * i) / 255 > .6 ? "#1c1917" : "#fafaf9";
}
function ze(e) {
	if (e == null) return null;
	let t = e.trim();
	return t.startsWith("https://") || t.startsWith("http://") ? t : null;
}
//#endregion
//#region src/kiosk-editor.ts
var Be = class extends G {
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
		this._config = t, X(this, "config-changed", { config: t });
	}
	_onTitleInput(e) {
		let t = e.target.value.trim();
		this._update({ title: t || void 0 });
	}
	_onIdleInput(e) {
		let t = e.target.value.trim(), n = Number(t);
		if (t === "" || !Number.isFinite(n) || n < 0) {
			this._update({ idle_seconds: void 0 });
			return;
		}
		this._update({ idle_seconds: Math.round(n) });
	}
	render() {
		return this._config ? I`
      <div class="row">
        <label for="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder="Optional"
          @change=${this._onTitleInput}
        />
      </div>
      <div class="row">
        <label for="idle_seconds">Return to member picker after (seconds)</label>
        <input
          id="idle_seconds"
          type="number"
          min="0"
          step="1"
          .value=${String(this._config.idle_seconds ?? 60)}
          @change=${this._onIdleInput}
        />
      </div>
      <p class="hint">
        Members and chores come from the Chore Tracker household. Done credits the member
        picked on the card. Set config_entry_id when more than one Chore Tracker entry is
        loaded. 0 keeps the selected member until Home is tapped. No PIN.
      </p>
    ` : R;
	}
};
customElements.get("chore-tracker-kiosk-card-editor") || customElements.define("chore-tracker-kiosk-card-editor", Be);
//#endregion
//#region src/kiosk-card.ts
var Ve = 3e4, He = 60, Ue = 6e4, We = /^#[0-9a-f]{6}$/i, Ge = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 },
		_list: { state: !0 },
		_selectedId: { state: !0 },
		_hidden: { state: !0 },
		_undos: { state: !0 },
		_busy: { state: !0 },
		_loading: { state: !0 },
		_error: { state: !0 },
		_brokenAvatars: { state: !0 }
	};
	_lastSignature;
	_fetchGeneration = 0;
	_idleTimer;
	_undoTimer;
	_reloadTimer;
	_session = 0;
	_onActivity = () => this._armIdle();
	constructor() {
		super(), this._hidden = /* @__PURE__ */ new Set(), this._undos = [], this._busy = /* @__PURE__ */ new Set(), this._brokenAvatars = /* @__PURE__ */ new Set(), this._loading = !1;
	}
	static styles = s`
    ${o(Z)}

    .title {
      margin: 0 0 12px;
      font-size: 1.1rem;
      font-weight: 600;
    }

    h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
    }

    .lede {
      margin: 2px 0 0;
      color: var(--secondary-text-color, #5c5c5c);
      font-size: 0.95rem;
    }

    .member-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .member-heading {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .picker {
      list-style: none;
      margin: 16px 0 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
    }

    .picker button {
      width: 100%;
      min-height: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 12px;
      border: 1px solid var(--divider-color, #d4cdc3);
      border-radius: 10px;
      background: var(--secondary-background-color, #f5f5f5);
      color: inherit;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      touch-action: manipulation;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-grid;
      place-items: center;
      flex-shrink: 0;
      overflow: hidden;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: var(--secondary-background-color, #e8e2da);
      color: var(--secondary-text-color, #6b645c);
      border: 1px solid var(--divider-color, #d4cdc3);
    }

    .avatar.large {
      width: 72px;
      height: 72px;
      font-size: 1.1rem;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    ul.rows,
    ul.undos {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 8px;
    }

    ul.undos {
      margin-bottom: 12px;
    }

    .undo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--primary-color, #2f6f6a) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary-color, #2f6f6a) 30%, transparent);
    }

    .undo p {
      margin: 0;
      font-size: 0.9rem;
    }

    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid var(--divider-color, #d4cdc3);
      background: var(--card-background-color, #fff);
    }

    .row.overdue {
      border-color: color-mix(in srgb, var(--error-color, #9a3412) 40%, transparent);
    }

    .main {
      min-width: 0;
      display: grid;
      gap: 2px;
    }

    .row-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      margin: 0;
      font-size: 0.85rem;
      color: var(--secondary-text-color, #6b645c);
      overflow-wrap: anywhere;
    }

    .meta.overdue {
      color: var(--error-color, #9a3412);
      font-weight: 500;
    }

    .bar {
      margin-top: 6px;
      height: 4px;
      width: 100%;
      max-width: 12rem;
      border-radius: 2px;
      background: var(--divider-color, #d4cdc3);
      overflow: hidden;
    }

    .bar > span {
      display: block;
      height: 100%;
      background: var(--primary-color, #2f6f6a);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn {
      font: inherit;
      font-weight: 600;
      min-height: 44px;
      min-width: 72px;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      touch-action: manipulation;
    }

    .btn-primary {
      border: 1px solid var(--primary-color, #2f6f6a);
      background: var(--primary-color, #2f6f6a);
      color: var(--text-primary-color, #fff);
    }

    .btn-secondary {
      border: 1px solid var(--divider-color, #d4cdc3);
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--primary-text-color, #212121);
    }

    .btn:disabled {
      opacity: 0.55;
      cursor: default;
    }

    .btn:focus-visible,
    .picker button:focus-visible {
      outline: 2px solid var(--primary-color, #2f6f6a);
      outline-offset: 2px;
    }

    .empty {
      margin: 0;
      padding: 20px 14px;
      border-radius: 8px;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color, #5c5c5c);
      text-align: center;
    }

    @media (max-width: 420px) {
      .row {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
      }

      .row-title {
        white-space: normal;
      }

      .actions {
        grid-column: 1 / -1;
        justify-content: flex-end;
      }

      .actions .btn-primary {
        flex: 1 1 0;
      }
    }
  `;
	static getConfigElement() {
		return document.createElement("chore-tracker-kiosk-card-editor");
	}
	static getStubConfig() {
		return { type: "custom:chore-tracker-kiosk-card" };
	}
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-kiosk-card config");
		this._config = { ...e }, this._error = void 0;
	}
	connectedCallback() {
		super.connectedCallback(), this.addEventListener("pointerdown", this._onActivity), this.addEventListener("keydown", this._onActivity), this._armIdle(), this._expireUndos(), clearInterval(this._reloadTimer), this._reloadTimer = setInterval(() => void this._load(), Ue);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this.removeEventListener("pointerdown", this._onActivity), this.removeEventListener("keydown", this._onActivity), clearTimeout(this._idleTimer), clearTimeout(this._undoTimer), clearInterval(this._reloadTimer);
	}
	updated(e) {
		if (!this._config || !this.hass) return;
		let t = Te(this.hass);
		(e.has("_config") || t !== this._lastSignature) && (this._lastSignature = t, this._load());
	}
	get _entryId() {
		return this._config?.config_entry_id ?? this._list?.config_entry_id ?? void 0;
	}
	get _member() {
		return this._list?.members.find((e) => e.id === this._selectedId);
	}
	async _load() {
		let e = this.hass;
		if (!e) return;
		let t = ++this._fetchGeneration;
		this._loading = !0;
		try {
			let n = await Ee(e, this._config?.config_entry_id);
			if (t !== this._fetchGeneration) return;
			this._list = n, this._error = void 0;
			let r = new Set(n.rows.map((e) => e.occurrenceId)), i = new Set([...this._hidden].filter((e) => r.has(e)));
			i.size !== this._hidden.size && (this._hidden = i), this._selectedId && !n.members.some((e) => e.id === this._selectedId) && this._goHome();
		} catch (e) {
			if (t !== this._fetchGeneration) return;
			this._error = Q(e, "Failed to load chores");
		} finally {
			t === this._fetchGeneration && (this._loading = !1);
		}
	}
	_idleMs() {
		let e = Number(this._config?.idle_seconds ?? He);
		return Number.isFinite(e) && e > 0 ? e * 1e3 : 0;
	}
	_armIdle() {
		clearTimeout(this._idleTimer);
		let e = this._idleMs();
		this._selectedId && e !== 0 && (this._idleTimer = setTimeout(() => this._goHome(), e));
	}
	_select(e) {
		this._session += 1, this._selectedId = e, this._error = void 0, this._armIdle();
	}
	_goHome() {
		this._session += 1, clearTimeout(this._idleTimer), this._selectedId = void 0, this._undos = [], this._error = void 0;
	}
	_setBusy(e, t) {
		let n = new Set(this._busy);
		t ? n.add(e) : n.delete(e), this._busy = n;
	}
	_scheduleUndoExpiry() {
		clearTimeout(this._undoTimer);
		let e = this._undos.reduce((e, t) => e === void 0 ? t.expiresAt : Math.min(e, t.expiresAt), void 0);
		e !== void 0 && (this._undoTimer = setTimeout(() => this._expireUndos(), Math.max(0, e - Date.now())));
	}
	_expireUndos() {
		let e = Date.now(), t = this._undos.filter((t) => t.expiresAt > e);
		t.length !== this._undos.length && (this._undos = t), this._scheduleUndoExpiry();
	}
	async _done(e) {
		let t = this.hass, n = this._selectedId;
		if (!t || !n || this._busy.has(e.occurrenceId)) return;
		let r = this._session;
		this._setBusy(e.occurrenceId, !0), this._hidden = new Set(this._hidden).add(e.occurrenceId), this._error = void 0;
		try {
			if (await Y(t, e.occurrenceId, {
				configEntryId: this._entryId,
				completedForMemberId: n
			}), this._load(), r !== this._session) return;
			this._undos = [...this._undos.filter((t) => t.occurrenceId !== e.occurrenceId), {
				occurrenceId: e.occurrenceId,
				title: e.title,
				expiresAt: Date.now() + Ve
			}], this._scheduleUndoExpiry();
		} catch (t) {
			let n = new Set(this._hidden);
			n.delete(e.occurrenceId), this._hidden = n, r === this._session && (this._error = Q(t, "Failed to complete"));
		} finally {
			this._setBusy(e.occurrenceId, !1);
		}
	}
	async _claim(e) {
		let t = this.hass, n = this._member;
		if (t && n && !this._busy.has(e.occurrenceId)) {
			this._setBusy(e.occurrenceId, !0), this._error = void 0;
			try {
				let r = {
					occurrence_id: e.occurrenceId,
					assignee_id: n.id
				};
				this._entryId && (r.config_entry_id = this._entryId), await t.callService(J, "assign", r), this._list &&= {
					...this._list,
					rows: this._list.rows.map((t) => t.occurrenceId === e.occurrenceId ? {
						...t,
						assignee: n
					} : t)
				};
			} catch (e) {
				this._error = Q(e, "Failed to claim");
			} finally {
				this._setBusy(e.occurrenceId, !1);
			}
		}
	}
	async _undo(e) {
		let t = this.hass;
		if (t && !this._busy.has(e.occurrenceId)) {
			this._setBusy(e.occurrenceId, !0), this._error = void 0;
			try {
				let n = { occurrence_id: e.occurrenceId };
				this._entryId && (n.config_entry_id = this._entryId), await t.callService(J, "undo", n), this._undos = this._undos.filter((t) => t.occurrenceId !== e.occurrenceId);
				let r = new Set(this._hidden);
				r.delete(e.occurrenceId), this._hidden = r, await this._load();
			} catch (e) {
				this._error = Q(e, "Could not undo");
			} finally {
				this._setBusy(e.occurrenceId, !1);
			}
		}
	}
	_renderAvatar(e, t = !1) {
		let n = `avatar${t ? " large" : ""}`;
		if (!e) return I`<span class=${n} title="Unassigned" aria-hidden="true">-</span>`;
		let r = ze(e.avatar), i = r && !this._brokenAvatars.has(r) ? r : null, a = e.colour && We.test(e.colour) ? e.colour : null;
		return I`
      <span class=${n} style=${i || !a ? "" : `background:${a};color:${Re(a)};border-color:transparent`} aria-hidden="true">
        ${i ? I`<img
                src=${i}
                alt=""
                @error=${() => {
			this._brokenAvatars = new Set(this._brokenAvatars).add(i);
		}}
              />` : Le(e.displayName)}
      </span>
    `;
	}
	_renderPicker(e) {
		return I`
      <h2>Who is doing chores?</h2>
      <p class="lede">Tap your name to continue</p>
      <ul class="picker">
        ${e.map((e) => I`
            <li>
              <button type="button" @click=${() => this._select(e.id)}>
                ${this._renderAvatar(e, !0)}
                <span>${e.displayName}</span>
              </button>
            </li>
          `)}
      </ul>
    `;
	}
	_renderRow(e, t, n) {
		let r = e.dueAt ? new Date(e.dueAt) : void 0, i = r !== void 0 && r.getTime() < n.getTime(), a = e.decay && typeof e.freshnessPct == "number", o = a ? Math.round(q(e.freshnessPct)) : 0, s = [
			a ? `${o}% fresh` : r ? Ie(r, t.timezone, n) : "",
			e.assignee ? e.assignee.displayName : "Unassigned",
			t.points && e.points > 0 ? `${e.points} pts` : "",
			e.roomName ?? ""
		].filter((e) => e.length > 0), c = this._busy.has(e.occurrenceId), l = !e.assignee && (e.eligibleMemberIds == null || this._selectedId !== void 0 && e.eligibleMemberIds.includes(this._selectedId));
		return I`
      <li class="row${i ? " overdue" : ""}">
        ${this._renderAvatar(e.assignee)}
        <div class="main">
          <p class="row-title">${e.title}</p>
          <p class="meta${i ? " overdue" : ""}">${s.join(" · ")}</p>
          ${a ? I`<div
                  class="bar"
                  role="meter"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow=${o}
                  aria-label="Freshness ${o} percent"
                ><span style="width:${o}%"></span></div>` : R}
        </div>
        <div class="actions">
          ${l ? I`<button
                  type="button"
                  class="btn btn-secondary"
                  ?disabled=${c}
                  @click=${() => void this._claim(e)}
                >Claim</button>` : R}
          <button
            type="button"
            class="btn btn-primary"
            ?disabled=${c}
            @click=${() => void this._done(e)}
          >Done</button>
        </div>
      </li>
    `;
	}
	_renderMember(e, t) {
		let n = /* @__PURE__ */ new Date(), r = t.rows.filter((e) => !this._hidden.has(e.occurrenceId));
		return I`
      <div class="member-header">
        <div class="member-heading">
          ${this._renderAvatar(e)}
          <div>
            <h2>${e.displayName}</h2>
            <p class="lede">Tap Done when finished</p>
          </div>
        </div>
        <button type="button" class="btn btn-secondary" @click=${() => this._goHome()}>
          Home
        </button>
      </div>
      ${this._undos.length > 0 ? I`<ul class="undos" aria-live="polite">
              ${this._undos.map((e) => I`
                  <li class="undo">
                    <p>Done: <strong>${e.title}</strong></p>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      ?disabled=${this._busy.has(e.occurrenceId)}
                      @click=${() => void this._undo(e)}
                    >Undo</button>
                  </li>
                `)}
            </ul>` : R}
      ${r.length === 0 ? I`<p class="empty">Nothing due today.</p>` : I`<ul class="rows">${r.map((e) => this._renderRow(e, t, n))}</ul>`}
    `;
	}
	render() {
		if (!this._config) return R;
		let e = this._list, t = this._member;
		return I`
      <ha-card>
        <div class="content">
          ${this._config.title ? I`<p class="title">${this._config.title}</p>` : R}
          ${this._error ? I`<p class="error">${this._error}</p>` : R}
          ${e ? e.members.length === 0 ? I`<p class="empty">No household members found.</p>` : t ? this._renderMember(t, e) : this._renderPicker(e.members) : this._loading ? I`<p class="muted">Loading…</p>` : R}
        </div>
      </ha-card>
    `;
	}
};
customElements.get("chore-tracker-kiosk-card") || customElements.define("chore-tracker-kiosk-card", Ge);
//#endregion
//#region src/leaderboard-editor.ts
var Ke = [
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
], qe = class extends G {
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
		this._config = t, X(this, "config-changed", { config: t });
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
		if (!this._config) return R;
		let e = this._config.period ?? "week";
		return I`
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
          ${Ke.map((t) => I`
              <option value=${t.value} ?selected=${t.value === e}>
                ${t.label}
              </option>
            `)}
        </select>
      </div>
    `;
	}
};
customElements.get("chore-tracker-leaderboard-card-editor") || customElements.define("chore-tracker-leaderboard-card-editor", qe);
//#endregion
//#region src/leaderboard-card.ts
var Je = {
	week: "This week",
	month: "This month",
	all_time: "All time"
}, Ye = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    ${o(Z)}

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
		if (!this._config) return R;
		let e = this._config.title ?? "Leaderboard", t = this._period();
		return this.hass, I`
      <ha-card>
        <div class="content">
          <h2>${e}</h2>
          <span class="period">${Je[t]}</span>
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
customElements.get("chore-tracker-leaderboard-card") || customElements.define("chore-tracker-leaderboard-card", Ye);
//#endregion
//#region src/member-list-editor.ts
var Xe = class extends G {
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
		this._config = t, X(this, "config-changed", { config: t });
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
		return this._config ? I`
      <div class="row">
        <label for="entity">Todo entity</label>
        ${customElements.get("ha-entity-picker") === void 0 ? I`
                <input
                  id="entity"
                  type="text"
                  .value=${this._config.entity ?? ""}
                  placeholder="todo.member_chores"
                  @change=${this._onEntityInput}
                />
              ` : I`
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
    ` : R;
	}
};
customElements.get("chore-tracker-member-list-card-editor") || customElements.define("chore-tracker-member-list-card-editor", Xe);
//#endregion
//#region src/member-list-card.ts
var Ze = 500, Qe = "chore_tracker", $ = class extends G {
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
    ${o(Z)}

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
			this._error = Q(e, "Failed to load chores"), this._items = [];
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
		}, Ze);
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
		if (!this._beginBusy(e)) return;
		let t = we(this.hass?.states[this._config?.entity ?? ""]);
		await this._callService("complete", {
			occurrence_id: e,
			...t ? { completed_for_member_id: t } : {}
		}), this._action = void 0;
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
			await n.callService(Qe, e, t), await this._loadItems();
		} catch (t) {
			this._error = Q(t, `Failed to ${e}`);
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
		if (!this._config) return R;
		let e = this._config.entity, t = this.hass && !this.hass.states[e];
		return I`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${this._title()}</h2>
            ${!this._loading && !t ? I`<span class="count">${this._items.length}</span>` : R}
          </div>
          ${t ? I`<p class="error">Entity not found: ${e}</p>` : R}
          ${this._error ? I`<p class="error">${this._error}</p>` : R}
          ${this._loading && this._items.length === 0 ? I`<p class="muted">Loading…</p>` : R}
          ${!this._loading && !t && this._items.length === 0 ? I`<p class="muted">No chores due.</p>` : R}
          ${this._items.length > 0 ? I`
                  <ul>
                    ${this._items.map((e) => this._renderItem(e))}
                  </ul>
                ` : R}
          ${this._action ? this._renderActionPanel(this._action) : R}
        </div>
      </ha-card>
    `;
	}
	_renderItem(e) {
		let t = e.uid, n = e.summary?.trim() || "Untitled chore", r = this._formatDue(e.due);
		return I`
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
          ${r ? I`<span class="due">${r}</span>` : R}
        </button>
      </li>
    `;
	}
	_renderActionPanel(e) {
		return I`
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
customElements.get("chore-tracker-member-list-card") || customElements.define("chore-tracker-member-list-card", $);
//#endregion
//#region src/stub-card.ts
var $e = class extends G {
	static properties = {
		hass: { attribute: !1 },
		_config: { state: !0 }
	};
	static styles = s`
    ${o(Z)}
  `;
	setConfig(e) {
		if (!e || typeof e != "object") throw Error("Invalid chore-tracker-stub-card config");
		this._config = e;
	}
	render() {
		return I`
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
customElements.get("chore-tracker-stub-card") || customElements.define("chore-tracker-stub-card", $e), e({
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
export { Ne as ChoreTrackerFreshnessCard, Ge as ChoreTrackerKioskCard, Ye as ChoreTrackerLeaderboardCard, $ as ChoreTrackerMemberListCard, $e as ChoreTrackerStubCard, e as registerCustomCard };
