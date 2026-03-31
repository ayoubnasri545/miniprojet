from sqlmodel import create_engine, Session

DATABASE_URL = "mysql+pymysql://root:@localhost/reservi"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session