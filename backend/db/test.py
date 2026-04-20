import sqlite3

# Connect to the database (creates it if it doesn't exist)
conn = sqlite3.connect('workflow.db')  # Use ':memory:' for an in-memory DB

# Create a cursor object
cursor = conn.cursor()

# Example: Create a table
cursor.execute('SELECT * FROM workflows')
rows = cursor.fetchall()
# for row in rows:
#     print(row)
#     print()

for row in rows:
    print("----")
    for idx, col in enumerate(cursor.description):
        print(f"{col[0]}: {row[idx]}")

# Commit changes and close the connection
conn.commit()
conn.close()