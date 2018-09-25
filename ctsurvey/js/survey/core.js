survey.core = {
	_: {
		cur: {},
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
		pages: CT.dom.div(CT.dom.div(), "pages"),
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
		var _ = survey.core._, sur = _.cur.survey;
		if (!sur.key) {
			sur.key = data.key;
			survey.core.pages([CT.merge({
				survey: sur.key
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
	img: function(d) {
		var page = survey.core._.cur.page, n = CT.dom.div([
			CT.dom.link("delete", function() {
				if (confirm("really?")) {
					CT.dom.remove(n);
					CT.data.remove(page.images, d.key);
					survey.core.save({
						key: page.key,
						images: page.images
					});
				}
			}, null, "right"),
			CT.dom.img(d.image)
		]);
		return n;
	},
	images: function() {
		var _ = survey.core._, page = _.cur.page;
		CT.db.multi(page.images, function(imgz) {
			var inode = CT.dom.div(imgz.map(survey.core.img));
			CT.dom.setContent(_.images, [
				inode,
				CT.file.dragdrop(function(ctfile) {
					(new CT.modal.Prompt({
						transition: "slide",
						prompt: "please enter the reference link",
						cb: function(val) {
							survey.core.save({
								modelName: "image",
								link: val
							}, function(idata) {
								page.images.push(idata.key);
								survey.core.save({
									key: page.key,
									modelName: "page",
									survey: page.survey,
									images: page.images
								}, function(pdata) {
									page.key = pdata.key;
								});
								ctfile.upload("/_db", function(url) {
									idata.image = url;
									inode.appendChild(survey.core.img(idata));
								}, {
									action: "blob",
									key: idata.key,
									property: "image"
								});
							});
						}
					})).show();
				})
			]);
		});
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
		_.cur.page = page;
		CT.dom.show(_.images);
		CT.dom.show(_.questions);
		CT.dom.setContent(_.questions, [qz, newq]);
		survey.core.images();
	},
	newPage: function() {
		var _ = survey.core._, pages = _.cur.pages, page = CT.merge({
			survey: _.cur.survey.key
		}, _.blanks.page), viewPage = function() {
			survey.core.setActive(slink, _.pages.firstChild);
			survey.core.page(page);
		}, slink = CT.dom.link(pages.length + 1, viewPage);
		pages.push(page);
		CT.dom.addContent(_.pages.firstChild, slink);
		CT.dom.hide(_.newpage);
		viewPage();
	},
	pages: function(pages) {
		var _ = survey.core._;
		_.cur.pages = pages;
		if (!pages.length) {
			CT.dom.clear(_.pages.firstChild);
			return survey.core.newPage();
		}
		CT.dom.setContent(_.pages, pages.map(function(p, i) {
			var slink = CT.dom.link(i + 1, function() {
				survey.core.setActive(slink, _.pages.firstChild);
				survey.core.page(p);
			}, null, i || "active");
			return slink;
		}));
		survey.core.page(pages[0]);
		CT.dom.show(_.newpage);
	},
	info: function() {
		var _ = survey.core._, sur = _.cur.survey, qfield = survey.core.qfield, title = qfield(sur.title, {
			blurs: ["what's the title?", "what do you call this survey?", "survey title?"],
			cb: function(val) {
				sur.title = val;
				survey.core.save({
					key: sur.key,
					user: sur.user,
					modelName: "survey",
					title: val
				}, survey.core.setKey);
			}
		}), blurb = qfield(_.cur.survey.blurb, {
			blurs: ["what's the blurb?", "describe", "tell me more", "gimme some info"],
			cb: function(val) {
				if (!sur.title)
					return alert("don't forget the title!");
				sur.blurb = val;
				survey.core.save({
					key: sur.key,
					blurb: val
				}, survey.core.setKey);
			}
		}, true);
		CT.dom.setContent(_.info, [title, blurb]);
	},
	setActive: function(slink, section) {
		var _ = survey.core._, cur = CT.dom.className("active", section || _.surveys);
		if (cur.length)
			cur[0].classList.remove("active");
		slink.classList.add("active");
	},
	edit: function(item) { // TODO: cache this....
		var _ = survey.core._;
		_.cur.survey = item;
		survey.core.info();
		if (item.key) {
			CT.db.get("page", survey.core.pages, null, null, null, {
				survey: item.key
			});
		} else {
			CT.dom.hide(_.images);
			CT.dom.hide(_.questions);
			CT.dom.clear(_.pages.firstChild);
		}
	}
};