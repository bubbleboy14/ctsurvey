CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");
CT.require("survey.editor");

CT.onload(function() {
	CT.initCore();
	(new CT.modal.Prompt({
		transition: "slide",
		style: "password",
		noClose: true,
		cb: function(pw) {
			survey.editor.init(pw);
		}
	})).show();
});