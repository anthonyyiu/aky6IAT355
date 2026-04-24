import json
import csv
from pathlib import Path

base = Path('.').resolve()
csv_path = base / 'data' / 'combined_races_fixed_v2.csv'
json_path = base / 'data' / 'racecourses.json'

with csv_path.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    dataset_courses = {row['course'].strip() for row in reader if row.get('course')}

with json_path.open(encoding='utf-8') as f:
    map_courses = json.load(f)

map_names = [course['name'].strip() for course in map_courses if 'name' in course]
map_set = set(map_names)

in_map_not_data = sorted([name for name in map_set if name not in dataset_courses])
in_data_not_map = sorted([name for name in dataset_courses if name not in map_set])

print('dataset courses:', len(dataset_courses))
print('map courses:', len(map_names))
print('map-only courses:', len(in_map_not_data))
for name in in_map_not_data:
    print('  ', name)
print('data-only courses:', len(in_data_not_map))
for name in in_data_not_map[:50]:
    print('  ', name)

# Optionally generate a cleaned racecourses.json file with only dataset courses
cleaned = [course for course in map_courses if course.get('name', '').strip() in dataset_courses]
cleaned_path = base / 'data' / 'racecourses_cleaned.json'
with cleaned_path.open('w', encoding='utf-8') as f:
    json.dump(cleaned, f, indent=2, ensure_ascii=False)
print('Cleaned racecourses written to', cleaned_path)
