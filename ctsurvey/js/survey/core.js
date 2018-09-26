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
				blurs: ["what's the question?", "question please", "type the question"]
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
	register: function(cb) {
		var qf = survey.core.qfield, uname = qf(null, {
			id: "uname",
			blurs: ["what's your name?", "what should we call you?", "name?", "who are you?"]
		}), umail = qf(null, {
			id: "umail",
			blurs: ["what's your email?", "email address?", "electronic mailing address?"]
		}), uzip = qf(null, {
			id: "uzip",
			blurs: ["what's your zipcode?", "zipcode please", "zipcode?", "what about your zipcode?"]
		});
		(new CT.modal.Modal({
			transition: "slide",
			noClose: true,
			content: [
				"tell us about yourself! name and email are optional. zipcode is required.",
				uname, umail, uzip, CT.dom.button("continue", function() {
					var n = CT.dom.getFieldValue("uname"),
						m = CT.dom.getFieldValue("umail"),
						z = CT.parse.stripToZip(CT.dom.getFieldValue("uzip"));
					if (!z)
						return alert("please enter a valid zipcode");
					CT.net.post({
						path: "/_survey",
						params: {
							action: "register",
							zip: z,
							name: n,
							email: m
						}, cb: function(key) {
							survey.core._.person = key;
							cb();
						}
					});
				})
			]
		})).show();
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