
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, select
from database import get_session, engine
from models import Etablissement, Lieu, Service, Utilisateur, Guichet, Ticket, Reservation
from typing import Optional

app = FastAPI()

SQLModel.metadata.create_all(engine)


@app.get("/etablissements")
def get_etablissements(session: Session = Depends(get_session)):
    return session.exec(select(Etablissement)).all()


@app.post("/etablissements")
def create_etablissement(etab: Etablissement, session: Session = Depends(get_session)):
    session.add(etab)
    session.commit()
    session.refresh(etab)
    return etab


@app.get("/lieux/{etablissement_id}")
def get_lieux(etablissement_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Lieu).where(Lieu.etablissement_id == etablissement_id)).all()


@app.post("/lieux")
def create_lieu(lieu: Lieu, session: Session = Depends(get_session)):
    session.add(lieu)
    session.commit()
    session.refresh(lieu)
    return lieu


@app.get("/services/{etablissement_id}")
def get_services(etablissement_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Service).where(Service.etablissement_id == etablissement_id)).all()


@app.get("/services")
def get_all_services(session: Session = Depends(get_session)):
    return session.exec(select(Service)).all()


@app.post("/services")
def create_service(service: Service, session: Session = Depends(get_session)):
    session.add(service)
    session.commit()
    session.refresh(service)
    return service


@app.delete("/services/{service_id}")
def delete_service(service_id: int, session: Session = Depends(get_session)):
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    session.delete(service)
    session.commit()
    return {"message": "Service supprimé"}


@app.get("/users")
def get_users(session: Session = Depends(get_session)):
    return session.exec(select(Utilisateur)).all()


@app.post("/users")
def create_user(user: Utilisateur, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(Utilisateur, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    session.delete(user)
    session.commit()
    return {"message": "Utilisateur supprimé"}


@app.post("/login")
def login(data: dict, session: Session = Depends(get_session)):
    username = data.get("username")
    password = data.get("password")
    etablissement_id = data.get("etablissement_id")
    lieu_id = data.get("lieu_id")
    
    user = session.exec(
        select(Utilisateur).where(
            Utilisateur.username == username,
            Utilisateur.password == password,
            Utilisateur.etablissement_id == etablissement_id,
            Utilisateur.lieu_id == lieu_id
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user.id,
        "nom": user.nom,
        "role": user.role,
        "etablissement_id": user.etablissement_id,
        "lieu_id": user.lieu_id
    }


@app.get("/guichets")
def get_guichets(session: Session = Depends(get_session)):
    return session.exec(select(Guichet)).all()


@app.post("/guichets")
def create_guichet(guichet: Guichet, session: Session = Depends(get_session)):
    session.add(guichet)
    session.commit()
    session.refresh(guichet)
    return guichet


@app.get("/guichet/{user_id}")
def get_guichet_by_user(user_id: int, session: Session = Depends(get_session)):
    guichet = session.exec(select(Guichet).where(Guichet.user_id == user_id)).first()
    if not guichet:
        raise HTTPException(status_code=404, detail="Guichet non trouvé")
    service = session.get(Service, guichet.service_id)
    return {
        "id": guichet.id,
        "numero": guichet.numero,
        "service_id": guichet.service_id,
        "service_nom": service.nom if service else "Inconnu"
    }


@app.post("/ticket/{service_id}")
def create_ticket(service_id: int, user_id: int, lieu_id: int, session: Session = Depends(get_session)):
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    last_ticket = session.exec(
        select(Ticket)
        .where(Ticket.service_id == service_id)
        .order_by(Ticket.numero.desc())
    ).first()
    
    new_numero = last_ticket.numero + 1 if last_ticket else 1
    
    ticket = Ticket(
        numero=new_numero,
        status="waiting",
        service_id=service_id,
        lieu_id=lieu_id
    )
    
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    
    reservation = Reservation(
        user_id=user_id,
        ticket_id=ticket.id,
        status="active"
    )
    
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    
    return ticket


@app.get("/next/{etablissement_id}")
def get_next_ticket(etablissement_id: int, session: Session = Depends(get_session)):
    next_ticket = session.exec(
        select(Ticket)
        .join(Service)
        .where(
            Ticket.status == "waiting",
            Service.etablissement_id == etablissement_id
        )
        .order_by(Ticket.numero.asc())
    ).first()
    
    if not next_ticket:
        return {"message": "Aucun ticket en attente"}
    
    next_ticket.status = "processing"
    session.add(next_ticket)
    session.commit()
    session.refresh(next_ticket)
    
    return next_ticket


@app.get("/tickets/user/{user_id}")
def get_user_tickets(user_id: int, session: Session = Depends(get_session)):
    reservations = session.exec(
        select(Reservation)
        .where(Reservation.user_id == user_id)
        .order_by(Reservation.date_reservation.desc())
    ).all()
    
    tickets = []
    for r in reservations:
        ticket = session.get(Ticket, r.ticket_id)
        if ticket:
            tickets.append(ticket)
    
    return tickets


@app.put("/ticket/{ticket_id}/status")
def update_ticket_status(ticket_id: int, status: str, session: Session = Depends(get_session)):
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    ticket.status = status
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    
    return ticket
