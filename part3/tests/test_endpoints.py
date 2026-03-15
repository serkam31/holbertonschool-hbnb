import unittest
from app import create_app
from app.persistence.repository import InMemoryRepository


def reset_facade():
    """Reset the shared facade singleton between tests."""
    from app.services import facade
    facade.user_repo = InMemoryRepository()
    facade.amenity_repo = InMemoryRepository()
    facade.place_repo = InMemoryRepository()
    facade.review_repo = InMemoryRepository()


def get_token(client, email, password):
    """Login and return a JWT access token."""
    res = client.post('/api/v1/auth/login',
                      json={'email': email, 'password': password})
    return res.get_json().get('access_token')


def auth_header(token):
    """Return Authorization header dict for a JWT token."""
    return {'Authorization': f'Bearer {token}'}


# ─────────────────────────────────────────────────────────────────────────────
# Auth tests
# ─────────────────────────────────────────────────────────────────────────────

class TestAuthEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

    def _create_user(self, email='auth@example.com', password='secret123'):
        self.client.post('/api/v1/users/', json={
            'first_name': 'Auth', 'last_name': 'User',
            'email': email, 'password': password
        })

    def test_login_success(self):
        self._create_user()
        res = self.client.post('/api/v1/auth/login',
                               json={'email': 'auth@example.com',
                                     'password': 'secret123'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('access_token', res.get_json())

    def test_login_invalid_email(self):
        res = self.client.post('/api/v1/auth/login',
                               json={'email': 'nobody@example.com',
                                     'password': 'secret'})
        self.assertEqual(res.status_code, 401)
        self.assertIn('error', res.get_json())

    def test_login_wrong_password(self):
        self._create_user('wp@example.com', 'correct')
        res = self.client.post('/api/v1/auth/login',
                               json={'email': 'wp@example.com',
                                     'password': 'wrong'})
        self.assertEqual(res.status_code, 401)

    def test_protected_without_token(self):
        res = self.client.get('/api/v1/auth/protected')
        self.assertEqual(res.status_code, 401)

    def test_protected_with_token(self):
        self._create_user('prot@example.com', 'pass')
        token = get_token(self.client, 'prot@example.com', 'pass')
        res = self.client.get('/api/v1/auth/protected',
                              headers=auth_header(token))
        self.assertEqual(res.status_code, 200)


# ─────────────────────────────────────────────────────────────────────────────
# User tests
# ─────────────────────────────────────────────────────────────────────────────

class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

    # ── POST /api/v1/users/ ───────────────────────────────────────────────────

    def test_create_user(self):
        res = self.client.post('/api/v1/users/', json={
            'first_name': 'John', 'last_name': 'Doe',
            'email': 'john.doe@example.com', 'password': 'secret'
        })
        self.assertEqual(res.status_code, 201)
        self.assertIn('id', res.get_json())

    def test_create_user_duplicate_email(self):
        payload = {'first_name': 'Jane', 'last_name': 'Doe',
                   'email': 'jane@example.com', 'password': 'secret'}
        self.client.post('/api/v1/users/', json=payload)
        res = self.client.post('/api/v1/users/', json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.get_json())

    def test_create_user_invalid_email(self):
        res = self.client.post('/api/v1/users/', json={
            'first_name': 'John', 'last_name': 'Doe',
            'email': 'not-an-email', 'password': 'secret'
        })
        self.assertEqual(res.status_code, 400)

    def test_create_user_empty_first_name(self):
        res = self.client.post('/api/v1/users/', json={
            'first_name': '', 'last_name': 'Doe',
            'email': 'john@example.com', 'password': 'secret'
        })
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/users/ ────────────────────────────────────────────────────

    def test_get_users_empty(self):
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_users_after_create(self):
        self.client.post('/api/v1/users/', json={
            'first_name': 'Alice', 'last_name': 'Smith',
            'email': 'alice@example.com', 'password': 'secret'
        })
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/users/<id> ────────────────────────────────────────────────

    def test_get_user_by_id(self):
        created = self.client.post('/api/v1/users/', json={
            'first_name': 'Bob', 'last_name': 'Martin',
            'email': 'bob@example.com', 'password': 'secret'
        }).get_json()
        res = self.client.get(f'/api/v1/users/{created["id"]}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['email'], 'bob@example.com')

    def test_get_user_not_found(self):
        res = self.client.get('/api/v1/users/nonexistent-id')
        self.assertEqual(res.status_code, 404)

    # ── PUT /api/v1/users/<id> ────────────────────────────────────────────────

    def test_update_user(self):
        created = self.client.post('/api/v1/users/', json={
            'first_name': 'Old', 'last_name': 'Name',
            'email': 'old@example.com', 'password': 'secret'
        }).get_json()
        token = get_token(self.client, 'old@example.com', 'secret')
        res = self.client.put(
            f'/api/v1/users/{created["id"]}',
            json={'first_name': 'New', 'last_name': 'Name'},
            headers=auth_header(token)
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['first_name'], 'New')

    def test_update_user_without_token(self):
        """PUT without JWT must return 401."""
        created = self.client.post('/api/v1/users/', json={
            'first_name': 'Test', 'last_name': 'User',
            'email': 'noauth@example.com', 'password': 'secret'
        }).get_json()
        res = self.client.put(
            f'/api/v1/users/{created["id"]}',
            json={'first_name': 'New', 'last_name': 'Name'}
        )
        self.assertEqual(res.status_code, 401)

    def test_update_user_unauthorized(self):
        """User cannot update another user's profile → 403."""
        user1 = self.client.post('/api/v1/users/', json={
            'first_name': 'User', 'last_name': 'One',
            'email': 'user1@example.com', 'password': 'secret'
        }).get_json()
        self.client.post('/api/v1/users/', json={
            'first_name': 'User', 'last_name': 'Two',
            'email': 'user2@example.com', 'password': 'secret'
        })
        token2 = get_token(self.client, 'user2@example.com', 'secret')
        res = self.client.put(
            f'/api/v1/users/{user1["id"]}',
            json={'first_name': 'Hacked', 'last_name': 'Name'},
            headers=auth_header(token2)
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn('error', res.get_json())

    def test_update_user_cannot_change_email(self):
        """Sending email in PUT payload must return 400."""
        created = self.client.post('/api/v1/users/', json={
            'first_name': 'Test', 'last_name': 'User',
            'email': 'changeme@example.com', 'password': 'secret'
        }).get_json()
        token = get_token(self.client, 'changeme@example.com', 'secret')
        # user_update_model (validate=True) only allows first_name/last_name
        # The business-logic guard catches email anyway
        res = self.client.put(
            f'/api/v1/users/{created["id"]}',
            json={'first_name': 'Test', 'last_name': 'User',
                  'email': 'new@example.com'},
            headers=auth_header(token)
        )
        self.assertIn(res.status_code, [400, 422])

    def test_update_user_not_found_without_token(self):
        """PUT on nonexistent user without JWT must return 401."""
        res = self.client.put('/api/v1/users/nonexistent-id',
                              json={'first_name': 'X', 'last_name': 'Y'})
        self.assertEqual(res.status_code, 401)


# ─────────────────────────────────────────────────────────────────────────────
# Amenity tests  (no JWT required)
# ─────────────────────────────────────────────────────────────────────────────

class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

    # ── POST /api/v1/amenities/ ───────────────────────────────────────────────

    def test_create_amenity(self):
        res = self.client.post('/api/v1/amenities/', json={'name': 'Wi-Fi'})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['name'], 'Wi-Fi')

    def test_create_amenity_empty_name(self):
        res = self.client.post('/api/v1/amenities/', json={'name': ''})
        self.assertEqual(res.status_code, 400)

    def test_create_amenity_name_too_long(self):
        res = self.client.post('/api/v1/amenities/', json={'name': 'A' * 51})
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/amenities/ ────────────────────────────────────────────────

    def test_get_amenities_empty(self):
        res = self.client.get('/api/v1/amenities/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    # ── GET /api/v1/amenities/<id> ────────────────────────────────────────────

    def test_get_amenity_by_id(self):
        created = self.client.post(
            '/api/v1/amenities/', json={'name': 'Pool'}
        ).get_json()
        res = self.client.get(f'/api/v1/amenities/{created["id"]}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['name'], 'Pool')

    def test_get_amenity_not_found(self):
        res = self.client.get('/api/v1/amenities/nonexistent-id')
        self.assertEqual(res.status_code, 404)

    # ── PUT /api/v1/amenities/<id> ────────────────────────────────────────────

    def test_update_amenity(self):
        created = self.client.post(
            '/api/v1/amenities/', json={'name': 'Old'}
        ).get_json()
        res = self.client.put(f'/api/v1/amenities/{created["id"]}',
                              json={'name': 'New'})
        self.assertEqual(res.status_code, 200)

    def test_update_amenity_not_found(self):
        res = self.client.put('/api/v1/amenities/nonexistent-id',
                              json={'name': 'X'})
        self.assertEqual(res.status_code, 404)

    def test_update_amenity_empty_name(self):
        created = self.client.post(
            '/api/v1/amenities/', json={'name': 'Valid'}
        ).get_json()
        res = self.client.put(f'/api/v1/amenities/{created["id"]}',
                              json={'name': ''})
        self.assertEqual(res.status_code, 400)


# ─────────────────────────────────────────────────────────────────────────────
# Place tests
# ─────────────────────────────────────────────────────────────────────────────

class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

        # Create the owner and obtain a JWT token
        owner = self.client.post('/api/v1/users/', json={
            'first_name': 'Owner', 'last_name': 'User',
            'email': 'owner@example.com', 'password': 'secret'
        }).get_json()
        self.user_id = owner['id']
        self.owner_token = get_token(self.client, 'owner@example.com', 'secret')

        amenity = self.client.post(
            '/api/v1/amenities/', json={'name': 'Wi-Fi'}
        ).get_json()
        self.amenity_id = amenity['id']

        self.place_payload = {
            'title': 'Cozy Apartment',
            'description': 'Nice place',
            'price': 100.0,
            'latitude': 37.7749,
            'longitude': -122.4194,
            'owner_id': self.user_id,
            'amenities': [self.amenity_id]
        }

    # ── POST /api/v1/places/ ──────────────────────────────────────────────────

    def test_create_place(self):
        res = self.client.post('/api/v1/places/', json=self.place_payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['title'], 'Cozy Apartment')
        self.assertEqual(data['price'], 100.0)

    def test_create_place_without_token(self):
        """POST /places/ without JWT must return 401."""
        res = self.client.post('/api/v1/places/', json=self.place_payload)
        self.assertEqual(res.status_code, 401)

    def test_create_place_owner_set_from_jwt(self):
        """owner_id in payload is ignored; JWT user becomes the owner."""
        payload = {**self.place_payload, 'owner_id': 'fake-id'}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.get_json()['owner_id'], self.user_id)

    def test_create_place_invalid_price(self):
        payload = {**self.place_payload, 'price': -10}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 400)

    def test_create_place_price_zero(self):
        payload = {**self.place_payload, 'price': 0}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 201)

    def test_create_place_invalid_latitude(self):
        payload = {**self.place_payload, 'latitude': 91}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_longitude(self):
        payload = {**self.place_payload, 'longitude': 181}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_amenity(self):
        payload = {**self.place_payload, 'amenities': ['fake-amenity-id']}
        res = self.client.post('/api/v1/places/', json=payload,
                               headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/places/ (public) ──────────────────────────────────────────

    def test_get_places_empty(self):
        res = self.client.get('/api/v1/places/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_places_after_create(self):
        self.client.post('/api/v1/places/', json=self.place_payload,
                         headers=auth_header(self.owner_token))
        res = self.client.get('/api/v1/places/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/places/<id> (public) ──────────────────────────────────────

    def test_get_place_by_id(self):
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload,
            headers=auth_header(self.owner_token)
        ).get_json()
        res = self.client.get(f'/api/v1/places/{created["id"]}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('owner', data)
        self.assertIn('amenities', data)
        self.assertIn('reviews', data)
        self.assertEqual(data['owner']['id'], self.user_id)

    def test_get_place_not_found(self):
        res = self.client.get('/api/v1/places/nonexistent-id')
        self.assertEqual(res.status_code, 404)

    # ── PUT /api/v1/places/<id> ───────────────────────────────────────────────

    def test_update_place(self):
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload,
            headers=auth_header(self.owner_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, 'title': 'Updated'},
            headers=auth_header(self.owner_token)
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['title'], 'Updated')

    def test_update_place_without_token(self):
        """PUT /places/<id> without JWT must return 401."""
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload,
            headers=auth_header(self.owner_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, 'title': 'Updated'}
        )
        self.assertEqual(res.status_code, 401)

    def test_update_place_unauthorized(self):
        """User cannot update a place they do not own → 403."""
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload,
            headers=auth_header(self.owner_token)
        ).get_json()

        # Create a second user (non-owner)
        self.client.post('/api/v1/users/', json={
            'first_name': 'Other', 'last_name': 'User',
            'email': 'other@example.com', 'password': 'secret'
        })
        other_token = get_token(self.client, 'other@example.com', 'secret')

        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, 'title': 'Hijacked'},
            headers=auth_header(other_token)
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn('error', res.get_json())

    def test_update_place_not_found(self):
        res = self.client.put(
            '/api/v1/places/nonexistent-id', json=self.place_payload,
            headers=auth_header(self.owner_token)
        )
        self.assertEqual(res.status_code, 404)

    def test_update_place_invalid_price(self):
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload,
            headers=auth_header(self.owner_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, 'price': -5},
            headers=auth_header(self.owner_token)
        )
        self.assertEqual(res.status_code, 400)


