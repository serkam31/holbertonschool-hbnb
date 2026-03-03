# HBnB API — Testing Report

**Date:** 2026-02-26
**Framework:** pytest 9.0.2 — Python 3.12.1
**Total:** 74 tests — **74 PASSED — 0 FAILED**

---

## Test Execution

```
python -m pytest tests/test_endpoints.py test_models.py -v
```

---

## 1. Model Unit Tests (`test_models.py`) — 21 tests

| Test | Input | Expected Output | Actual Output |
|---|---|---|---|
| `test_user_creation` | valid first/last/email | attributes set correctly | attributes set correctly |
| `test_user_invalid_email` | `email="not-an-email"` | `ValueError` | `ValueError` raised |
| `test_user_empty_first_name` | `first_name=""` | `ValueError` | `ValueError` raised |
| `test_user_first_name_too_long` | `first_name="A"*51` | `ValueError` | `ValueError` raised |
| `test_user_is_admin_readonly` | `user.is_admin = False` | `AttributeError` | `AttributeError` raised |
| `test_amenity_creation` | `name="Wi-Fi"` | attribute set | attribute set |
| `test_amenity_empty_name` | `name=""` | `ValueError` | `ValueError` raised |
| `test_amenity_name_too_long` | `name="A"*51` | `ValueError` | `ValueError` raised |
| `test_place_creation` | valid all fields | attributes set | attributes set |
| `test_place_invalid_price` | `price=-1` | `ValueError` | `ValueError` raised |
| `test_place_price_zero_valid` | `price=0` | accepted | accepted |
| `test_place_invalid_latitude` | `latitude=91` | `ValueError` | `ValueError` raised |
| `test_place_invalid_longitude` | `longitude=181` | `ValueError` | `ValueError` raised |
| `test_place_empty_title` | `title=""` | `ValueError` | `ValueError` raised |
| `test_place_add_review` | add Review to place | `len(reviews)==1` | `len(reviews)==1` |
| `test_review_creation` | valid text/rating | attributes set | attributes set |
| `test_review_empty_text` | `text=""` | `ValueError` | `ValueError` raised |
| `test_review_rating_too_low` | `rating=0` | `ValueError` | `ValueError` raised |
| `test_review_rating_too_high` | `rating=6` | `ValueError` | `ValueError` raised |
| `test_review_rating_boundary` | `rating=1` and `rating=5` | accepted | accepted |

---

## 2. API Endpoint Tests (`tests/test_endpoints.py`) — 53 tests

### Users

| Endpoint | Method | Input | Expected Output | Actual Output |
|---|---|---|---|---|
| `/api/v1/users/` | POST | valid payload | 201 + `{id, first_name, last_name, email}` | 201 Created |
| `/api/v1/users/` | POST | same email twice | 400 + `{error}` | 400 Bad Request |
| `/api/v1/users/` | POST | `email="not-an-email"` | 400 | 400 Bad Request |
| `/api/v1/users/` | POST | `first_name=""` | 400 | 400 Bad Request |
| `/api/v1/users/` | GET | — | 200 `[]` | 200 OK |
| `/api/v1/users/` | GET | after 1 creation | 200 list len=1 | 200 OK |
| `/api/v1/users/<id>` | GET | valid UUID | 200 + user data | 200 OK |
| `/api/v1/users/<id>` | GET | fake UUID | 404 | 404 Not Found |
| `/api/v1/users/<id>` | PUT | new first_name/email | 200 + updated data | 200 OK |
| `/api/v1/users/<id>` | PUT | fake UUID | 404 | 404 Not Found |
| `/api/v1/users/<id>` | PUT | `email="bad-email"` | 400 | 400 Bad Request |

### Amenities

| Endpoint | Method | Input | Expected Output | Actual Output |
|---|---|---|---|---|
| `/api/v1/amenities/` | POST | `name="Wi-Fi"` | 201 + `{id, name}` | 201 Created |
| `/api/v1/amenities/` | POST | `name=""` | 400 | 400 Bad Request |
| `/api/v1/amenities/` | POST | `name="A"*51` | 400 | 400 Bad Request |
| `/api/v1/amenities/` | GET | — | 200 `[]` | 200 OK |
| `/api/v1/amenities/<id>` | GET | valid UUID | 200 + amenity data | 200 OK |
| `/api/v1/amenities/<id>` | GET | fake UUID | 404 | 404 Not Found |
| `/api/v1/amenities/<id>` | PUT | `name="New"` | 200 | 200 OK |
| `/api/v1/amenities/<id>` | PUT | fake UUID | 404 | 404 Not Found |
| `/api/v1/amenities/<id>` | PUT | `name=""` | 400 | 400 Bad Request |

### Places

