CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");

CT.onload(function() {
	CT.initCore();
	survey.core.register(function() {
		// load up the survey
		// - questionnaire (->Profile)
		// - pages (w/o questions, timed)
		// - pages (w/ questions)
	});
});