# ─────────────────────────────────────────────────────────────────────────────
# Review tests
# ─────────────────────────────────────────────────────────────────────────────

class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

        # Place owner
        owner = self.client.post('/api/v1/users/', json={
            'first_name': 'Owner', 'last_name': 'User',
            'email': 'owner@example.com', 'password': 'secret'
        }).get_json()
        self.owner_id = owner['id']
        self.owner_token = get_token(self.client, 'owner@example.com', 'secret')

        # Reviewer (a different user — cannot review their own place)
        reviewer = self.client.post('/api/v1/users/', json={
            'first_name': 'Reviewer', 'last_name': 'User',
            'email': 'reviewer@example.com', 'password': 'secret'
        }).get_json()
        self.reviewer_id = reviewer['id']
        self.reviewer_token = get_token(
            self.client, 'reviewer@example.com', 'secret')

        # Create the place with the owner's token
        place = self.client.post('/api/v1/places/', json={
            'title': 'Test Place', 'description': 'desc',
            'price': 50.0, 'latitude': 10.0, 'longitude': 10.0,
            'owner_id': self.owner_id, 'amenities': []
        }, headers=auth_header(self.owner_token)).get_json()
        self.place_id = place['id']

        self.review_payload = {
            'text': 'Great stay!',
            'rating': 5,
            'user_id': self.reviewer_id,
            'place_id': self.place_id
        }

    # ── POST /api/v1/reviews/ ─────────────────────────────────────────────────

    def test_create_review(self):
        res = self.client.post('/api/v1/reviews/', json=self.review_payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['rating'], 5)
        self.assertEqual(data['user_id'], self.reviewer_id)
        self.assertEqual(data['place_id'], self.place_id)

    def test_create_review_without_token(self):
        """POST /reviews/ without JWT must return 401."""
        res = self.client.post('/api/v1/reviews/', json=self.review_payload)
        self.assertEqual(res.status_code, 401)

    def test_create_review_own_place(self):
        """Owner cannot review their own place → 400."""
        res = self.client.post('/api/v1/reviews/', json={
            **self.review_payload, 'user_id': self.owner_id
        }, headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.get_json())

    def test_create_review_duplicate(self):
        """Reviewer cannot review the same place twice → 400."""
        self.client.post('/api/v1/reviews/', json=self.review_payload,
                         headers=auth_header(self.reviewer_token))
        res = self.client.post('/api/v1/reviews/', json=self.review_payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_rating_too_high(self):
        payload = {**self.review_payload, 'rating': 6}
        res = self.client.post('/api/v1/reviews/', json=payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_rating_zero(self):
        payload = {**self.review_payload, 'rating': 0}
        res = self.client.post('/api/v1/reviews/', json=payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_place(self):
        payload = {**self.review_payload, 'place_id': 'fake-place-id'}
        res = self.client.post('/api/v1/reviews/', json=payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 404)

    def test_create_review_empty_text(self):
        payload = {**self.review_payload, 'text': ''}
        res = self.client.post('/api/v1/reviews/', json=payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 400)

    def test_create_review_boundary_rating_1(self):
        payload = {**self.review_payload, 'rating': 1}
        res = self.client.post('/api/v1/reviews/', json=payload,
                               headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 201)

    # ── GET /api/v1/reviews/ (public) ─────────────────────────────────────────

    def test_get_reviews_empty(self):
        res = self.client.get('/api/v1/reviews/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_reviews_after_create(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload,
                         headers=auth_header(self.reviewer_token))
        res = self.client.get('/api/v1/reviews/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/reviews/<id> (public) ─────────────────────────────────────

    def test_get_review_by_id(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.get(f'/api/v1/reviews/{created["id"]}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['text'], 'Great stay!')
        self.assertEqual(data['rating'], 5)

    def test_get_review_not_found(self):
        res = self.client.get('/api/v1/reviews/nonexistent-id')
        self.assertEqual(res.status_code, 404)

    # ── PUT /api/v1/reviews/<id> ──────────────────────────────────────────────

    def test_update_review(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, 'text': 'Updated', 'rating': 3},
            headers=auth_header(self.reviewer_token)
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['text'], 'Updated')

    def test_update_review_without_token(self):
        """PUT /reviews/<id> without JWT must return 401."""
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, 'text': 'Updated'}
        )
        self.assertEqual(res.status_code, 401)

    def test_update_review_unauthorized(self):
        """Owner cannot update a review that belongs to reviewer → 403."""
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, 'text': 'Tampered'},
            headers=auth_header(self.owner_token)
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn('error', res.get_json())

    def test_update_review_invalid_rating(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, 'rating': 10},
            headers=auth_header(self.reviewer_token)
        )
        self.assertEqual(res.status_code, 400)

    def test_update_review_not_found(self):
        res = self.client.put(
            '/api/v1/reviews/nonexistent-id', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        )
        self.assertEqual(res.status_code, 404)

    # ── DELETE /api/v1/reviews/<id> ───────────────────────────────────────────

    def test_delete_review(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.delete(f'/api/v1/reviews/{created["id"]}',
                                 headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(),
                         {'message': 'Review deleted successfully'})

    def test_delete_review_without_token(self):
        """DELETE /reviews/<id> without JWT must return 401."""
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.delete(f'/api/v1/reviews/{created["id"]}')
        self.assertEqual(res.status_code, 401)

    def test_delete_review_unauthorized(self):
        """Owner cannot delete reviewer's review → 403."""
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        res = self.client.delete(f'/api/v1/reviews/{created["id"]}',
                                 headers=auth_header(self.owner_token))
        self.assertEqual(res.status_code, 403)

    def test_delete_review_then_get_404(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload,
            headers=auth_header(self.reviewer_token)
        ).get_json()
        self.client.delete(f'/api/v1/reviews/{created["id"]}',
                           headers=auth_header(self.reviewer_token))
        res = self.client.get(f'/api/v1/reviews/{created["id"]}')
        self.assertEqual(res.status_code, 404)

    def test_delete_review_not_found(self):
        res = self.client.delete('/api/v1/reviews/nonexistent-id',
                                 headers=auth_header(self.reviewer_token))
        self.assertEqual(res.status_code, 404)

    # ── GET /api/v1/places/<id>/reviews (public) ──────────────────────────────

    def test_get_reviews_by_place(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload,
                         headers=auth_header(self.reviewer_token))
        # Second reviewer
        reviewer2 = self.client.post('/api/v1/users/', json={
            'first_name': 'Second', 'last_name': 'Reviewer',
            'email': 'reviewer2@example.com', 'password': 'secret'
        }).get_json()
        token2 = get_token(self.client, 'reviewer2@example.com', 'secret')
        self.client.post('/api/v1/reviews/', json={
            **self.review_payload,
            'user_id': reviewer2['id'],
            'text': 'Second review', 'rating': 4
        }, headers=auth_header(token2))
        res = self.client.get(f'/api/v1/places/{self.place_id}/reviews')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 2)

    def test_get_reviews_by_place_not_found(self):
        res = self.client.get('/api/v1/places/nonexistent-id/reviews')
        self.assertEqual(res.status_code, 404)

    def test_place_detail_includes_reviews(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload,
                         headers=auth_header(self.reviewer_token))
        res = self.client.get(f'/api/v1/places/{self.place_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('reviews', data)
        self.assertEqual(len(data['reviews']), 1)


if __name__ == '__main__':
    unittest.main()
