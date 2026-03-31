
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


class Etablissement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    image: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    lieux: List["Lieu"] = Relationship(back_populates="etablissement")
    services: List["Service"] = Relationship(back_populates="etablissement")
    utilisateurs: List["Utilisateur"] = Relationship(back_populates="etablissement")


class Lieu(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    etablissement_id: int = Field(foreign_key="etablissement.id")
    adresse: Optional[str] = None
    code_postal: Optional[str] = None
    telephone: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    etablissement: Optional[Etablissement] = Relationship(back_populates="lieux")
    utilisateurs: List["Utilisateur"] = Relationship(back_populates="lieu")
    tickets: List["Ticket"] = Relationship(back_populates="lieu")


class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    etablissement_id: int = Field(foreign_key="etablissement.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    etablissement: Optional[Etablissement] = Relationship(back_populates="services")
    tickets: List["Ticket"] = Relationship(back_populates="service")
    guichets: List["Guichet"] = Relationship(back_populates="service")


class Utilisateur(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    prenom: str
    role: str = Field(default="client")
    username: str = Field(index=True, unique=True)
    password: str
    etablissement_id: int = Field(foreign_key="etablissement.id")
    lieu_id: int = Field(foreign_key="lieux.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    etablissement: Optional[Etablissement] = Relationship(back_populates="utilisateurs")
    lieu: Optional[Lieu] = Relationship(back_populates="utilisateurs")
    guichet: Optional["Guichet"] = Relationship(back_populates="utilisateur")
    reservations: List["Reservation"] = Relationship(back_populates="utilisateur")


class Guichet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    numero: int
    service_id: int = Field(foreign_key="service.id")
    user_id: int = Field(foreign_key="utilisateur.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    service: Optional[Service] = Relationship(back_populates="guichets")
    utilisateur: Optional[Utilisateur] = Relationship(back_populates="guichet")
    tickets: List["Ticket"] = Relationship(back_populates="guichet")


class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    numero: int
    status: str = Field(default="waiting")
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    service_id: int = Field(foreign_key="service.id")
    lieu_id: int = Field(foreign_key="lieux.id")
    guichet_id: Optional[int] = Field(default=None, foreign_key="guichet.id")
    
    service: Optional[Service] = Relationship(back_populates="tickets")
    lieu: Optional[Lieu] = Relationship(back_populates="tickets")
    guichet: Optional[Guichet] = Relationship(back_populates="tickets")
    reservations: List["Reservation"] = Relationship(back_populates="ticket")


class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="utilisateur.id")
    ticket_id: int = Field(foreign_key="ticket.id")
    date_reservation: Optional[datetime] = Field(default_factory=datetime.now)
    status: str = Field(default="active")
    
    utilisateur: Optional[Utilisateur] = Relationship(back_populates="reservations")
    ticket: Optional[Ticket] = Relationship(back_populates="reservations")
