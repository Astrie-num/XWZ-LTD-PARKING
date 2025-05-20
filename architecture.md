# XWZ LTD Car Parking Management System Architecture

## System Overview
The XWZ LTD Car Parking Management System is a distributed microservices-based application designed to enhance the operational efficiency of car park facilities. The system manages user authentication, parking space management, car entry/exit tracking, and report generation for financial and usage insights. It is built for scalability, modularity, and maintainability.

## Technology Stack

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API
- **Package Manager**: Yarn

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Architecture**: Microservices
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI
- **Database**: PostgreSQL
- **Package Manager**: npm

## System Components

### Frontend Architecture
- Handles UI rendering for drivers, attendants, and admins
- Integrates with backend via API Gateway
- Provides role-based views and real-time parking info

### Backend Architecture
- Split into independent services:
  - **User Service** – handles registration and authentication
  - **Parking Management Service** – handles parking lot data
  - **Car Tracking Service** – handles car entries/exits and ticketing
  - **Reporting Service** – generates reports

## API Structure

The backend exposes RESTful endpoints grouped by service:

- `/api/users` – User registration and login
- `/api/parkings` – Parking space creation and listing
- `/api/entries` – Car entry/exit tracking
- `/api/reports` – Financial and entry/exit reports
- `/api-docs` – Swagger API documentation

## Database Schema

The system uses PostgreSQL with normalized relational entities:

- Users
- Parkings
- Car Entries
- Tickets

Each microservice interacts with its own tables, and the data is aggregated as needed for reports.

## Security Features

### Authentication
- JWT-based authentication for all protected routes
- Password hashing using bcrypt
- Role-based access control (admin, parking_attendant)

### Data Protection
- Secure environment variables
- Input validation and sanitization
- CORS policy for cross-origin requests
- SSL support in production

## Development and Deployment

### Development Environment
- Frontend served via Vite/React dev server
- Backend services run individually using Express.js
- PostgreSQL runs locally or via Docker
- Services communicate via HTTP routed through API Gateway

### Production Deployment
- Containerized using Docker
- Docker Compose for service orchestration
- Reverse proxy (e.g., NGINX) for routing
- SSL certificates managed via Let's Encrypt

## API Documentation

Accessible at `/api-docs`, the Swagger UI provides:
- Interactive API browsing
- Authentication testing
- Request/response formats
- Endpoint categorization

## Error Handling

- Centralized error handling in each service
- Descriptive and sanitized errors in production
- Console logging or logging to file for debugging
- Standardized error structure for frontend parsing

## Future Considerations

### Scalability
- Kubernetes-ready microservices
- Horizontal scaling per service
- Caching with Redis for high-demand endpoints

### Monitoring
- Integration with Prometheus + Grafana
- Logging aggregation (e.g., ELK stack)
- Uptime and performance alerts

### Features
- Mobile app interface
- Real-time spot updates with WebSockets
- Payment gateway integration

---

## Mermaid Diagrams

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI]
        Router[React Router]
        State[Context API]
        AuthCtx[JWT Auth Context]
    end

    subgraph "API Gateway"
        Gateway[API Gateway (Node.js)]
    end

    subgraph "Backend Services"
        US[User Service]
        PMS[Parking Management Service]
        CTS[Car Tracking Service]
        RS[Reporting Service]
    end

    subgraph "Database Layer"
        DB[(PostgreSQL)]
    end

    subgraph "External Systems"
        JWT[JWT Signing]
        SMTP[Email Notifications]
    end

    UI --> Router
    UI --> State
    UI --> AuthCtx
    AuthCtx --> Gateway
    Gateway --> US
    Gateway --> PMS
    Gateway --> CTS
    Gateway --> RS

    US --> DB
    PMS --> DB
    CTS --> DB
    RS --> DB

    US --> JWT
    RS --> SMTP
