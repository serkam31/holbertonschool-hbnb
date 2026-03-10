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


class TestUserEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

    # ── POST /api/v1/users/ ───────────────────────────────────────────────────

    def test_create_user(self):
        res = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['first_name'], 'John')
        self.assertEqual(data['email'], 'john.doe@example.com')

    def test_create_user_duplicate_email(self):
        payload = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com"
        }
        self.client.post('/api/v1/users/', json=payload)
        res = self.client.post('/api/v1/users/', json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn('error', res.get_json())

    def test_create_user_invalid_email(self):
        res = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "not-an-email"
        })
        self.assertEqual(res.status_code, 400)

    def test_create_user_empty_first_name(self):
        res = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "Doe",
            "email": "john@example.com"
        })
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/users/ ────────────────────────────────────────────────────

    def test_get_users_empty(self):
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_users_after_create(self):
        self.client.post('/api/v1/users/', json={
            "first_name": "Alice",
            "last_name": "Smith",
            "email": "alice@example.com"
        })
        res = self.client.get('/api/v1/users/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/users/<id> ────────────────────────────────────────────────

    def test_get_user_by_id(self):
        created = self.client.post('/api/v1/users/', json={
            "first_name": "Bob",
            "last_name": "Martin",
            "email": "bob@example.com"
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
            "first_name": "Old",
            "last_name": "Name",
            "email": "old@example.com"
        }).get_json()
        res = self.client.put(f'/api/v1/users/{created["id"]}', json={
            "first_name": "New",
            "last_name": "Name",
            "email": "new@example.com"
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()['first_name'], 'New')

    def test_update_user_not_found(self):
        res = self.client.put('/api/v1/users/nonexistent-id', json={
            "first_name": "X",
            "last_name": "Y",
            "email": "x@example.com"
        })
        self.assertEqual(res.status_code, 404)

    def test_update_user_invalid_email(self):
        created = self.client.post('/api/v1/users/', json={
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com"
        }).get_json()
        res = self.client.put(f'/api/v1/users/{created["id"]}', json={
            "first_name": "Test",
            "last_name": "User",
            "email": "bad-email"
        })
        self.assertEqual(res.status_code, 400)


class TestAmenityEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()

    # ── POST /api/v1/amenities/ ───────────────────────────────────────────────

    def test_create_amenity(self):
        res = self.client.post('/api/v1/amenities/', json={"name": "Wi-Fi"})
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['name'], 'Wi-Fi')

    def test_create_amenity_empty_name(self):
        res = self.client.post('/api/v1/amenities/', json={"name": ""})
        self.assertEqual(res.status_code, 400)

    def test_create_amenity_name_too_long(self):
        res = self.client.post(
            '/api/v1/amenities/', json={"name": "A" * 51})
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/amenities/ ────────────────────────────────────────────────

    def test_get_amenities_empty(self):
        res = self.client.get('/api/v1/amenities/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    # ── GET /api/v1/amenities/<id> ────────────────────────────────────────────

    def test_get_amenity_by_id(self):
        created = self.client.post(
            '/api/v1/amenities/', json={"name": "Pool"}
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
            '/api/v1/amenities/', json={"name": "Old"}
        ).get_json()
        res = self.client.put(
            f'/api/v1/amenities/{created["id"]}',
            json={"name": "New"}
        )
        self.assertEqual(res.status_code, 200)

    def test_update_amenity_not_found(self):
        res = self.client.put(
            '/api/v1/amenities/nonexistent-id', json={"name": "X"})
        self.assertEqual(res.status_code, 404)

    def test_update_amenity_empty_name(self):
        created = self.client.post(
            '/api/v1/amenities/', json={"name": "Valid"}
        ).get_json()
        res = self.client.put(
            f'/api/v1/amenities/{created["id"]}', json={"name": ""})
        self.assertEqual(res.status_code, 400)


class TestPlaceEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()
        user = self.client.post('/api/v1/users/', json={
            "first_name": "Owner",
            "last_name": "User",
            "email": "owner@example.com"
        }).get_json()
        self.user_id = user['id']
        amenity = self.client.post(
            '/api/v1/amenities/', json={"name": "Wi-Fi"}
        ).get_json()
        self.amenity_id = amenity['id']
        self.place_payload = {
            "title": "Cozy Apartment",
            "description": "Nice place",
            "price": 100.0,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "owner_id": self.user_id,
            "amenities": [self.amenity_id]
        }

    # ── POST /api/v1/places/ ──────────────────────────────────────────────────

    def test_create_place(self):
        res = self.client.post('/api/v1/places/', json=self.place_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['title'], 'Cozy Apartment')
        self.assertEqual(data['price'], 100.0)

    def test_create_place_invalid_price(self):
        payload = {**self.place_payload, "price": -10}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_place_price_zero(self):
        payload = {**self.place_payload, "price": 0}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 201)

    def test_create_place_invalid_latitude(self):
        payload = {**self.place_payload, "latitude": 91}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_longitude(self):
        payload = {**self.place_payload, "longitude": 181}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_owner(self):
        payload = {**self.place_payload, "owner_id": "fake-id"}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_amenity(self):
        payload = {**self.place_payload, "amenities": ["fake-amenity-id"]}
        res = self.client.post('/api/v1/places/', json=payload)
        self.assertEqual(res.status_code, 400)

    # ── GET /api/v1/places/ ───────────────────────────────────────────────────

    def test_get_places_empty(self):
        res = self.client.get('/api/v1/places/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_places_after_create(self):
        self.client.post('/api/v1/places/', json=self.place_payload)
        res = self.client.get('/api/v1/places/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/places/<id> ───────────────────────────────────────────────

    def test_get_place_by_id(self):
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload
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
            '/api/v1/places/', json=self.place_payload
        ).get_json()
        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, "title": "Updated"}
        )
        self.assertEqual(res.status_code, 200)

    def test_update_place_not_found(self):
        res = self.client.put(
            '/api/v1/places/nonexistent-id', json=self.place_payload)
        self.assertEqual(res.status_code, 404)

    def test_update_place_invalid_price(self):
        created = self.client.post(
            '/api/v1/places/', json=self.place_payload
        ).get_json()
        res = self.client.put(
            f'/api/v1/places/{created["id"]}',
            json={**self.place_payload, "price": -5}
        )
        self.assertEqual(res.status_code, 400)


