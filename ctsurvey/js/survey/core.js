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
		newpage: CT.dom.button("new page", null, "right hidden")
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
		if (typeof opts == "number") {
			var num = opts;
			opts = {
				cb: function(val) {
					var page = survey.core._.cur.page;
					page.questions[num] = val;
					survey.core.save({
						key: page.key,
						questions: page.questions
					});
				}
			};
		}
		return CT.dom.smartField(CT.merge({
			isTA: ta,
			value: val
		}, opts, survey.core._.blanks.question));
	},
	setActive: function(slink, section) {
		var _ = survey.core._, cur = CT.dom.className("active", section || _.surveys);
		if (cur.length)
			cur[0].classList.remove("active");
		slink.classList.add("active");
	}
};