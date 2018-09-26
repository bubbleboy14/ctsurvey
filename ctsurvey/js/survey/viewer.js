survey.viewer = {
	_: {},
	init: function(survkey) {
		CT.db.one(survkey, function(surv) {
			// load up the survey
			survey.core._.cur.survey = surv;
			survey.core._.pw = core.config.ctsurvey.apikey;
			survey.viewer.register(survey.viewer.questionnaire);
		});
	},
	demq: function(d, i) {
		var surv = survey.core._.cur.survey,
			demz = core.config.ctsurvey.surveys[surv.title].demographics,
			dem = demz[i] || {}, other = dem.other, extra = dem.extra || "";
		return [
			d.prompt, extra,
			CT.dom.select(d.options, null, null, null, null, null, other)
		];
	},
	questionnaire: function() {
		// - questionnaire (->Profile)
		var cur = survey.core._.cur;
		CT.db.multi(cur.survey.demographics, function(demz) {
			var qnaire = CT.dom.div(demz.map(survey.viewer.demq));
			var mod = survey.core.modal([
				qnaire,
				CT.dom.button("continue", function() {
					mod.hide();
				})
			], function() {
				// save off profile
				survey.core.save({
					modelName: "profile",
					survey: cur.survey.key,
					person: cur.person,
					demographics: CT.dom.tag("select", qnaire).map(function(dq) {
						var val = dq.value;
						if (val == "other")
							return dq.container.value();
						return val;
					})
				}, function() {
					var intro = survey.core.modal([
						CT.dom.div(cur.survey.title, "title"),
						CT.dom.div(cur.survey.blurb, "blurb"),
						CT.dom.button("continue", function() {
							intro.hide();
						})
					], function() {
						CT.db.get("page", survey.viewer.pages, null, null, null, {
							survey: cur.survey.key
						});
					});
				});
			});
		});
	},
	question: function(q) {
		return [
			q,
			survey.core.qfield(null, {
				blurs: core.config.ctsurvey.blurs.answer
			}, true)
		];
	},
	page: function(page, with_questions) {
		// add pictures
		CT.db.multi(page.images, function(imgz) {
			survey.core.modal(imgz.map(function(img) {
				return CT.dom.img(img.image);
			}))
		});

		if (with_questions) {
			// add questions

		} else {
			// set timer to enable button
			// cycle back after w/ qz
		}
	},
	pages: function(pages, with_questions) {

	},
	register: function(cb) {
		var qf = survey.core.qfield, blurs = core.config.ctsurvey.blurs;
		var uname = qf(null, {
			id: "uname",
			blurs: blurs.name
		}), umail = qf(null, {
			id: "umail",
			blurs: blurs.email
		}), uzip = qf(null, {
			id: "uzip",
			blurs: blurs.zip
		}), mod = new CT.modal.Modal({
			transition: "slide",
			noClose: true,
			content: [
				CT.dom.div(core.config.ctsurvey.profile_prompt, "profile_prompt"),
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