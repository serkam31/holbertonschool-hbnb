from app.models.base_model import BaseModel


class Review(BaseModel):
    def __init__(self, text, rating, place, user):
        super().__init__()
        if not text:
            raise ValueError("Text is required")
        if not place:
            raise ValueError("Place is required")
        if not user:
            raise ValueError("User is required")
        if rating is None or not (1 <= rating <= 5):
            raise ValueError("Rating is required and must be between 1 and 5")

        self.text = text
        self.rating = rating
        self.place = place
        self.user = user
