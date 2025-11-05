import json

def clean_data(raw):
    print("Cleaning data...")
    records = json.loads(raw)
    cleaned = [r for r in records if r.get("active", True)]
    return cleaned

if __name__ == "__main__":
    sample = '[{"id":1,"active":true},{"id":2,"active":false}]'
    print(clean_data(sample))
