syms = {
	".": ["_survey.py"],
	"html": ["survey"],
	"css": ["survey.css"],
	"js": ["survey"]
}
model = {
	"ctsurvey.model": ["*"]
}
routes = {
	"/_survey": "_survey.py"
}
requires = ["ctuser"]