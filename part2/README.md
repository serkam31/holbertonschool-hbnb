# HBnB - Part 2

## Project Overview

HBnB is a web application inspired by AirBnB, built with Flask and Flask-RESTx.
This part implements the Business Logic and API layers using a layered architecture.

## Directory Structure

```
part2/
├── app/
│   ├── __init__.py         # Flask app factory
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py    # User endpoints
│   │       ├── places.py   # Place endpoints
│   │       ├── reviews.py  # Review endpoints
│   │       └── amenities.py # Amenity endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base_model.py   # Base class with id, created_at, updated_at
│   │   ├── user.py         # User model
│   │   ├── place.py        # Place model
│   │   ├── review.py       # Review model
│   │   └── amenity.py      # Amenity model
│   ├── services/
│   │   ├── __init__.py     # Facade singleton
│   │   └── facade.py       # HBnBFacade (communication between layers)
│   └── persistence/
│       ├── __init__.py
│       └── repository.py   # In-memory repository
├── run.py                  # Application entry point
├── config.py               # Environment configuration
├── requirements.txt        # Python dependencies
└── README.md
```

## Installation

```bash
pip install -r requirements.txt
```

## Running the Application

```bash
python run.py
```

The API documentation is available at: `http://localhost:5000/api/v1/`

## Architecture

- **Presentation Layer**: Flask-RESTx API endpoints (`app/api/`)
- **Business Logic Layer**: Models with validation (`app/models/`)
- **Persistence Layer**: In-memory repository (`app/persistence/`), to be replaced by SQLAlchemy in Part 3
- **Facade Pattern**: `HBnBFacade` in `app/services/facade.py` manages communication between layers

## Business Logic Layer

### Entities

#### BaseModel
All entities inherit from `BaseModel` which provides:
- `id`: UUID generated automatically (`str(uuid.uuid4())`)
- `created_at`: Timestamp set at creation
- `updated_at`: Timestamp updated on every modification
- `save()`: Updates the `updated_at` timestamp
- `update(data)`: Updates attributes from a dictionary

#### User
Attributes: `first_name` (max 50), `last_name` (max 50), `email` (valid format), `is_admin` (default `False`)

#### Place
Attributes: `title` (max 100), `description` (optional), `price` (positive), `latitude` (-90 to 90), `longitude` (-180 to 180), `owner` (User instance)

Relationships:
- `reviews`: list of related `Review` instances
- `amenities`: list of related `Amenity` instances
- `add_review(review)`: adds a review to the place
- `add_amenity(amenity)`: adds an amenity to the place

#### Review
Attributes: `text` (required), `rating` (integer 1–5), `place` (Place instance), `user` (User instance)

#### Amenity
Attributes: `name` (max 50, required)

### Usage Examples

```python
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

# Create a user
user = User(first_name="John", last_name="Doe", email="john.doe@example.com")

# Create a place owned by the user
place = Place(title="Cozy Apartment", description="A nice place", price=100,
              latitude=37.7749, longitude=-122.4194, owner=user)

# Add a review
review = Review(text="Great stay!", rating=5, place=place, user=user)
place.add_review(review)

# Add an amenity
amenity = Amenity(name="Wi-Fi")
place.add_amenity(amenity)
```
