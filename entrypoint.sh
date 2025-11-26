#!/bin/sh

echo "Waiting for DB..."
until nc -z db 5432; do
  sleep 1
done

npm run migrate
npm run seed-admin
npm start
