# Network & HTTP Request Audit (network-errors.md)

Total HTTP Requests Logged: **1703**  
Failed / 4xx / 5xx Responses: **3**  

## Failed Requests Log
| Method | HTTP Status | Target URL | Initiating Route |
| :--- | :--- | :--- | :--- |
| `GET` | `404` | `http://localhost:3003/favicon.ico` | `http://localhost:3003/dashboard` |
| `POST` | `401` | `http://localhost:8000/api/v1/auth/login` | `http://localhost:3003/login` |
| `GET` | `500` | `http://localhost:8000/api/v1/organizations/21e3d512-f4fc-46fe-81d3-01510c8420bd/status` | `http://localhost:3003/settings/organization` |
