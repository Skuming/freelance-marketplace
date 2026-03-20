# Гайд

### Зайти в админку

```
Email: admin@freelance.local
Пароль: Admin123!Secure
```

### Тест данные

#### Фрилансер

```
Email: freelancer@freelance.local
Пароль: Freelancer123!Secure
```

#### Заказчик

```
Email: customer@freelance.local
Пароль: Customer123!Secure
```

## Деплой на Vercel (без ручной Build Command)

1. Подключи репозиторий в Vercel.
2. В `Project Settings -> Environment Variables` добавь:
   - `DATABASE_URL` (лучше использовать pooled URL от провайдера Postgres)
   - `AUTH_SECRET` (длинная случайная строка)
   - `NEXTAUTH_URL` (`https://<project>.vercel.app` или ваш домен)
3. Ничего в `Build Command` менять не нужно: `npm run build` уже выполняет `prisma generate`, `prisma migrate deploy`, `next build`.
4. `Install Command` оставь стандартным (`npm install`).
5. `Output Directory` не задавай (по умолчанию для Next.js).

## Полезные команды

```bash
npm run dev
npm run build
npm run start
npm run db:migrate:deploy
npm run db:seed
```

## Примечание по чату

Для Vercel чат работает через HTTP polling (без WebSocket custom server). Это сделано, чтобы деплой был стабильным в serverless-среде.
