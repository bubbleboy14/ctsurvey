survey.viewer = {
	_: {},
	init: function(survkey) {
		CT.db.one(survkey, function(surv) {
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
		var cur = survey.core._.cur;
		CT.db.multi(cur.survey.demographics, function(demz) {
			var qnaire = CT.dom.div(demz.map(survey.viewer.demq));
			var mod = survey.core.modal([
				qnaire,
				CT.dom.button("continue", function() {
					mod.hide();
				})
			], function() {
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
	question: function(q, i) {
		var cur = survey.core._.cur, answer = {
			modelName: "answer",
			person: cur.person,
			page: cur.page.key,
			question: i
		};
		return [
			q,
			survey.core.qfield(null, {
				blurs: core.config.ctsurvey.blurs.answer,
				cb: function(val) {
					answer.response = val;
					survey.core.save(answer, function(adata) {
						answer.key = adata.key;
					});
				}
			}, true)
		];
	},
	page: function(page, cb, with_questions) {
		survey.core._.cur.page = page;
		CT.db.multi(page.images, function(imgz) {
			var butt, content;
			if (with_questions) {
				butt = CT.dom.button("continue", null, "automarg block");
				content = CT.dom.div([
					CT.dom.div(imgz.map(function(img) {
						return CT.dom.img(img.image);
					}), "right w1-4 h1 scrolly"),
					CT.dom.node({
						style: { width: "calc(100% - 26%)" },
						content: page.questions.map(survey.viewer.question),
					})
				], "h1 padded");
			}
			else {
				butt = CT.dom.button("wait", null, "abs ctr mosthigh", null, true);
				content = CT.dom.div(null, "full");
				var interval = core.config.ctsurvey.timeout * 1000;
				new CT.slider.Slider({
					parent: content,
					keys: false,
					navButtons: false,
					autoSlideInterval: interval,
					frames: imgz.map(function(img) {
						return img.image;
					})
				});
				setTimeout(function() {
					butt.disabled = false;
					butt.innerHTML = "continue";
				}, interval * imgz.length);
			}
			var mod = survey.core.modal(CT.dom.div([content, butt], "h1"), cb, true);
			butt.onclick = mod.hide;
			mod.show();
		});
	},
	eachPage: function(pages, cb, with_questions) {
		var pindex = 0;
		var repeater = function() {
			if (pindex == pages.length)
				return cb();
			survey.viewer.page(pages[pindex], function() {
				pindex += 1;
				repeater();
			}, with_questions);
		};
		repeater();
	},
	pages: function(pages, with_questions) {
		survey.viewer.eachPage(pages, function() {
			if (!with_questions)
				survey.viewer.pages(pages, true);
			else
				alert("you did it!");
		}, with_questions);
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