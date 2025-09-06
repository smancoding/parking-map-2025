# Parking Map 2025
Живая карта загруженности платных парковок Москвы.
Демо: https://smancoding.github.io/parking-map-2025/

## Технологии
- MapLibre GL JS
- GitHub Pages (ветка maplibre)
- Тайлы: CARTO / OpenStreetMap

## Что есть
- Линии улиц платных парковок
- Круги зон с цветом по средней загрузке
- Число в круге — тариф ₽/час (если есть)
- Тултип: номер зоны, вместимость, средняя загрузка

## Структура
data-in/
  avg_2025.csv
  zones.geojson
  zones_meta.json
  tariffs.json
index.html
app.js
build_tariffs.py

## Локальный запуск
python3 -m http.server 8000
Открыть http://localhost:8000

## Обновление данных
git add -A
git commit -m "data: update"
git push

## Тарифы
python3 build_tariffs.py "/полный/путь/к/data-623-2025-07-15 2.xlsx"
git add data-in/tariffs.json
git commit -m "data: update tariffs"
git push

## Ветка и Pages
- Основная ветка: maplibre
- Pages: Deploy from a branch → maplibre / (root)

## Лицензия
MIT
