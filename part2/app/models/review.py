from models.base_model import BaseModel


class Review(BaseModel):
    def __init__(self, user, place, comment, rating):
        super().__init__()
        if not user:
            raise ValueError("User ID is required")
        if not place:
            raise ValueError("Place ID is required")
        if not comment or len(comment) > 500:
            raise ValueError("Comment is required and must be 500 characters max")
        if rating is None or not (1 <= rating <= 5):
            raise ValueError("Rating is required and must be between 1 and 5")
        

        self.user = user
        self.place = place
        self.comment = comment
        self.rating = rating
