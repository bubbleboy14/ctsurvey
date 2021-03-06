survey.core = {
	_: {
		cur: {},
		blanks: {
			survey: {
				title: "",
				blurb: "",
				demographics: []
			},
			page: {
				images: [],
				questions: []
			},
			question: {
				classname: "w1",
				blurs: core.config.ctsurvey.blurs.question
			}
		},
		info: CT.dom.div(null, "info"),
		demos: CT.dom.div(null, "demos"),
		pages: CT.dom.div(CT.dom.div(), "pages"),
		images: CT.dom.div(null, "images"),
		surveys: CT.dom.div(null, "surveys"),
		questions: CT.dom.div(null, "questions"),
		newpage: CT.dom.button("new page", null, "right hidden"),
		getanswers: CT.dom.button("get answers", null, "right hidden")
	},
	hash: function() {
		var hash = location.hash.slice(1);
		if (!hash) {
			if (core.config.ctsurvey.default_survey) {
				hash = CT.db.get("survey", null, null, null, null, {
					title: core.config.ctsurvey.default_survey
				}, true)[0].key;
			} else
				location = "/"; // whatever, kick em back
		}
		return hash;
	},
	zip: function(z) {
		return [z.state, z.county, z.city, z.code].join(", ");
	},
	modal: function(content, cb, lightbox, closeonclick) {
		var mod = new CT.modal[lightbox ? "LightBox" : "Modal"]({
			transition: lightbox ? "fade" : "slide",
			content: content,
			noClose: true,
			outerClose: false,
			slide: {
				origin: "right"
			},
			onclick: closeonclick && function() {
				mod.hide();
			}
		});
		if (cb)
			mod.on.hide = cb;
		mod.show();
		return mod;
	},
	save: function(obj, cb) {
		CT.net.post({
			path: "/_db",
			params: {
				action: "edit",
				pw: survey.core._.pw,
				data: obj
			},
			cb: cb
		});
	},
	qfield: function(val, opts, ta) {
		if (typeof opts == "number")
			opts = { cb: opts };
		if (typeof opts.cb == "number") {
			var num = opts.cb;
			opts.cb = function(val) {
				var page = survey.core._.cur.page;
				page.questions[num] = val;
				survey.core.save({
					key: page.key,
					questions: page.questions
				});
			};
		}
		var f = CT.dom.smartField(CT.merge({
			isTA: ta,
			value: val,
			noBreak: true
		}, opts, survey.core._.blanks.question));
		f._submit = opts.cb;
		return f;
	},
	setActive: function(slink, section) {
		var _ = survey.core._, cur = CT.dom.className("active", section || _.surveys);
		if (cur.length)
			cur[0].classList.remove("active");
		slink.classList.add("active");
	}
};