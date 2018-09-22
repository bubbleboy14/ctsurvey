CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");

CT.onload(function() {
	CT.initCore();
	CT.db.get("survey", function(data) {
		CT.dom.setContent("ctmain", survey.core.editor(data));
	});
});