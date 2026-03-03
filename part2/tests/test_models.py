import pytest
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity


# ── User ─────────────────────────────────────────────────────────────────────

def test_user_creation():
    user = User(first_name="John", last_name="Doe",
                email="john.doe@example.com")
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.email == "john.doe@example.com"
    assert user.is_admin is False


def test_user_invalid_email():
    with pytest.raises(ValueError):
        User(first_name="John", last_name="Doe", email="not-an-email")


def test_user_empty_first_name():
    with pytest.raises(ValueError):
        User(first_name="", last_name="Doe", email="john@example.com")


def test_user_first_name_too_long():
    with pytest.raises(ValueError):
        User(first_name="A" * 51, last_name="Doe", email="john@example.com")


def test_user_is_admin_readonly():
    user = User(first_name="John", last_name="Doe",
                email="john@example.com", is_admin=True)
    assert user.is_admin is True
    with pytest.raises(AttributeError):
        user.is_admin = False


# ── Amenity ──────────────────────────────────────────────────────────────────

def test_amenity_creation():
    amenity = Amenity(name="Wi-Fi")
    assert amenity.name == "Wi-Fi"


def test_amenity_empty_name():
    with pytest.raises(ValueError):
        Amenity(name="")


def test_amenity_name_too_long():
    with pytest.raises(ValueError):
        Amenity(name="A" * 51)


# ── Place ────────────────────────────────────────────────────────────────────

def test_place_creation():
    user = User(first_name="Alice", last_name="Smith",
                email="alice@example.com")
    place = Place(
        title="Cozy Apartment",
        description="A nice place to stay",
        price=100,
        latitude=37.7749,
        longitude=-122.4194,
        owner_id=user.id
    )
    assert place.title == "Cozy Apartment"
    assert place.price == 100
    assert place.latitude == 37.7749
    assert place.longitude == -122.4194
    assert place.owner_id == user.id
    assert place.amenities == []
    assert place.reviews == []


def test_place_invalid_price():
    with pytest.raises(ValueError):
        Place(title="X", description="", price=-1,
              latitude=0, longitude=0, owner_id="uid")


def test_place_price_zero_valid():
    place = Place(title="Free", description="", price=0,
                  latitude=0, longitude=0, owner_id="uid")
    assert place.price == 0


def test_place_invalid_latitude():
    with pytest.raises(ValueError):
        Place(title="X", description="", price=10,
              latitude=91, longitude=0, owner_id="uid")


def test_place_invalid_longitude():
    with pytest.raises(ValueError):
        Place(title="X", description="", price=10,
              latitude=0, longitude=181, owner_id="uid")


def test_place_empty_title():
    with pytest.raises(ValueError):
        Place(title="", description="", price=10,
              latitude=0, longitude=0, owner_id="uid")


def test_place_add_review():
    place = Place(title="House", description="", price=50,
                  latitude=0, longitude=0, owner_id="uid")
    review = Review(text="Great!", rating=5,
                    place_id=place.id, user_id="uid")
    place.add_review(review)
    assert len(place.reviews) == 1
    assert place.reviews[0].text == "Great!"


# ── Review ───────────────────────────────────────────────────────────────────

def test_review_creation():
    review = Review(text="Amazing!", rating=5,
                    place_id="place-id", user_id="user-id")
    assert review.text == "Amazing!"
    assert review.rating == 5


def test_review_empty_text():
    with pytest.raises(ValueError):
        Review(text="", rating=3, place_id="pid", user_id="uid")


def test_review_rating_too_low():
    with pytest.raises(ValueError):
        Review(text="ok", rating=0, place_id="pid", user_id="uid")


def test_review_rating_too_high():
    with pytest.raises(ValueError):
        Review(text="ok", rating=6, place_id="pid", user_id="uid")


def test_review_rating_boundary():
    r1 = Review(text="ok", rating=1, place_id="pid", user_id="uid")
    r5 = Review(text="ok", rating=5, place_id="pid", user_id="uid")
    assert r1.rating == 1
    assert r5.rating == 5
