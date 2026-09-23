# Datastraw Support CRM

A full-stack customer support ticketing CRM built as part of the Datastraw AI + Tech Intern Assessment.

The application allows support teams to create, search, filter, view, and update customer support tickets through a clean web interface.

## Live Application

Frontend:

https://miraculous-truth-production-8590.up.railway.app

Backend API:

https://datastraw-support-crm-production-b1fa.up.railway.app

Swagger API Documentation:

https://datastraw-support-crm-production-b1fa.up.railway.app/docs

---

## Features

- Create customer support tickets
- Auto-generated ticket IDs
- Store customer name and email
- Store issue subject and description
- View all support tickets
- Search tickets
- Filter tickets by status
  - Open
  - In Progress
  - Closed
- View individual ticket details
- Update ticket status
- Persistent database storage
- Responsive React frontend
- REST API built with FastAPI
- Interactive API documentation with Swagger

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database

- PostgreSQL in production
- SQLite fallback for local development

### Deployment

- Railway
  - React frontend
  - FastAPI backend
  - PostgreSQL database

---

## Architecture

```text
Browser
   |
   v
React + Vite Frontend
   |
   | HTTPS / REST API
   v
FastAPI Backend
   |
   | SQLAlchemy
   v
PostgreSQL Database