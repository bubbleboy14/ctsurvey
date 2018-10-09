CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");
CT.require("survey.viewer");

var hash = location.hash.slice(1) || core.config.ctsurvey.default_survey;
if (!hash)
	location = "/"; // whatever, kick em back

CT.onload(function() {
	CT.initCore();
	CT.dom.remove("ctll");
	survey.viewer.init(hash);
});