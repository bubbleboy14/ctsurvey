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
			}
		},
		info: CT.dom.div(null, "info"),
		pages: CT.dom.div(null, "pages"),
		images: CT.dom.div(null, "images"),
		questions: CT.dom.div(null, "questions")
	},
	editor: function(data) {
		var _ = survey.core._;
		return [
			CT.dom.link("new survey", function() {
				survey.core.edit(CT.merge({
					user: user.core.get("key")
				}, _.blank.survey));
			}),
			CT.dom.div(data.map(function(d) {
				return CT.dom.link(d.title, function() {
					survey.core.edit(d);
				});
			}), "surveys"),
			[
				survey.core._.pages,
				CT.dom.div([
					_.info,
					_.images,
					_.questions
				], "page")
			]
		];
	},
	page: function(page) {
		var qz = page.questons.map(function(q) {
			CT.dom.textArea(null, q)
		}), newq = CT.dom.inputEnterCallback(CT.dom.textArea(), function(val) {
			qz.appendChild(CT.dom.textArea(null, val));
		}), surv = CT.data.get(page.survey),
			title = CT.dom.field(null, surv.title),
			blurb = CT.dom.textArea(null, surv.blurb);
		CT.dom.setContent(survey.core._.info, [title, blurb]);
		CT.dom.setContent(survey.core._.questions, [qz, newq]);
		CT.dom.setContent(survey.core._.images, page.images.map(CT.dom.img));
	},
	pages: function(pages) {
		var _ = survey.core._;
		if (!pages.length) {
			pages.push(CT.merge({
				survey: _.cursur.key
			}, _.blanks.page));
		}
		CT.dom.setContent(_.pages, pages.map(function(p, i) {
			return CT.dom.link(i + 1, function() {
				survey.core.page(p);
			});
		}));
		survey.core.page(pages[0]);
	},
	edit: function(item) { // TODO: cache this....
		survey.core._.cursur = item;
		CT.db.get("page", survey.core.pages, null, null, null, {
			survey: item.key
		});
	}
};