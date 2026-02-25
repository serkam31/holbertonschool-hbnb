from app.models.base_model import BaseModel


class Review(BaseModel):
<<<<<<< HEAD
    def __init__(self, user, place, text, rating):
=======
    def __init__(self, text, rating, place, user):
>>>>>>> 8e419b1273bb50c73e254b5dc50497f4987922c8
        super().__init__()
        if not text:
            raise ValueError("Text is required")
        if not place:
<<<<<<< HEAD
            raise ValueError("Place ID is required")
        if not text:
            raise ValueError("Text is required")
        if rating is None or not (1 <= rating <= 5):
            raise ValueError("Rating is required and must be between 1 and 5")

        self.user = user
        self.place = place
=======
            raise ValueError("Place is required")
        if not user:
            raise ValueError("User is required")
        if rating is None or not (1 <= rating <= 5):
            raise ValueError("Rating is required and must be between 1 and 5")

>>>>>>> 8e419b1273bb50c73e254b5dc50497f4987922c8
        self.text = text
        self.rating = rating
        self.place = place
        self.user = user
