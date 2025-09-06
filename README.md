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

## Локальный просмотр
python3 -m http.server 8000
затем открыть http://localhost:8000

GitHub Pages: Deploy from branch → ветка maplibre → (root).

Лицензия: MIT
