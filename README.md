# Hospital Management System

A comprehensive hospital management system with a modern web interface for managing patients, appointments, doctors, and hospital operations.

## Features

- **Patient Management**: Register and manage patient records
- **Appointment Scheduling**: Book and track patient appointments
- **Doctor Management**: Manage doctor profiles and schedules
- **User Authentication**: Secure login system
- **Modern UI**: Responsive web interface

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

### Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend development)
- SQLite (included with Python)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hospital-management-system
```

2. Run the application:
```bash
python run_hms.py
```

The application will be available at `http://localhost:5000`

## Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [Quick Start](QUICKSTART.md) - Get started quickly
- [Deployment](DEPLOYMENT.md) - Deploy to production
- [Improvements](IMPROVEMENTS.md) - Planned enhancements

## Project Structure

```
├── backend/          # Backend server code
├── frontend/         # Frontend application
├── auth.js          # Authentication module
├── controllers.js   # API controllers
├── run_hms.py       # Main application runner
└── render.yaml      # Deployment configuration
```

## Deployment

The system can be deployed to various platforms. See [DEPLOYMENT.md](DEPLOYMENT.md) for platform-specific instructions including:

- Render
- Heroku
- Railway
- Self-hosted options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is available for use and modification.

## Support

For issues and questions, please open an issue in the GitHub repository.
