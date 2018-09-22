from ctuser.model import CTUser
from cantools import db

class Survey(db.TimeStampedBase):
    user = db.ForeignKey(kind=CTUser)
    title = db.String()
    blurb = db.Text()

class Page(db.TimeStampedBase):
    survey = db.ForeignKey(kind=Survey)
    images = db.Binary(repeated=True)
    questions = db.String(repeated=True)

class Answer(db.TimeStampedBase):
    page = db.ForeignKey(kind=Page)
    question = db.Integer()
    name = db.String()  # optional
    email = db.String() # optional
    response = db.Text()