| Endpoint | Method | Input | Expected Output | Actual Output |
|---|---|---|---|---|
| `/api/v1/places/` | POST | valid payload | 201 + place data | 201 Created |
| `/api/v1/places/` | POST | `price=-10` | 400 | 400 Bad Request |
| `/api/v1/places/` | POST | `price=0` | 201 | 201 Created |
| `/api/v1/places/` | POST | `latitude=91` | 400 | 400 Bad Request |
| `/api/v1/places/` | POST | `longitude=181` | 400 | 400 Bad Request |
| `/api/v1/places/` | POST | `owner_id="fake-id"` | 400 | 400 Bad Request |
| `/api/v1/places/` | POST | `amenities=["fake"]` | 400 | 400 Bad Request |
| `/api/v1/places/` | GET | — | 200 `[]` | 200 OK |
| `/api/v1/places/` | GET | after 1 creation | 200 list len=1 | 200 OK |
| `/api/v1/places/<id>` | GET | valid UUID | 200 + owner + amenities + reviews | 200 OK |
| `/api/v1/places/<id>` | GET | fake UUID | 404 | 404 Not Found |
| `/api/v1/places/<id>` | PUT | `title="Updated"` | 200 | 200 OK |
| `/api/v1/places/<id>` | PUT | fake UUID | 404 | 404 Not Found |
| `/api/v1/places/<id>` | PUT | `price=-5` | 400 | 400 Bad Request |

### Reviews

| Endpoint | Method | Input | Expected Output | Actual Output |
|---|---|---|---|---|
| `/api/v1/reviews/` | POST | valid payload | 201 + `{id, text, rating, user_id, place_id}` | 201 Created |
| `/api/v1/reviews/` | POST | `rating=6` | 400 | 400 Bad Request |
| `/api/v1/reviews/` | POST | `rating=0` | 400 | 400 Bad Request |
| `/api/v1/reviews/` | POST | `rating=1` | 201 | 201 Created |
| `/api/v1/reviews/` | POST | `user_id="fake"` | 400 | 400 Bad Request |
| `/api/v1/reviews/` | POST | `place_id="fake"` | 400 | 400 Bad Request |
| `/api/v1/reviews/` | POST | `text=""` | 400 | 400 Bad Request |
| `/api/v1/reviews/` | GET | — | 200 `[]` | 200 OK |
| `/api/v1/reviews/` | GET | after 1 creation | 200 list len=1 | 200 OK |
| `/api/v1/reviews/<id>` | GET | valid UUID | 200 + review data | 200 OK |
| `/api/v1/reviews/<id>` | GET | fake UUID | 404 | 404 Not Found |
| `/api/v1/reviews/<id>` | PUT | `text="Updated", rating=3` | 200 | 200 OK |
| `/api/v1/reviews/<id>` | PUT | `rating=10` | 400 | 400 Bad Request |
| `/api/v1/reviews/<id>` | PUT | fake UUID | 404 | 404 Not Found |
| `/api/v1/reviews/<id>` | DELETE | valid UUID | 200 `{message}` | 200 OK |
| `/api/v1/reviews/<id>` | DELETE + GET | same UUID | GET → 404 | 404 Not Found |
| `/api/v1/reviews/<id>` | DELETE | fake UUID | 404 | 404 Not Found |
| `/api/v1/places/<id>/reviews` | GET | valid place UUID | 200 list len=2 | 200 OK |
| `/api/v1/places/<id>/reviews` | GET | fake UUID | 404 | 404 Not Found |
| `/api/v1/places/<id>` | GET | place with 1 review | reviews list len=1 | 200 OK |

---

## 3. Issues Encountered and Fixes Applied

| Issue | File | Fix Applied |
|---|---|---|
| `test_models.py` used old constructor signatures (`owner=`, `place=`, `user=`) | `test_models.py` | Rewritten to use `owner_id`, `place_id`, `user_id` |
| `POST /users/` had no try/except — `ValueError` from model caused 500 | `api/v1/users.py` | Added try/except around `facade.create_user()` |
| `PUT /users/` had no try/except — invalid email on update caused 500 | `api/v1/users.py` | Added try/except around `facade.update_user()` |
| `BaseModel.update()` allowed overwriting `id`, `created_at`, `updated_at` | `models/base_model.py` | Added `protected` set to skip those fields |
| Facade singleton shared across tests — data persisted between test runs | `tests/test_endpoints.py` | Added `reset_facade()` called in each `setUp` |

---

## 4. Validation Summary

All validations enforced via **property setters** (triggered on both creation and update):

| Model | Attribute | Rule | Enforced at |
|---|---|---|---|
| User | `first_name` | required, max 50 chars | setter |
| User | `last_name` | required, max 50 chars | setter |
| User | `email` | required, valid format | setter |
| User | `is_admin` | read-only after creation | property (no setter) |
| Amenity | `name` | required, max 50 chars | setter |
| Place | `title` | required, max 100 chars | setter |
| Place | `price` | ≥ 0 | setter |
| Place | `latitude` | −90 ≤ value ≤ 90 | setter |
| Place | `longitude` | −180 ≤ value ≤ 180 | setter |
| Review | `text` | required | setter |
| Review | `rating` | 1 ≤ value ≤ 5 | setter |

Cross-entity validation enforced in the **Facade** layer:

| Operation | Validation |
|---|---|
| `create_place` | `owner_id` must reference an existing User |
| `create_place` | each amenity ID must reference an existing Amenity |
| `create_review` | `user_id` must reference an existing User |
| `create_review` | `place_id` must reference an existing Place |
