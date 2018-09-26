survey.viewer = {
	_: {},
	init: function(survkey) {
		CT.db.one(survkey, function(surv) {
			// load up the survey
			survey.core._.cur.survey = surv;
			survey.viewer.register(survey.viewer.questionnaire);
		});
	},
	modal: function(content, cb) {
		var mod = new CT.modal.Modal({
			transition: "slide",
			content: content,
			noClose: true,
			slide: {
				origin: "right"
			}
		});
		mod.on.hide = cb;
		mod.show();
	},
	demq: function(d) {
		return [
			d.prompt,
			CT.dom.select(d.options, null, null, null, null, null, true)
		];
	},
	questionnaire: function() {
		// - questionnaire (->Profile)
		var cur = survey.core._.cur;
		CT.db.multi(cur.survey.demographics, function(demz) {
			var qnaire = CT.dom.div(demz.map(survey.viewer.demq));
			survey.viewer.modal(qnaire, function() {
				// save off profile
				survey.core.save({
					modelName: "profile",
					survey: _.survey.key,
					person: _.person,
					demographics: CT.dom.tag("select", qnaire).map(function(dq) {
						return dq.value();
					})
				}, survey.viewer.pages);
			});
		});
	},
	question: function(q) {
		return [
			q,
			survey.core.qfield(null, {
				blurs: ["what do you think?", "please respond thoughtfully", "thoughts?"]
			}, true)
		];
	},
	pages: function(with_questions) {
		// - pages (w/o questions, timed)
		// - pages (w/ questions)
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
		}), mod = new CT.modal.Modal({
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
					mod.hide();
					CT.net.post({
						path: "/_survey",
						params: {
							action: "register",
							zip: z,
							name: n,
							email: m
						}, cb: function(key) {
							survey.core._.cur.person = key;
							cb();
						}
					});
				})
			]
		})
		mod.show();
	}
};