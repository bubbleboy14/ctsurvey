from ctuser.model import CTUser
from cantools import db

class Demographic(db.TimeStampedBase):
    prompt = db.Text()
    options = db.String(repeated=True)

class Survey(db.TimeStampedBase):
    user = db.ForeignKey(kind=CTUser)
    demographics = db.ForeignKey(kind=Demographic, repeated=True)
    title = db.String()
    blurb = db.Text()

class Image(db.TimeStampedBase):
    image = db.Binary()
    link = db.String()

class Page(db.TimeStampedBase):
    survey = db.ForeignKey(kind=Survey)
    images = db.ForeignKey(kind=Image, repeated=True)
    questions = db.String(repeated=True)

class ZipCode(db.TimeStampedBase):
    code = db.String()
    city = db.String()
    state = db.String()
    county = db.String()
    label = "code"

def getzip(code):
    if len(code) < 5:
        from cantools.net import fail
        fail("invalid zip code")
    try:
        code = str(int(code.strip()[:5]))
        while len(code) < 5: # preceding 0's
            code = '0'+code
    except:
        from cantools.net import fail
        fail("invalid zip code")
    zipcode = ZipCode.query().filter(ZipCode.code == code).get()
    if not zipcode:
        from cantools.web import fetch
        from cantools import config
        city, state, county = fetch(config.zipdomain,
            path="/geo?action=zip&code=%s"%(code,), ctjson=True)
        zipcode = ZipCode(code=code, city=city, state=state, county=county)
        zipcode.put()
    return zipcode

class Person(db.TimeStampedBase):
    zipcode = db.ForeignKey(kind=ZipCode)
    name = db.String()  # optional
    email = db.String() # optional

class Profile(db.TimeStampedBase):
    survey = db.ForeignKey(kind=Survey)
    person = db.ForeignKey(kind=Person)
    demographics = db.String(repeated=True) # 1 per survey demo

class Answer(db.TimeStampedBase):
    person = db.ForeignKey(kind=Person)
    page = db.ForeignKey(kind=Page)
    question = db.Integer()
    response = db.Text()