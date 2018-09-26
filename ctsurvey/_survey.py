from cantools.web import log, respond, succeed, cgi_get
from cantools.db import edit
from model import db, getzip, Survey, Person

def response():
    action = cgi_get("action", choices=["register"])
    if action == "register":
        z = getzip(cgi_get("zip"))
        p = Person()
        p.zipcode = z.key
        p.name = cgi_get("name", required=False)
        p.email = cgi_get("email", required=False)
        p.put()
        succeed(p.key)

respond(response)