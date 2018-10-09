survey.editor = {
	_: {
		editors: {
			page: CT.dom.div(),
			questionnaire: CT.dom.div(),
			tabs: CT.dom.div(null, "section_tabs")
		},
		newhide: function() {
			var _ = survey.editor._;
			_.editors.tabs.firstChild.firstChild.onclick();
			_.editors.tabs.firstChild.lastChild.style.display = "none";
		},
		newshow: function() {
			survey.editor._.editors.tabs.firstChild.lastChild.style.display = "inline";
		}
	},
	init: function(pw) {
		survey.core._.pw = pw;
		CT.db.get("survey", function(data) {
			CT.dom.setContent("ctmain", survey.editor.editor(data));
		});
	},
	editor: function(data) {
		var _ = survey.core._, newsurv = CT.dom.link("new survey", function() {
			survey.editor.edit(CT.merge({
				user: user.core.get("key")
			}, _.blanks.survey));
			survey.core.setActive(newsurv);
		}), editors = survey.editor._.editors;
		CT.dom.setContent(_.surveys, [
			newsurv,
			data.map(function(d) {
				var slink = CT.dom.link(d.title, function() {
					survey.editor.edit(d);
					survey.core.setActive(slink);
				});
				return slink;
			})
		]);
		CT.dom.setContent(editors.tabs, ["questionnaire", "page"].map(function(sec, i) {
			var slink = CT.dom.link(sec, function() {
				survey.core.setActive(slink, editors.tabs);
				var ispage = sec == "page";
				CT.dom.show(editors[ispage && "page" || "questionnaire"]);
				CT.dom.hide(editors[ispage && "questionnaire" || "page"]);
			}, null, i || "active");
			return slink;
		}));
		CT.dom.setContent(editors.page, [
			_.newpage,
			_.getanswers,
			_.pages,
			CT.dom.div([
				_.images,
				_.questions
			], "page")
		]);
		CT.dom.setContent(editors.questionnaire, [
			_.info,
			_.demos
		]);
		_.newpage.onclick = survey.editor.newPage;
		_.getanswers.onclick = survey.editor.getAnswers;
		newsurv.onclick();
		return [
			_.surveys,
			CT.dom.div([
				editors.tabs,
				editors.page,
				editors.questionnaire
			], "main")
		];
	},
	setKey: function(data) {
		var _ = survey.core._, sur = _.cur.survey;
		if (!sur.key) {
			sur.key = data.key;
			survey.editor.pages([CT.merge({
				survey: sur.key
			}, _.blanks.page)]);
			var slink = CT.dom.link(data.title, function() {
				survey.editor.edit(data);
				survey.core.setActive(slink);
			});
			_.surveys.lastElementChild.appendChild(slink);
		}
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
			var inode = CT.dom.div(imgz.map(survey.editor.img));
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
									CT.dom.show(_.newpage);
									CT.dom.show(_.getanswers);
									inode.appendChild(survey.editor.img(idata));
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
	getAnswers: function() {
		var cur = survey.core._.cur,
			page = cur.page, surv = cur.survey;
		CT.db.get("answer", function(answers) {
			CT.db.multi(answers.map(function(a) {
				return a.person;
			}), function(peeps) {
				peeps.forEach(function(p) { // faster way to do this?
					CT.db.get("profile", function(prof) {
						p.profile = prof; // heh, hacky
					}, null, null, null, {
						survey: surv.key,
						person: p.key
					});
				});
				CT.db.multi(peeps.map(function(p) {
					return p.zipcode;
				}), function() {
					CT.db.multi(surv.demographics, function(demz) {
						var arowz = [["location", "name", "email"].concat(demz.map(function(d) {
							return d.prompt;
						})).concat(page.questions)], az = {};
						answers.forEach(function(answer) {
							if (!(answer.person in az)) {
								var p = CT.data.get(answer.person),
									z = CT.data.get(p.zipcode),
									d = p.profile.demographics;
								az[answer.person] = [survey.core.zip(z), p.name, p.email].concat(d);
								arowz.push(az[answer.person]);
							}
							az[answer.person][answer.question + 3 + demz.length] = answer.response;
						});
						survey.core.modal(CT.file.make(arowz.map(function(arow) {
							return arow.join("\t");
						}).join("\n")).download(surv.title + " - Page "
							+ (cur.pages.indexOf(page) + 1) + ".tsv"), null, null, true);
					});
				});
			});
		}, null, null, null, {
			page: page.key
		});
	},
	page: function(page) {
		var _ = survey.core._, qfield = survey.core.qfield, newq = qfield("", {
			cb: function(val) {
				newq.value = "";
				qz.appendChild(qfield(val, page.questions.length, true));
				page.questions[page.questions.length] = val;
				CT.dom.show(_.newpage);
				CT.dom.show(_.getanswers);
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
		CT.dom.setContent(_.questions, [qz, newq]);
		survey.editor.images();
	},
	newPage: function() {
		var _ = survey.core._, pages = _.cur.pages, page = CT.merge({
			survey: _.cur.survey.key
		}, _.blanks.page), viewPage = function() {
			survey.core.setActive(slink, _.pages.firstChild);
			survey.editor.page(page);
		}, slink = CT.dom.link(pages.length + 1, viewPage);
		pages.push(page);
		CT.dom.addContent(_.pages.firstChild, slink);
		CT.dom.hide(_.newpage);
		CT.dom.hide(_.getanswers);
		viewPage();
	},
	pages: function(pages) {
		var _ = survey.core._;
		_.cur.pages = pages;
		if (!pages.length) {
			CT.dom.clear(_.pages.firstChild);
			return survey.editor.newPage();
		}
		CT.dom.setContent(_.pages, pages.map(function(p, i) {
			var slink = CT.dom.link(i + 1, function() {
				survey.core.setActive(slink, _.pages.firstChild);
				survey.editor.page(p);
			}, null, i || "active");
			return slink;
		}));
		survey.editor.page(pages[0]);
		CT.dom.show(_.newpage);
		CT.dom.show(_.getanswers);
	},
	demo: function(dem) {
		var doptions = CT.dom.fieldList(dem.options);
		return CT.dom.div([
			survey.core.qfield(dem.prompt, {
				cb: function(val) {
					dem.prompt = val;
					survey.core.save({
						key: dem.key,
						prompt: val
					});
				}
			}, true),
			[
				CT.dom.button("update options", function() {
					dem.options = doptions.value();
					survey.core.save({
						key: dem.key,
						options: dem.options
					});
				}, "right"),
				"options:",
				doptions.addButton,
				doptions.empty,
				doptions
			]
		], "topbordered topmargined toppadded");
	},
	info: function() {
		var _ = survey.core._, sur = _.cur.survey,
			blurs = core.config.ctsurvey.blurs;
		var qfield = survey.core.qfield, title = qfield(sur.title, {
			blurs: blurs.title,
			cb: function(val) {
				sur.title = val;
				survey.core.save({
					key: sur.key,
					user: sur.user,
					modelName: "survey",
					title: val
				}, survey.editor.setKey);
			}
		}), blurb = qfield(_.cur.survey.blurb, {
			blurs: blurs.blurb,
			cb: function(val) {
				if (!sur.title)
					return alert("don't forget the title!");
				sur.blurb = val;
				survey.core.save({
					key: sur.key,
					blurb: val
				});
			}
		}, true), instructions = qfield(_.cur.survey.instructions, {
			blurs: blurs.instructions,
			cb: function(val) {
				if (!sur.title)
					return alert("don't forget the title!");
				sur.instructions = val;
				survey.core.save({
					key: sur.key,
					instructions: val
				});
			}
		}, true);
		CT.dom.setContent(_.info, [title, blurb, instructions]);
		CT.db.multi(sur.demographics, function(dz) {
			CT.dom.setContent(_.demos, [
				CT.dom.button("new demographic question", function() {
					(new CT.modal.Prompt({
						transition: "slide",
						prompt: "what's the prompt?",
						cb: function(val) {
							survey.core.save({
								modelName: "demographic",
								prompt: val
							}, function(demdata) {
								sur.demographics.push(demdata.key);
								survey.core.save({
									key: sur.key,
									demographics: sur.demographics
								});
								_.demos.firstChild.lastChild.appendChild(survey.editor.demo(demdata));
							});
						}
					})).show();
				}, "right"),
				dz.map(survey.editor.demo)
			]);
		});
	},
	edit: function(item) {
		var _ = survey.editor._;
		survey.core._.cur.survey = item;
		survey.editor.info();
		if (item.key) {
			_.newshow();
			CT.db.get("page", survey.editor.pages, null, null, null, {
				survey: item.key
			});
		} else {
			_.newhide();
			CT.dom.clear(survey.core._.pages.firstChild);
		}
	}
};