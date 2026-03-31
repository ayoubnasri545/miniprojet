from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, select, Field 
from database import get_session, engine
from models import Etablissement, Service, Utilisateur, Ticket
from typing import Optional, List

app = FastAPI()


SQLModel.metadata.create_all(engine)


@app.get("/etablissements")
def get_etablissements(session: Session = Depends(get_session)):
    etablissements = session.exec(select(Etablissement)).all()
    return etablissements

@app.post("/etablissements")
def create_etablissement(etab: Etablissement, session: Session = Depends(get_session)):
    session.add(etab)
    session.commit()
    session.refresh(etab)
    return etab




@app.get("/services/{etablissement_id}")
def get_services_by_etablissement(etablissement_id: int, session: Session = Depends(get_session)):
    services = session.exec(
        select(Service).where(Service.etablissement_id == etablissement_id)
    ).all()
    return services

@app.post("/services")
def create_service(service: Service, session: Session = Depends(get_session)):
    session.add(service)
    session.commit()
    session.refresh(service)
    return service

@app.get("/services")
def get_all_services(session: Session = Depends(get_session)):
    services = session.exec(select(Service)).all()
    return services




@app.post("/users")
def create_user(user: Utilisateur, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/users")
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(Utilisateur)).all()
    return users

@app.delete("/users/{id}")
def delete_user(id: int, session: Session = Depends(get_session)):
    user = session.get(Utilisateur, id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    session.delete(user)
    session.commit()
    return {"message": "deleted"}

@app.put("/users/{id}")
def update_user(id: int, new_data: Utilisateur, session: Session = Depends(get_session)):
    user = session.get(Utilisateur, id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    
    user.nom = new_data.nom
    user.prenom = new_data.prenom
    user.service = new_data.service
    user.username = new_data.username
    user.password = new_data.password
    user.etablissement_id = new_data.etablissement_id
    
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.post("/login")
def login(data: dict, session: Session = Depends(get_session)):
    username = data.get("username")
    password = data.get("password")
    etablissement_id = data.get("etablissement_id")
    
    user = session.exec(
        select(Utilisateur).where(
            Utilisateur.username == username,
            Utilisateur.password == password,
            Utilisateur.etablissement_id == etablissement_id
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user.id,
        "nom": user.nom,
        "service": user.service,
        "etablissement_id": user.etablissement_id
    }




@app.post("/ticket/{service_id}")
def create_ticket(service_id: int, etablissement_id: Optional[int] = None, 
                  session: Session = Depends(get_session)):
    
   
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    if etablissement_id and service.etablissement_id != etablissement_id:
        raise HTTPException(status_code=400, detail="Service non disponible dans cet établissement")
    
    
    last_ticket = session.exec(
        select(Ticket)
        .where(Ticket.service_id == service_id)
        .order_by(Ticket.numero.desc())
    ).first()
    
    new_numero = last_ticket.numero + 1 if last_ticket else 1
    
    ticket = Ticket(
        numero=new_numero,
        status="waiting",
        service_id=service_id
    )
    
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    
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




@app.get("/guichet/{user_id}")
def get_guichet_by_user(user_id: int, session: Session = Depends(get_session)):
    
    user = session.get(Utilisateur, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
  
    return {"service_nom": "Guichet", "user_nom": user.nom}



@app.post("/guichets")
def create_guichet(guichet_data: dict, session: Session = Depends(get_session)):
    
    return {"message": "Guichet créé"}

@app.get("/guichets")
def get_guichets(session: Session = Depends(get_session)):

    return []
