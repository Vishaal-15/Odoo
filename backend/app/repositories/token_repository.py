from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken
from app.repositories.base import BaseRepository


class TokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: Session):
        super().__init__(RefreshToken, db)

    def create_token(self, user_id: int, token_hash: str, expires_at: datetime) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_revoked=False,
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_active_token(self, token_hash: str) -> Optional[RefreshToken]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,
                RefreshToken.expires_at > now,
            )
            .first()
        )

    def revoke_token(self, token_hash: str) -> bool:
        token = self.db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if token and not token.is_revoked:
            token.is_revoked = True
            token.revoked_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def revoke_all_user_tokens(self, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        count = (
            self.db.query(RefreshToken)
            .filter(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)
            .update({"is_revoked": True, "revoked_at": now})
        )
        self.db.commit()
        return count
