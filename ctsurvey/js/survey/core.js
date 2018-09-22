survey.core = {
	_: {
		pages: CT.dom.div(null, "pages"),
		images: CT.dom.div(null, "images"),
		questions: CT.dom.div(null, "questions"),
	},
	editor: function(data) {
		return [
			CT.dom.div(data.map(function(d) {
				return CT.dom.link(d.title, function() {
					survey.core.edit(d);
				});
			}), "surveys"),
			[
				survey.core._.pages,
				CT.dom.div([
					survey.core._.images,
					survey.core._.questions
				], "page")
			]
		];
	},
	page: function(page) {
		CT.dom.setContent(survey.core._.questions, page.questions);
		CT.dom.setContent(survey.core._.images, page.images.map(CT.dom.img));
	},
	pages: function(pages) {
		CT.dom.setContent(survey.core._.pages, pages.map(function(p, i) {
			return CT.dom.link(i + 1, function() {
				survey.core.page(p);
			}));
		]);
		survey.core.page(pages[0]);
	},
	edit: function(item) { // TODO: cache this....
		CT.db.get("page", survey.core.pages, null, null, null, {
			survey: item.key
		});
	}
};