import psycopg2
from transformer.data_cleaner import clean_data
from loader.s3_loader import load_from_s3

def write_to_db(data):
    print("Writing to DB...")
    conn = psycopg2.connect("dbname=test user=postgres password=postgres")
    cur = conn.cursor()
    for row in data:
        cur.execute("INSERT INTO records (id, active) VALUES (%s, %s)", (row["id"], row["active"]))
    conn.commit()
    conn.close()

def main():
    raw = load_from_s3("demo-bucket", "input.json")
    data = clean_data(raw)
    write_to_db(data)

if __name__ == "__main__":
    main()
