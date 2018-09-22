survey.core = {
	_: {
		blanks: {
			survey: {
				title: "",
				blurb: ""
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
		pages: CT.dom.div(null, "pages"),
		images: CT.dom.div(null, "images"),
		questions: CT.dom.div(null, "questions")
	},
	init: function(pw) {
		survey.core._.pw = pw;
		CT.db.get("survey", function(data) {
			CT.dom.setContent("ctmain", survey.core.editor(data));
		});
	},
	editor: function(data) {
		var _ = survey.core._, newsurv = CT.dom.link("new survey", function() {
			survey.core.edit(CT.merge({
				user: user.core.get("key")
			}, _.blanks.survey));
		});
		newsurv.onclick();
		return [
			CT.dom.div([
				newsurv,
				data.map(function(d) {
					return CT.dom.link(d.title, function() {
						survey.core.edit(d);
					});
				})
			], "surveys"),
			CT.dom.div([
				survey.core._.pages,
				CT.dom.div([
					_.info,
					_.images,
					_.questions
				], "page")
			], "main")
		];
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
	setKey: function(data) {
		if (!survey.core._.cursor.key) {
			survey.core._.cursor.key = data.key;
			survey.core.pages([CT.merge({
				survey: _.cursur.key
			}, _.blanks.page)]);
		}
	},
	qfield: function(val, opts) {
		return CT.dom.smartField(CT.merge({
			value: val
		}, opts, _.blanks.question));
	},
	page: function(page) {
		var _ = survey.core._, qfield = survey.core.qfield, newq = qfield("", {
			isTA: true,
			cb: function(val) {
				newq.value = "";
				qz.appendChild(qfield(val, { isTA: true }));
			}
		}), qz = CT.dom.div(page.questions.map(qfield));

		CT.dom.setContent(_.questions, [qz, newq]);
		CT.dom.setContent(_.images, page.images.map(CT.dom.img));
	},
	pages: function(pages) {
		CT.dom.setContent(survey.core._.pages, pages.map(function(p, i) {
			return CT.dom.link(i + 1, function() {
				survey.core.page(p);
			});
		}));
		survey.core.page(pages[0]);
	},
	info: function() {
		var _ = survey.core._, qfield = survey.core.qfield, title = qfield(_.cursur.title, {
			blurs: ["what's the title?", "what do you call this survey?", "survey title?"],
			cb: function(val) {
				_.cursur.title = val;
				survey.core.save({
					key: _.cursur.key,
					title: val
				}, survey.core.setKey);
			}
		}), blurb = qfield(_.cursur.blurb, {
			isTA: true,
			blurs: ["what's the blurb?", "describe", "tell me more", "gimme some info"],
			cb: function(val) {
				_.cursur.blurb = val;
				survey.core.save({
					key: _.cursur.key,
					blurb: val
				}, survey.core.setKey);
			}
		});
		CT.dom.setContent(_.info, [title, blurb]);
	},
	edit: function(item) { // TODO: cache this....
		survey.core._.cursur = item;
		survey.core.info();
		item.key && CT.db.get("page", survey.core.pages, null, null, null, {
			survey: item.key
		});
	}
};