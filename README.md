# Parking Map 2025

Живая карта загруженности платных парковок Москвы (MapLibre GL, GitHub Pages).

Демо: https://smancoding.github.io/parking-map-2025/

## Входные данные (`data-in/`)

Все входные файлы кладём в папку `data-in/` с фиксированными именами:

- `data-in/zones.geojson` — геометрия зон (GeoJSON, FeatureCollection).
- `data-in/zones_meta.json` — метаданные зон (JSON-объект: ключ — код зоны):
  ```json
  { "0301": { "center": [37.6201, 55.7535], "capacity": 125 } }

cat > README.md <<'EOF'
# Parking Map 2025

Интерактивная карта загруженности платных парковок Москвы (MapLibre GL + GitHub Pages).

Демо: https://smancoding.github.io/parking-map-2025/

## Входные файлы (папка `data-in/`)

Кладите данные сюда, имена фиксированы:

- `data-in/zones.geojson` — границы зон (GeoJSON, FeatureCollection).
- `data-in/zones_meta.json` — метаданные зон (JSON-объект по коду зоны):
  ```json
  { "0301": { "center": [37.6201, 55.7535], "capacity": 125 } }

cat > README.md <<'EOF'
# Parking Map 2025

Интерактивная карта загруженности платных парковок Москвы (MapLibre GL + GitHub Pages).  
Демо: https://smancoding.github.io/parking-map-2025/

## Структура данных

Все входные файлы кладём в папку **data-in/** строго с такими именами:

- data-in/zones.geojson — границы зон, GeoJSON FeatureCollection (WGS84).
- data-in/zones_meta.json — метаданные зон (ключ — код зоны):
  {
    "0301": { "center": [37.6201, 55.7535], "capacity": 125 }
  }
- data-in/avg_2025.csv — средняя загруженность по часам:
  zone,dow,hour,avg
  0301,1,10,2.75
  где dow = 1..7 (Пн..Вс), hour = 8..20.
- data-in/tariffs.json — тариф ₽/час по зонам:
  { "0301": 380, "0304": 150, "0401": 450 }

Если для зоны нет значения в tariffs.json или zones_meta.json, подписи скрываются.

## Обновить данные
git add data-in
git commit -m "data: update inputs"
git push

## Собрать tariffs.json из XLSX (один раз на обновление тарифов)
python3 build_tariffs.py "/полный/путь/к/data-623-2025-07-15 2.xlsx"
git add data-in/tariffs.json
git commit -m "data: update tariffs"
git push

## Локальный просмотр
python3 -m http.server 8000
# затем открыть http://localhost:8000

GitHub Pages: Deploy from branch → ветка maplibre → (root).  
Лицензия: MIT
