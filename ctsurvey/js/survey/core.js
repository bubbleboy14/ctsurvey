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
		surveys: CT.dom.div(null, "surveys"),
		questions: CT.dom.div(null, "questions"),
		newpage: CT.dom.button("new page", null, "right hidden")
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
			survey.core.setActive(newsurv);
		});
		newsurv.onclick();
		CT.dom.setContent(_.surveys, [
			newsurv,
			data.map(function(d) {
				var slink = CT.dom.link(d.title, function() {
					survey.core.edit(d);
					survey.core.setActive(slink);
				});
				return slink;
			})
		]);
		_.newpage.onclick = survey.core.newPage;
		return [
			_.surveys,
			CT.dom.div([
				_.newpage,
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
		var _ = survey.core._;
		if (!_.cursur.key) {
			_.cursur.key = data.key;
			survey.core.pages([CT.merge({
				survey: _.cursur.key
			}, _.blanks.page)]);
			var slink = CT.dom.link(data.title, function() {
				survey.core.edit(data);
				survey.core.setActive(slink);
			});
			_.surveys.lastElementChild.appendChild(slink);
		}
	},
	qfield: function(val, opts, ta) {
		if (typeof opts == "number") {
			var num = opts;
			opts = {
				cb: function(val) {
					var page = survey.core._.curpage;
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
	page: function(page) {
		var _ = survey.core._, qfield = survey.core.qfield, newq = qfield("", {
			cb: function(val) {
				newq.value = "";
				qz.appendChild(qfield(val, page.questions.length, true));
				page.questions[page.questions.length] = val;
				CT.dom.show(_.newpage);
				survey.core.save({
					key: page.key,
					modelName: "page",
					survey: page.survey,
					questions: page.questions
				}, function(data) {
					page.key = data.key;
				});
			}
		}, true), qz = CT.dom.div(page.questions.map(qfield));
		_.curpage = page;
		CT.dom.setContent(_.questions, [qz, newq]);
		CT.dom.setContent(_.images, page.images.map(CT.dom.img));
	},
	newPage: function() {
		var _ = survey.core._, pages = _.curpages, page = CT.merge({
			survey: _.cursur.key
		}, _.blanks.page), viewPage = function() {
			survey.core.page(page);
		};
		pages.push(page);
		CT.dom.addContent(_.pages.firstChild, CT.dom.link(pages.length, viewPage));
		CT.dom.hide(_.newpage);
		viewPage();
	},
	pages: function(pages) {
		var _ = survey.core._;
		_.curpages = pages;
		if (!pages.length) {
			CT.dom.clear(_.pages);
			return survey.core.newPage();
		}
		CT.dom.setContent(_.pages, pages.map(function(p, i) {
			return CT.dom.link(i + 1, function() {
				survey.core.page(p);
			});
		}));
		survey.core.page(pages[0]);
		CT.dom.show(_.newpage);
	},
	info: function() {
		var _ = survey.core._, qfield = survey.core.qfield, title = qfield(_.cursur.title, {
			blurs: ["what's the title?", "what do you call this survey?", "survey title?"],
			cb: function(val) {
				_.cursur.title = val;
				survey.core.save({
					key: _.cursur.key,
					user: _.cursur.user,
					modelName: "survey",
					title: val
				}, survey.core.setKey);
			}
		}), blurb = qfield(_.cursur.blurb, {
			blurs: ["what's the blurb?", "describe", "tell me more", "gimme some info"],
			cb: function(val) {
				if (!_.cursur.title)
					return alert("don't forget the title!");
				_.cursur.blurb = val;
				survey.core.save({
					key: _.cursur.key,
					blurb: val
				}, survey.core.setKey);
			}
		}, true);
		CT.dom.setContent(_.info, [title, blurb]);
	},
	setActive: function(slink) {
		var _ = survey.core._, cur = CT.dom.className("active", _.surveys);
		if (cur.length)
			cur[0].classList.remove("active");
		slink.classList.add("active");
	},
	edit: function(item) { // TODO: cache this....
		survey.core._.cursur = item;
		survey.core.info();
		item.key && CT.db.get("page", survey.core.pages, null, null, null, {
			survey: item.key
		});
	}
};