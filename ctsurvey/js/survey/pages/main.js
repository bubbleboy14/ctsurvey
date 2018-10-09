CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");
CT.require("survey.viewer");

CT.onload(function() {
	CT.initCore();
	CT.dom.remove("ctll");
	survey.viewer.init(survey.core.hash());
});