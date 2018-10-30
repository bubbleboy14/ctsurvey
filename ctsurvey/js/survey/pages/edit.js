CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");
CT.require("survey.editor");
CT.db.setLimit(500);

CT.onload(function() {
	CT.initCore();
	(new CT.modal.Prompt({
		transition: "slide",
		style: "password",
		noClose: true,
		cb: function(pw) {
			CT.net.post({
				path: "/_db",
				params: {
					action: "credcheck",
					pw: pw
				},
				cb: function() {
					survey.editor.init(pw);
				},
				eb: function() {
					location = "/";
				}
			})
		}
	})).show();
});