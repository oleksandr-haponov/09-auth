// types/user.ts

/**
 * Унифицированный тип пользователя.
 * Часть эндпоинтов может отдавать `_id`, часть — `id`;
 * аватар может называться `avatar` или `avatarUrl`.
 */
export interface User {
  /** Идентификатор (может приходить как `_id` или `id`) */
  _id?: string;
  id?: string;

  /** Email — обязательный */
  email: string;

  /** Имя пользователя (по ТЗ редактируем именно это поле) */
  username?: string | null;

  /** Произвольное имя, если бэкенд его возвращает */
  name?: string | null;

  /** URL аватара (может приходить под разными ключами) */
  avatar?: string | null;
  avatarUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;
}
