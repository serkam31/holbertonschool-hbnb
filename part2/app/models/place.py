from app.models.base_model import BaseModel


class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner):
        super().__init__()

        if not title or len(title) > 100:
            raise ValueError("Title is required and must be 100 characters max")
        if price is None or price < 0:
            raise ValueError("Price is required and must be a non-negative number")
        if latitude is None or not (-90 <= latitude <= 90):
            raise ValueError("Latitude is required and must be between -90 and 90")
        if longitude is None or not (-180 <= longitude <= 180):
            raise ValueError("Longitude is required and must be between -180 and 180")

        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []
        self.amenities = []

    def add_review(self, review):
        self.reviews.append(review)

    def add_amenity(self, amenity):
        self.amenities.append(amenity)
