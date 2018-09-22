# ctsurvey
This package includes models, pages, and a request handler for administering surveys.


# Back (Init Config)

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

# Front (JS Config)

## core.config.ctsurvey
### Import line: 'CT.require("core.config");'
    {
    	
    }