class TestReviewEndpoints(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        reset_facade()
        self.client = self.app.test_client()
        user = self.client.post('/api/v1/users/', json={
            "first_name": "Reviewer",
            "last_name": "User",
            "email": "reviewer@example.com"
        }).get_json()
        self.user_id = user['id']
        place = self.client.post('/api/v1/places/', json={
            "title": "Test Place",
            "description": "desc",
            "price": 50.0,
            "latitude": 10.0,
            "longitude": 10.0,
            "owner_id": self.user_id,
            "amenities": []
        }).get_json()
        self.place_id = place['id']
        self.review_payload = {
            "text": "Great stay!",
            "rating": 5,
            "user_id": self.user_id,
            "place_id": self.place_id
        }

    # ── POST /api/v1/reviews/ ─────────────────────────────────────────────────

    def test_create_review(self):
        res = self.client.post('/api/v1/reviews/', json=self.review_payload)
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['rating'], 5)
        self.assertEqual(data['user_id'], self.user_id)
        self.assertEqual(data['place_id'], self.place_id)

    def test_create_review_invalid_rating_too_high(self):
        payload = {**self.review_payload, "rating": 6}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_rating_zero(self):
        payload = {**self.review_payload, "rating": 0}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_user(self):
        payload = {**self.review_payload, "user_id": "fake-user-id"}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_review_invalid_place(self):
        payload = {**self.review_payload, "place_id": "fake-place-id"}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_review_empty_text(self):
        payload = {**self.review_payload, "text": ""}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 400)

    def test_create_review_boundary_rating_1(self):
        payload = {**self.review_payload, "rating": 1}
        res = self.client.post('/api/v1/reviews/', json=payload)
        self.assertEqual(res.status_code, 201)

    # ── GET /api/v1/reviews/ ──────────────────────────────────────────────────

    def test_get_reviews_empty(self):
        res = self.client.get('/api/v1/reviews/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json(), [])

    def test_get_reviews_after_create(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload)
        res = self.client.get('/api/v1/reviews/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 1)

    # ── GET /api/v1/reviews/<id> ──────────────────────────────────────────────

    def test_get_review_by_id(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload
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
            '/api/v1/reviews/', json=self.review_payload
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, "text": "Updated", "rating": 3}
        )
        self.assertEqual(res.status_code, 200)

    def test_update_review_invalid_rating(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload
        ).get_json()
        res = self.client.put(
            f'/api/v1/reviews/{created["id"]}',
            json={**self.review_payload, "rating": 10}
        )
        self.assertEqual(res.status_code, 400)

    def test_update_review_not_found(self):
        res = self.client.put(
            '/api/v1/reviews/nonexistent-id', json=self.review_payload)
        self.assertEqual(res.status_code, 404)

    # ── DELETE /api/v1/reviews/<id> ───────────────────────────────────────────

    def test_delete_review(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload
        ).get_json()
        res = self.client.delete(f'/api/v1/reviews/{created["id"]}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.get_json(), {'message': 'Review deleted successfully'})

    def test_delete_review_then_get_404(self):
        created = self.client.post(
            '/api/v1/reviews/', json=self.review_payload
        ).get_json()
        self.client.delete(f'/api/v1/reviews/{created["id"]}')
        res = self.client.get(f'/api/v1/reviews/{created["id"]}')
        self.assertEqual(res.status_code, 404)

    def test_delete_review_not_found(self):
        res = self.client.delete('/api/v1/reviews/nonexistent-id')
        self.assertEqual(res.status_code, 404)

    # ── GET /api/v1/places/<id>/reviews ──────────────────────────────────────

    def test_get_reviews_by_place(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload)
        self.client.post('/api/v1/reviews/', json={
            **self.review_payload, "text": "Second review", "rating": 4
        })
        res = self.client.get(f'/api/v1/places/{self.place_id}/reviews')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.get_json()), 2)

    def test_get_reviews_by_place_not_found(self):
        res = self.client.get('/api/v1/places/nonexistent-id/reviews')
        self.assertEqual(res.status_code, 404)

    def test_place_detail_includes_reviews(self):
        self.client.post('/api/v1/reviews/', json=self.review_payload)
        res = self.client.get(f'/api/v1/places/{self.place_id}')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('reviews', data)
        self.assertEqual(len(data['reviews']), 1)


if __name__ == '__main__':
    unittest.main()
