from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Etablissement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    image: str
    services: List["Service"] = Relationship(back_populates="etablissement")
    users: List["Utilisateur"] = Relationship(back_populates="etablissement")

class Service(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    etablissement_id: int = Field(foreign_key="etablissement.id")
    etablissement: Optional[Etablissement] = Relationship(back_populates="services")
    tickets: List["Ticket"] = Relationship(back_populates="service")

class Utilisateur(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    prenom: str
    service: int  # 1=admin, 2=guichet, 3=client
    username: str = Field(index=True)
    password: str
    etablissement_id: int = Field(foreign_key="etablissement.id")
    etablissement: Optional[Etablissement] = Relationship(back_populates="users")

class Ticket(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    numero: int
    status: str 
    service_id: int = Field(foreign_key="service.id")
    service: Optional[Service] = Relationship(back_populates="tickets")
    guichet_id: Optional[int] = None
