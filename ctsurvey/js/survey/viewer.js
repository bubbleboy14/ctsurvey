survey.viewer = {
	_: {},
	init: function(survkey, cb) {
		CT.db.one(survkey, function(survey) {
			// load up the survey
			survey.core._.cur.survey = survey;
			survey.viewer.register(function() {
				survey.viewer.questionnaire();
				cb();
			});
		});
	},
	questionnaire: function() {
		// - questionnaire (->Profile)
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
							survey.viewer._.person = key;
							cb();
						}
					});
				})
			]
		})).show();
	}
};