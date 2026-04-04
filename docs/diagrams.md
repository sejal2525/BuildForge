**
## 📌 Sequence Diagram (Appointment Booking)
```mermaid
sequenceDiagram
    participant Patient
    participant System
    participant Doctor

    Patient->>System: Login
    System-->>Patient: Login Successful

    Patient->>System: Request Appointment
    System->>Doctor: Check Availability
    Doctor-->>System: Available

    System-->>Patient: Appointment Confirmed
```**
