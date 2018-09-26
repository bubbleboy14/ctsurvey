CT.require("CT.all");
CT.require("core");
CT.require("user.core");
CT.require("survey.core");

var hash = location.hash.slice(1);
if (!hash)
	location = "/"; // whatever, kick em back

CT.onload(function() {
	CT.initCore();
	CT.db.one(hash, function(survey) {
		survey.core.register(function() {
			// load up the survey
			// - questionnaire (->Profile)
			// - pages (w/o questions, timed)
			// - pages (w/ questions)
		});
	});
});