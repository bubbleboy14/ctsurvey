from cantools.web import log, respond, succeed, cgi_get
from cantools.db import edit
from model import db, Survey

def response():
    action = cgi_get("action", choices=["create", "respond"])
    if action == "create":
        pass
    elif action == "respond":
        pass

respond(response)