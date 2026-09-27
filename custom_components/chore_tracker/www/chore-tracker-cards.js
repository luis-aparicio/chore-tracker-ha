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
}, g = (e, t) => !u(e, t), _ = {
	attribute: !0,
	type: String,
	converter: h,
	reflect: !1,
	useDefault: !1,
	hasChanged: g
};
Symbol.metadata ??= Symbol("metadata"), f.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = _) {
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
		return this.elementProperties.get(e) ?? _;
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[m("elementProperties")] = /* @__PURE__ */ new Map(), v[m("finalized")] = /* @__PURE__ */ new Map(), ae?.({ ReactiveElement: v }), (f.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region ../../node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, oe = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, se = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", A = "[ 	\n\f\r]", j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, M = /-->/g, N = />/g, P = RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), F = /'/g, I = /"/g, L = /^(?:script|style|textarea|title)$/i, R = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), z = Symbol.for("lit-noChange"), B = Symbol.for("lit-nothing"), V = /* @__PURE__ */ new WeakMap(), H = E.createTreeWalker(E, 129);
function U(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var ce = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === j ? c[1] === "!--" ? o = M : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (L.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = N : o === P ? c[0] === ">" ? (o = i ?? j, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? I : F) : o === I || o === F ? o = P : o === M || o === N ? o = j : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === j ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [U(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, W = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ce(t, n);
		if (this.el = e.createElement(l, r), H.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = H.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ue : r[1] === "?" ? de : r[1] === "@" ? fe : q
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (L.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), H.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function G(e, t, n = e, r) {
	if (t === z) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = G(e, i._$AS(e, t.values), i, r)), t;
}
var le = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		H.currentNode = r;
		let i = H.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new K(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new pe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = H.nextNode(), a++);
		}
		return H.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, K = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = B, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = G(this, e, t), O(e) ? e === B || e == null || e === "" ? (this._$AH !== B && this._$AR(), this._$AH = B) : e !== this._$AH && e !== z && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== B && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = W.createElement(U(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new le(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = V.get(e.strings);
		return t === void 0 && V.set(e.strings, t = new W(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, q = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = B, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = B;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = G(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== z, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = G(this, r[n + o], t, o), s === z && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === B ? e = B : e !== B && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === B ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ue = class extends q {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === B ? void 0 : e;
	}
}, de = class extends q {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== B);
	}
}, fe = class extends q {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = G(this, e, t, 0) ?? B) === z) return;
		let n = this._$AH, r = e === B && n !== B || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== B && (n === B || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, pe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		G(this, e);
	}
}, me = y.litHtmlPolyfillSupport;
me?.(W, K), (y.litHtmlVersions ??= []).push("3.3.3");
var he = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new K(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, J = globalThis, Y = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = he(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return z;
	}
};
Y._$litElement$ = !0, Y.finalized = !0, J.litElementHydrateSupport?.({ LitElement: Y });
var ge = J.litElementPolyfillSupport;
ge?.({ LitElement: Y }), (J.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region src/types.ts
function X(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !0
	}));
}
var Z = "\n  :host {\n    display: block;\n  }\n\n  ha-card {\n    display: block;\n    background: var(--ha-card-background, var(--card-background-color, #fff));\n    border-radius: var(--ha-card-border-radius, 12px);\n    box-shadow: var(--ha-card-box-shadow, none);\n    border: var(--ha-card-border-width, 1px) solid\n      var(--ha-card-border-color, var(--divider-color, #e0e0e0));\n    color: var(--primary-text-color, #212121);\n  }\n\n  .content {\n    padding: 12px 16px 16px;\n  }\n\n  h2 {\n    margin: 0 0 8px;\n    font-size: 1.05rem;\n    font-weight: 600;\n    color: var(--primary-text-color, #212121);\n  }\n\n  .muted {\n    margin: 0;\n    color: var(--secondary-text-color, #5c5c5c);\n    font-size: 0.9rem;\n    line-height: 1.4;\n  }\n\n  .error {\n    margin: 0;\n    color: var(--error-color, #db4437);\n    font-size: 0.9rem;\n  }\n", _e = [
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
], ve = class extends Y {
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
		if (!this._config) return B;
		let e = this._config.period ?? "week";
		return R`
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
          ${_e.map((t) => R`
              <option value=${t.value} ?selected=${t.value === e}>
                ${t.label}
              </option>
            `)}
        </select>
      </div>
    `;
	}
};
customElements.get("chore-tracker-leaderboard-card-editor") || customElements.define("chore-tracker-leaderboard-card-editor", ve);
//#endregion
//#region src/leaderboard-card.ts
var ye = {
	week: "This week",
	month: "This month",
	all_time: "All time"
}, Q = class extends Y {
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
		if (!this._config) return B;
		let e = this._config.title ?? "Leaderboard", t = this._period();
		return this.hass, R`
      <ha-card>
        <div class="content">
          <h2>${e}</h2>
          <span class="period">${ye[t]}</span>
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
customElements.get("chore-tracker-leaderboard-card") || customElements.define("chore-tracker-leaderboard-card", Q);
//#endregion
//#region src/member-list-editor.ts
var be = class extends Y {
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
		return this._config ? R`
      <div class="row">
        <label for="entity">Todo entity</label>
        ${customElements.get("ha-entity-picker") === void 0 ? R`
                <input
                  id="entity"
                  type="text"
                  .value=${this._config.entity ?? ""}
                  placeholder="todo.member_chores"
                  @change=${this._onEntityInput}
                />
              ` : R`
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
    ` : B;
	}
};
customElements.get("chore-tracker-member-list-card-editor") || customElements.define("chore-tracker-member-list-card-editor", be);
//#endregion
//#region src/member-list-card.ts
var xe = 500, Se = "chore_tracker", Ce = class extends Y {
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
		}, xe);
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
		this._complete(e);
	}
	async _complete(e) {
		await this._callService("complete", { occurrence_id: e }, e), this._action = void 0;
	}
	async _skip(e) {
		await this._callService("skip", { occurrence_id: e }, e), this._action = void 0;
	}
	async _snooze(e) {
		let t = new Date(Date.now() + 864e5).toISOString();
		await this._callService("snooze", {
			occurrence_id: e,
			snooze_until: t
		}, e), this._action = void 0;
	}
	async _assign(e) {
		let t = this._assigneeId.trim();
		t && (await this._callService("assign", {
			occurrence_id: e,
			assignee_id: t
		}, e), this._action = void 0);
	}
	async _callService(e, t, n) {
		let r = this.hass;
		if (r) {
			this._busyUid = n, this._error = void 0;
			try {
				await r.callService(Se, e, t), await this._loadItems();
			} catch (t) {
				this._error = t instanceof Error ? t.message : `Failed to ${e}`;
			} finally {
				this._busyUid = void 0;
			}
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
		if (!this._config) return B;
		let e = this._config.entity, t = this.hass && !this.hass.states[e];
		return R`
      <ha-card>
        <div class="content">
          <div class="header">
            <h2>${this._title()}</h2>
            ${!this._loading && !t ? R`<span class="count">${this._items.length}</span>` : B}
          </div>
          ${t ? R`<p class="error">Entity not found: ${e}</p>` : B}
          ${this._error ? R`<p class="error">${this._error}</p>` : B}
          ${this._loading && this._items.length === 0 ? R`<p class="muted">Loading…</p>` : B}
          ${!this._loading && !t && this._items.length === 0 ? R`<p class="muted">No chores due.</p>` : B}
          ${this._items.length > 0 ? R`
                  <ul>
                    ${this._items.map((e) => this._renderItem(e))}
                  </ul>
                ` : B}
          ${this._action ? this._renderActionPanel(this._action) : B}
        </div>
      </ha-card>
    `;
	}
	_renderItem(e) {
		let t = e.uid, n = e.summary?.trim() || "Untitled chore", r = this._formatDue(e.due);
		return R`
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
          ${r ? R`<span class="due">${r}</span>` : B}
        </button>
      </li>
    `;
	}
	_renderActionPanel(e) {
		return R`
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
customElements.get("chore-tracker-member-list-card") || customElements.define("chore-tracker-member-list-card", Ce);
//#endregion
//#region src/stub-card.ts
var $ = class extends Y {
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
		return R`
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
customElements.get("chore-tracker-stub-card") || customElements.define("chore-tracker-stub-card", $), e({
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
	type: "chore-tracker-leaderboard-card",
	name: "Chore Tracker Leaderboard",
	description: "Fairness / points shell. Rankings arrive with household stats.",
	preview: !0
});
//#endregion
export { Q as ChoreTrackerLeaderboardCard, Ce as ChoreTrackerMemberListCard, $ as ChoreTrackerStubCard, e as registerCustomCard };
