from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import hash_password, verify_password

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- AUTH ---------- #

@app.post("/signup")
def signup(username: str, password: str, db: Session = Depends(get_db)):
    user = models.User(
        username=username,
        password=hash_password(password)
    )
    db.add(user)
    db.commit()
    return {"message": "User created"}

@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()

    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    return {"user_id": user.id}

# ---------- LINKS ---------- #

@app.post("/add-link")
def add_link(user_id: int, url: str, db: Session = Depends(get_db)):
    preview = f"https://image.thum.io/get/{url}"

    link = models.Link(
        url=url,
        preview=preview,
        user_id=user_id
    )

    db.add(link)
    db.commit()

    return {"message": "Saved"}

@app.get("/links/{user_id}")
def get_links(user_id: int, db: Session = Depends(get_db)):
    links = db.query(models.Link).filter(models.Link.user_id == user_id).all()
    return links